
const fs = require('fs');
const path = require('path');

function fixFile(relPath, replacements) {
    const absPath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(absPath)) {
        console.log(`Skip: ${relPath}`);
        return;
    }
    console.log(`Fixing: ${relPath}`);
    let content = fs.readFileSync(absPath, 'utf8');
    let lines = content.split(/\r?\n/);

    for (const [lineNum, newContent] of Object.entries(replacements)) {
        const index = parseInt(lineNum) - 1;
        if (index < lines.length) {
            lines[index] = newContent;
        }
    }

    fs.writeFileSync(absPath, lines.join('\n'), 'utf8');
}

// 1. NumericKeypad.tsx
fixFile('src/features/repaper-route/driver/sandbox/components/NumericKeypad.tsx', {
    19: "    const tokens = expression.match(/(\\d+|[\\+\\-\\×\\÷])/g);",
    22: "    // 2. Process Multiply (×) and Divide (÷) first",
    27: "      if (token === '×' || token === '÷') {",
    35: "           if (token === '×') intermediate.push(n1 * n2);",
    36: "           if (token === '÷') intermediate.push(n2 === 0 ? 0 : n1 / n2);",
    71: "    ['7', '8', '9', '÷'],",
    72: "    ['4', '5', '6', '×'],",
    74: "    ['0', '⌫', '=', '+'],",
    77: "  const isOperator = (key: string) => ['+', '-', '×', '÷'].includes(key);",
    80: "    if (key === '⌫') {",
    94: '           <span className="tw-text-xs tw-font-bold tw-text-slate-400">電卓入力</span>',
    96: "             クリア",
    103: "          完了",
    122: "                        : key === '⌫'",
    128: "                  {key === '⌫' ? <i className=\"fa-solid fa-delete-left\"></i> : key}"
});

// 2. EndShiftPage.tsx
fixFile('src/features/repaper-route/driver/sandbox/pages/EndShiftPage.tsx', {
    60: "    const isOp = ['+', '-', '×', '÷'].includes(char);",
    62: "    const lastIsOp = ['+', '-', '×', '÷'].includes(lastChar);",
    118: "  const titleText = mode === 'INTERMEDIATE' ? '中間荷下ろし・休憩' : '業務終了報告';",
    151: "           {step === 1 && '総重量の報告'}",
    152: "           {step === 2 && '重量の割り振り'}",
    155: "           {step === 1 && 'トラックスケールで計測した値を入力'}",
    156: "           {step === 2 && (mode === 'INTERMEDIATE' ? '荷下ろしした分の重量を配分します' : '正味重量を各案件に配分します')}",
    165: '                 <label className="tw-block tw-text-slate-500 tw-font-bold tw-mb-2">総重量 (Kg)</label>',
    184: '                 <div className="tw-text-xs tw-text-slate-500 tw-font-bold tw-mb-1">空車重量</div>',
    188: '                 <div className="tw-text-xs tw-text-slate-400 tw-font-bold tw-mb-1">正味重量 (Net)</div>',
    196: "               ※ 正味重量 = 総重量 - 空車重量",
    201: "                  空車重量（{tare}kg）より大きい値を入力してください",
    207: "                 {mode === 'INTERMEDIATE' ? '荷下ろし対象の荷物がありません' : '回収した荷物がありません'}",
    219: '                 <div className="tw-text-xs tw-text-slate-500 tw-font-bold">正味重量ターゲット</div>',
    223: '                 <div className="tw-text-xs tw-text-slate-500 tw-font-bold">残り調整</div>',
    243: '                       <div className="tw-text-xs tw-text-slate-400">概算: {item.actualWeight}kg</div>',
    261: "              戻る",
    266: "              次へ",
    272: "              {mode === 'INTERMEDIATE' ? '荷下ろし完了・休憩' : '確定して業務終了'}",
    286: "      <Modal isOpen={isConfirmOpen} onClose={() => setConfirmOpen(false)} title='最終確認' agentId='confirm-modal'>",
    292: "                    {mode === 'INTERMEDIATE' ? '中間荷下ろしを完了しますか？' : '業務日報を提出しますか？'}",
    296: "                       ? '対象の荷物は「荷下ろし済み」となり、休憩ステータスに移行します。' ",
    297: "                       : '一度提出すると修正できません。入力内容に間違いがないか確認してください。'}",
    301: "              <Button variant='secondary' onClick={() => setConfirmOpen(false)} agentId='confirm-modal:cancel-button'>キャンセル</Button>",
    302: "              <Button onClick={executeFinish} agentId='confirm-modal:execute-button'>確定する</Button>"
});

// 3. StopDetailPage.tsx
fixFile('src/features/repaper-route/driver/sandbox/pages/StopDetailPage.tsx', {
    18: "    const isOp = ['+', '-', '×', '÷'].includes(char);",
    19: "    const lastIsOp = ['+', '-', '×', '÷'].includes(lastChar);",
    82: '            <p className="tw-text-xs tw-text-slate-400">今日も一日安全運転でお願いします</p>',
    144: '                   <p className="tw-text-xs tw-text-slate-400">回収対象の荷物</p>',
    218: '                       <label className="tw-text-xs tw-font-bold tw-text-slate-500">数量 (kg)</label>',
    226: "                      >−</button>",
    240: "                      >⌫</button>",
    272: '                        <span className="tw-text-[10px] tw-text-slate-400 tw-font-bold">増減単位</span>',
    292: '                          <i className="fa-solid fa-trash tw-mr-1"></i>リセット',
    308: '                <i className="fa-solid fa-plus tw-mr-2"></i> リストにない品目を追加',
    314: '                  <i className="fa-solid fa-pause tw-mr-2"></i> 作業を中断して戻る',
    321: "            <span>総重量（概算）:</span>",
    325: '              <i className="fa-solid fa-save tw-mr-2"></i> 修正内容を保存',
    329: '              <i className="fa-solid fa-flag-checkered tw-mr-2"></i> 作業完了・出発',
    342: "        <Modal title='品目追加' isOpen={isAddItemModalOpen} onClose={() => setAddItemModalOpen(false)} agentId='add-item-modal'>",
    345: '              <label className="tw-block tw-text-sm tw-font-bold tw-text-slate-700 tw-mb-2">品目名</label>',
    349: "                placeholder='例: 粗大ごみ'",
    354: '              <label className="tw-block tw-text-sm tw-font-bold tw-text-slate-700 tw-mb-2">重量 (kg)</label>',
    366: "            <Button onClick={addNewItem} className='tw-mt-4' agentId='add-item-modal:execute-button'>追加する</Button>",
    381: '        <h2 className="tw-text-2xl tw-font-bold tw-text-slate-800">作業完了</h2>',
    382: '        <p className="tw-text-slate-500">お疲れ様でした。<br/>次の目的地へ向かってください。</p>',
    387: '           <i className="fa-solid fa-pen-to-square tw-mr-2"></i>内容を修正する',
    389: "        <Button onClick={onBack} agentId='action:back-to-list-button'>リストに戻る</Button>"
});

// 4. InspectionPage.tsx
fixFile('src/features/repaper-route/driver/sandbox/pages/InspectionPage.tsx', {
    54: '        <h2 className="tw-text-xl tw-font-bold tw-text-slate-800">始業前点検</h2>',
    55: '        <p className="tw-text-sm tw-text-slate-500">今日も一日安全運転でお願いします。<br/>乗務前点検および車両点検を行ってください。</p>',
    65: '          <span>全ての項目を「異常なし」とする</span>',
    71: '          <i className="fa-solid fa-user-shield tw-mr-2"></i>乗務員点検（必須）',
    80: '          <i className="fa-solid fa-truck tw-mr-2"></i>車両日常点検',
    94: "          {isAllChecked ? '点検完了・業務開始' : '全ての項目を確認してください'}",
    98: "      <Modal isOpen={isConfirmOpen} onClose={() => setConfirmOpen(false)} title='一括チェックの確認' agentId='bulk-confirm-modal'>",
    103: '               <h4 className="tw-font-bold tw-text-lg tw-mb-1">法令に基づく確認</h4>',
    105: "                 アルコールチェックを含む全ての項目を確認し、異常がないことを誓約しますか？<br/>",
    106: '                 <span className="tw-font-bold tw-text-red-600 tw-mt-2 tw-block tw-border-t tw-border-yellow-200 tw-pt-1">※酒気帯び運転および虚偽報告は厳正に処罰されます。</span>',
    111: "            <Button variant='secondary' onClick={() => setConfirmOpen(false)} agentId='bulk-confirm-modal:cancel-button'>キャンセル</Button>",
    112: "            <Button onClick={executeBulkCheck} agentId='bulk-confirm-modal:execute-button'>誓約してチェック</Button>"
});

// 5. DriverApp.tsx
fixFile('src/features/repaper-route/driver/sandbox/DriverApp.tsx', {
    167: "    showToast('申請データを送信しました。', 'info');",
    190: '          <p className="tw-font-bold">真実を読み込み中...</p>',
    199: "     if (view === 'inspection') return '始業前点検';",
    200: "     if (view === 'route') return '本日の案件リスト';",
    201: "     if (view === 'stop') return '案件詳細';",
    202: "     if (view === 'fuel') return '給油報告';",
    203: "     if (view === 'report') return '業務日報サマリ';",
    204: "     if (view === 'end') return '本日の業務終了';",
    223: "                  currentRouteName='コースA-1' ",
    226: "                  onChangeCourse={() => showToast('コース変更は管理者へ連絡してください', 'info')}",
    249: "                  currentVehicle={bridge.availableVehicles.find(v => v.id === user.vehicleId) || { id: 'default', name: '不明', plateNumber: '-', tareWeight: 2500, isInspected: true }}",
    288: "            onCourseChange={() => { showToast('コース変更は管理者へ連絡してください', 'info'); }}",
    298: "          <Modal isOpen={true} title='車両を選択' onClose={() => setVehicleModalOpen(false)} agentId='modal'>",
    306: "                ※車両を変更すると、本日の運行実績データに紐付けられます",
    316: "          <Modal isOpen={true} title='緊急事態報告' onClose={() => setIsSOSModalOpen(false)} agentId='modal'>",
    331: "            title={transferStep === 'SELECT' ? '譲渡先を選択' : '譲渡の確認'} ",
    342: "                        <div className='tw-text-sm tw-text-slate-500'>{c.distance} 付近</div>",
    353: '                  <p className="tw-text-slate-600 tw-mb-2">譲渡する案件</p>',
    356: '                  <p className="tw-text-slate-600 tw-mb-2">譲渡先ドライバー</p>',
    364: "                  電話して依頼を確定する"
});

// 6. FuelPage.tsx
fixFile('src/features/repaper-route/driver/sandbox/pages/FuelPage.tsx', {
    111: '      <div className="tw-grid tw-grid-cols-1 tw-sm:tw-grid-cols-2 tw-gap-4">',
    123: '            <span className="tw-absolute tw-right-4 tw-top-1/2 tw--translate-y-1/2 tw-text-slate-400 tw-font-bold">L</span>',
    137: '            <span className="tw-absolute tw-right-4 tw-top-1/2 tw--translate-y-1/2 tw-text-slate-400 tw-font-bold">km</span>'
});
