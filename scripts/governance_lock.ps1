<#
.SYNOPSIS
  TBNY-DXOS 統治ファイル保護スクリプト (人間専用)

.DESCRIPTION
  AI による統治ファイルの書き換えを OS レベル (NTFS ACL) で防ぎます。
  UAC（管理者権限）を必須としているため、AI が CLI から自律的に実行・解除することはできません。

  拒否するのは「書き換え・追加・属性変更・削除」だけで、読み取りは妨げません。
  - 拒否の設定は .NET の ACL API で行います。icacls は指定した権限に関係なく拒否エントリにも
    Synchronize を付け加えるため、施錠対象が読めず、一覧や git も動かなくなります（旧版の不具合）。
  - ディレクトリには継承付きの拒否を 1 つだけ設定し、配下は自動で継承させます（再帰処理なし）。
  - 本番の施錠前に、一時ディレクトリで同じ拒否を試す自己テストを行い、失敗したら何も施錠しません。

.PARAMETER Action
  "Status" (状態確認のみ・既定) / "Lock" (施錠) / "Unlock" (解除)
#>

param (
    [ValidateSet("Status", "Lock", "Unlock")]
    [string]$Action = "Status"
)

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($Action -ne "Status" -and -not $isAdmin) {
    Write-Host "⚠️ 管理者権限が必要です。UACプロンプトで昇格します..." -ForegroundColor Yellow
    try {
        Start-Process pwsh -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Action $Action" -Verb RunAs
        exit
    } catch {
        Write-Error "昇格に失敗しました。"
        exit 1
    }
}

$WorkspaceRoot = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$TargetUser = "$env:USERDOMAIN\$env:USERNAME"

# 保護対象（ワークスペースからの相対パス）
$ProtectedPaths = @(
    "AGENTS.md",
    "CLAUDE.md",
    "package.json",
    "db\AGENTS.md",
    "governance",
    ".agents",
    ".claude",
    ".githooks",
    ".github"
)

# 拒否する権限（Synchronize・読み取り系は含めない）
$DenyRights = [Security.AccessControl.FileSystemRights]'WriteData, AppendData, WriteExtendedAttributes, WriteAttributes, Delete'
$DirDenyRights = $DenyRights -bor [Security.AccessControl.FileSystemRights]::DeleteSubdirectoriesAndFiles

$failures = New-Object System.Collections.Generic.List[string]

# --- ACL 操作 ---------------------------------------------------------------

function New-DenyRule([bool]$IsDir) {
    if ($IsDir) {
        return New-Object Security.AccessControl.FileSystemAccessRule($TargetUser, $DirDenyRights, 'ContainerInherit, ObjectInherit', 'None', 'Deny')
    }
    return New-Object Security.AccessControl.FileSystemAccessRule($TargetUser, $DenyRights, 'Deny')
}

# DACL（Access セクション）だけを読み書きする。所有者や監査設定には触れない
function Add-DenyRule([string]$Target) {
    $item = Get-Item -LiteralPath $Target -Force
    $isDir = $item -is [IO.DirectoryInfo]
    $acl = [IO.FileSystemAclExtensions]::GetAccessControl($item, [Security.AccessControl.AccessControlSections]::Access)
    $acl.AddAccessRule((New-DenyRule $isDir))
    [IO.FileSystemAclExtensions]::SetAccessControl($item, $acl)
}

# このユーザー宛ての明示的な拒否を取り除く（旧版が配下に付けた分も含めて除去）
# 解除は icacls で行う（拒否エントリの削除には Synchronize の問題がない。/t は親から先に処理される）
function Remove-Deny([string]$Target, [string]$RelPath) {
    $icaclsArgs = @($Target, "/remove:d", $TargetUser, "/c", "/q")
    if (Test-Path -LiteralPath $Target -PathType Container) { $icaclsArgs += "/t" }
    $out = & icacls @icaclsArgs 2>&1
    if ($LASTEXITCODE -ne 0) {
        $failures.Add("解除 $RelPath : 終了コード $LASTEXITCODE`n      $($out -join "`n      ")")
    }
}

# --- 検証 ---------------------------------------------------------------------

function Get-DenyRights([string]$Target) {
    try {
        return @((Get-Acl -LiteralPath $Target -ErrorAction Stop).Access |
            Where-Object { $_.AccessControlType -eq 'Deny' } |
            ForEach-Object { "$($_.FileSystemRights)$(if ($_.IsInherited) { '(継承)' })" })
    } catch {
        return @("ACL取得不可: $($_.Exception.Message)")
    }
}

# 配下ファイルの代表（ディレクトリは先頭 1 件、ファイルならそれ自身）。一覧できなければ例外
function Get-SampleFile([string]$Target) {
    if (Test-Path -LiteralPath $Target -PathType Container) {
        return (Get-ChildItem -LiteralPath $Target -Recurse -File -Force -ErrorAction Stop | Select-Object -First 1).FullName
    }
    return $Target
}

function Test-Readable([string]$Target) {
    try {
        $file = Get-SampleFile $Target
        if ($file) { [void](Get-Content -LiteralPath $file -TotalCount 1 -ErrorAction Stop) }
        return $true
    } catch { return $false }
}

# 書き込みが拒否されるか: $true=拒否 / $false=書ける / $null=判定不能（一覧不可・空ディレクトリ）
# 既存ファイルを書き込みモードで開くだけで、内容は変更しない
function Test-WriteDenied([string]$Target) {
    try { $file = Get-SampleFile $Target } catch { return $null }
    if (-not $file) { return $null }
    try {
        $fs = [IO.File]::Open($file, [IO.FileMode]::Open, [IO.FileAccess]::Write, [IO.FileShare]::ReadWrite)
        $fs.Dispose()
        return $false
    } catch [UnauthorizedAccessException] {
        return $true
    } catch {
        return $null
    }
}

# --- 自己テスト（本番の施錠前に、一時ディレクトリで同じ拒否を試す） -----------

function Invoke-SelfTest {
    $dir = Join-Path ([IO.Path]::GetTempPath()) ("tbny-lock-selftest-" + [guid]::NewGuid().ToString('N'))
    $file = Join-Path $dir "probe.txt"
    New-Item -ItemType Directory -Path $dir | Out-Null
    Set-Content -LiteralPath $file -Value "probe"
    try {
        Add-DenyRule $dir
        $ok = (Test-Readable $dir) -and ((Test-WriteDenied $dir) -eq $true)
        $deny = Get-DenyRights $file
        if ($deny -match 'Synchronize') { $ok = $false }
        return [pscustomobject]@{ Ok = $ok; Detail = "読取:$(Test-Readable $dir) 書込拒否:$(Test-WriteDenied $dir) DENY:$($deny -join '; ')" }
    } finally {
        & icacls $dir /remove:d $TargetUser /t /c /q 2>&1 | Out-Null
        Remove-Item -LiteralPath $dir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# --- 本体 ---------------------------------------------------------------------

Write-Host "🛡️  TBNY-DXOS 統治ファイル保護管理 ($Action)  対象ユーザー: $TargetUser" -ForegroundColor Cyan

$aborted = $false
if ($Action -eq "Lock") {
    Write-Host "🧪 自己テスト（一時ディレクトリで施錠を試行）..."
    $selfTest = Invoke-SelfTest
    if ($selfTest.Ok) {
        Write-Host "   ✅ 読み取り可・書き込み拒否を確認: $($selfTest.Detail)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ 自己テストに失敗したため、何も施錠せずに中止します: $($selfTest.Detail)" -ForegroundColor Red
        $failures.Add("自己テスト失敗: $($selfTest.Detail)")
        $aborted = $true
    }
}

if ($Action -ne "Status" -and -not $aborted) {
    foreach ($relPath in $ProtectedPaths) {
        $target = Join-Path $WorkspaceRoot $relPath
        if (-not (Test-Path -LiteralPath $target)) {
            Write-Host "  スキップ（存在しない）: $relPath" -ForegroundColor Gray
            continue
        }
        if ($Action -eq "Unlock") {
            Write-Host "🔓 解除: $relPath"
            Remove-Deny $target $relPath
        } else {
            Write-Host "🔒 施錠: $relPath"
            # 二重登録や旧版の配下エントリを残さないよう、先に正規化してから 1 エントリだけ付ける
            Remove-Deny $target $relPath
            try { Add-DenyRule $target } catch { $failures.Add("施錠 $relPath : $($_.Exception.Message)") }
        }
    }
}

# 検証（全アクションで実施）
Write-Host "`n🔎 検証" -ForegroundColor Cyan
foreach ($relPath in $ProtectedPaths) {
    $target = Join-Path $WorkspaceRoot $relPath
    if (-not (Test-Path -LiteralPath $target)) { continue }

    $readable = Test-Readable $target
    $writeDenied = Test-WriteDenied $target
    $deny = Get-DenyRights $target
    $badDeny = @($deny | Where-Object { $_ -match 'Synchronize|ReadData|ListDirectory|FullControl|ACL取得不可' })

    $ok = $readable -and ($badDeny.Count -eq 0)
    if ($Action -eq "Lock" -and -not $aborted) { $ok = $ok -and ($writeDenied -eq $true) }
    if ($Action -eq "Unlock") { $ok = $ok -and ($deny.Count -eq 0) }

    $writeText = switch ($writeDenied) { $true { '拒否' } $false { '可' } default { '不明' } }
    $state = "読取:{0} 書込:{1}" -f $(if ($readable) { '可' } else { '不可' }), $writeText
    $mark = if ($ok) { '✅' } else { '❌' }
    $color = if ($ok) { 'Green' } else { 'Red' }
    Write-Host ("  {0} {1,-14} {2}  DENY: {3}" -f $mark, $relPath, $state, $(if ($deny) { $deny -join '; ' } else { 'なし' })) -ForegroundColor $color
    if (-not $ok -and $Action -ne "Status") { $failures.Add("検証 $relPath : $state") }
}

if ($failures.Count -gt 0) {
    Write-Host "`n❌ $($failures.Count) 件の失敗があります。" -ForegroundColor Red
    $failures | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host "Lock を繰り返さず、まず Unlock で状態を戻してから原因を確認してください。" -ForegroundColor Yellow
    $code = 1
} else {
    Write-Host "`n✅ 完了しました。" -ForegroundColor Green
    $code = 0
}

if ($Action -ne "Status") {
    Write-Host "エンターキーを押して終了してください。"
    Read-Host | Out-Null
}
exit $code
