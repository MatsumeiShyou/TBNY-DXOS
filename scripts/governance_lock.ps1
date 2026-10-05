<#
.SYNOPSIS
  TBNY-DXOS 統治ファイル保護スクリプト (人間専用)

.DESCRIPTION
  AI による統治ファイルの書き換えを OS レベル (NTFS ACL) で防ぎます。
  UAC（管理者権限）を必須としているため、AI が CLI から自律的に実行・解除することはできません。

  拒否するのは「書き換え・追加・属性変更・削除」だけです。読み取りは妨げません。
  （旧版は icacls の W を拒否していましたが、W には Synchronize が含まれるため、
    ファイルが読めなくなり、ディレクトリの一覧や git も動かなくなっていました）

  ディレクトリには継承付きの拒否を 1 つだけ設定し、配下は自動で継承させます（再帰処理なし）。
  施錠後に追加されたファイルも保護されます。

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

# 拒否する権限: WD=データ書き込み/ファイル追加, AD=追記/サブフォルダ追加, WEA=拡張属性書き込み,
#               WA=属性書き込み, D=削除, DC=子の削除
# ※ W / M / F / S は指定しない（Synchronize を拒否すると読み取りまで不能になる）
$FileRights = "(WD,AD,WEA,WA,D)"
$DirRights  = "(OI)(CI)(WD,AD,WEA,WA,D,DC)"

$failures = New-Object System.Collections.Generic.List[string]

function Invoke-Icacls([string[]]$IcaclsArgs, [string]$Label) {
    $out = & icacls @IcaclsArgs 2>&1
    if ($LASTEXITCODE -ne 0) {
        $failures.Add("$Label : icacls 終了コード $LASTEXITCODE`n      $($out -join "`n      ")")
    }
}

# このユーザー宛ての明示的な拒否を取り除く（旧版が配下に付けた分も /t で除去）
function Remove-Deny([string]$Target, [string]$RelPath) {
    if (Test-Path -LiteralPath $Target -PathType Container) {
        Invoke-Icacls @($Target, "/remove:d", $TargetUser, "/t", "/c", "/q") "解除 $RelPath"
    } else {
        Invoke-Icacls @($Target, "/remove:d", $TargetUser, "/c", "/q") "解除 $RelPath"
    }
}

function Get-DenyRights([string]$Target) {
    try {
        return @((Get-Acl -LiteralPath $Target -ErrorAction Stop).Access |
            Where-Object { $_.AccessControlType -eq 'Deny' } |
            ForEach-Object { "$($_.FileSystemRights)$(if ($_.IsInherited) { '(継承)' })" })
    } catch {
        return @("ACL取得不可: $($_.Exception.Message)")
    }
}

# 配下ファイルの代表（ディレクトリの場合は先頭 1 件、ファイルならそれ自身）
function Get-SampleFile([string]$Target) {
    if (Test-Path -LiteralPath $Target -PathType Container) {
        return (Get-ChildItem -LiteralPath $Target -Recurse -File -Force -ErrorAction Stop | Select-Object -First 1).FullName
    }
    return $Target
}

# 読み取りできるか（ディレクトリは配下の一覧と代表ファイルの読み取り）
function Test-Readable([string]$Target) {
    try {
        $file = Get-SampleFile $Target
        if ($file) { [void](Get-Content -LiteralPath $file -TotalCount 1 -ErrorAction Stop) }
        return $true
    } catch { return $false }
}

# 書き込みが拒否されるか（既存ファイルを書き込みモードで開くだけ。内容は変更しない）
function Test-WriteDenied([string]$Target) {
    try { $file = Get-SampleFile $Target } catch { return $false }
    if (-not $file) { return $true } # 空ディレクトリ: 判定対象なし
    try {
        $fs = [IO.File]::Open($file, [IO.FileMode]::Open, [IO.FileAccess]::Write, [IO.FileShare]::ReadWrite)
        $fs.Dispose()
        return $false
    } catch {
        return $true
    }
}

Write-Host "🛡️  TBNY-DXOS 統治ファイル保護管理 ($Action)  対象ユーザー: $TargetUser" -ForegroundColor Cyan

if ($Action -ne "Status") {
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
            $rights = if (Test-Path -LiteralPath $target -PathType Container) { $DirRights } else { $FileRights }
            Invoke-Icacls @($target, "/deny", "${TargetUser}:$rights", "/c", "/q") "施錠 $relPath"
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
    if ($Action -eq "Lock")   { $ok = $ok -and $writeDenied }
    if ($Action -eq "Unlock") { $ok = $ok -and ($deny.Count -eq 0) }

    $state = "読取:{0} 書込:{1}" -f $(if ($readable) { '可' } else { '不可' }), $(if ($writeDenied) { '拒否' } else { '可' })
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
