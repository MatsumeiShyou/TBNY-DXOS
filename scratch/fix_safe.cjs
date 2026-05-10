
const fs = require('fs');
const path = require('path');

function safeFix(relPath, pairs) {
    const absPath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(absPath)) return;
    console.log(`Fixing: ${relPath}`);
    let content = fs.readFileSync(absPath, 'utf8');
    
    for (const [target, replacement] of pairs) {
        if (content.includes(target)) {
            content = content.split(target).join(replacement);
        } else {
            console.warn(`  Warning: Target not found in ${relPath}: "${target.substring(0, 20)}..."`);
        }
    }
    
    fs.writeFileSync(absPath, content, 'utf8');
}

// 1. NumericKeypad.tsx
safeFix('src/features/repaper-route/driver/sandbox/components/NumericKeypad.tsx', [
    ["const tokens = expression.match(/(\\d+|[\\+\\-\\ﾃ予ﾃｷ])/g);", "const tokens = expression.match(/(\\d+|[\\+\\-\\×\\÷])/g);"],
    ["if (token === 'ﾃ・ || token === 'ﾃｷ') {", "if (token === '×' || token === '÷') {"],
    ["if (token === 'ﾃ・ intermediate.push(n1 * n2);", "if (token === '×') intermediate.push(n1 * n2);"],
    ["if (token === 'ﾃｷ') intermediate.push(n2 === 0 ? 0 : n1 / n2);", "if (token === '÷') intermediate.push(n2 === 0 ? 0 : n1 / n2);"],
    ["['7', '8', '9', 'ﾃｷ'],", "['7', '8', '9', '÷'],"],
    ["['4', '5', '6', 'ﾃ・],", "['4', '5', '6', '×'],"],
    ["['0', '竚ｫ', '=', '+'],", "['0', '⌫', '=', '+'],"],
    ["const isOperator = (key: string) => ['+', '-', 'ﾃ・, 'ﾃｷ'].includes(key);", "const isOperator = (key: string) => ['+', '-', '×', '÷'].includes(key);"],
    ["if (key === '竚ｫ') {", "if (key === '⌫') {"],
    ['<span className="tw-text-xs tw-font-bold tw-text-slate-400">髮ｻ蜊灘・蜉・/span>', '<span className="tw-text-xs tw-font-bold tw-text-slate-400">電卓入力</span>'],
    ["繧ｯ繝ｪ繧｢", "クリア"],
    ["螳御ｺ・", "完了"],
    ["key === '竚ｫ'", "key === '⌫'"],
    ["{key === '竚ｫ' ? <i className=\"fa-solid fa-delete-left\"></i> : key}", "{key === '⌫' ? <i className=\"fa-solid fa-delete-left\"></i> : key}"]
]);

// 2. EndShiftPage.tsx
safeFix('src/features/repaper-route/driver/sandbox/pages/EndShiftPage.tsx', [
    ["const isOp = ['+', '-', 'ﾃ・, 'ﾃｷ'].includes(char);", "const isOp = ['+', '-', '×', '÷'].includes(char);"],
    ["const lastIsOp = ['+', '-', 'ﾃ・, 'ﾃｷ'].includes(lastChar);", "const lastIsOp = ['+', '-', '×', '÷'].includes(lastChar);"],
    ["const titleText = mode === 'INTERMEDIATE' ? '荳ｭ髢楢差荳九ｍ縺励・莨第・' : '讌ｭ蜍咏ｵゆｺ・ｱ蜻・;", "const titleText = mode === 'INTERMEDIATE' ? '中間荷下ろし・休憩' : '業務終了報告';"],
    ["{step === 1 && '邱城㍾驥上・蝣ｱ蜻・}", "{step === 1 && '総重量の報告'}"],
    ["{step === 2 && '驥埼㍼縺ｮ蜑ｲ繧頑険繧・}", "{step === 2 && '重量の割り振り'}"],
    ["{step === 1 && '繝医Λ繝・け繧ｹ繧ｱ繝ｼ繝ｫ縺ｧ險域ｸｬ縺励◆蛟､繧貞・蜉・}", "{step === 1 && 'トラックスケールで計測した値を入力'}"],
    ["{step === 2 && (mode === 'INTERMEDIATE' ? '闕ｷ荳九ｍ縺励＠縺溷・縺ｮ驥埼㍼繧帝・蛻・＠縺ｾ縺・ : '豁｣蜻ｳ驥埼㍼繧貞推譯井ｻｶ縺ｫ驟榊・縺励∪縺・)}", "{step === 2 && (mode === 'INTERMEDIATE' ? '荷下ろしした分の重量を配分します' : '正味重量を各案件に配分します')}"],
    ['<label className="tw-block tw-text-slate-500 tw-font-bold tw-mb-2">邱城㍾驥・(Kg)</label>', '<label className="tw-block tw-text-slate-500 tw-font-bold tw-mb-2">総重量 (Kg)</label>'],
    ['<div className="tw-text-xs tw-text-slate-500 tw-font-bold tw-mb-1">遨ｺ霆企㍾驥・/div>', '<div className="tw-text-xs tw-text-slate-500 tw-font-bold tw-mb-1">空車重量</div>'],
    ['<div className="tw-text-xs tw-text-slate-400 tw-font-bold tw-mb-1">豁｣蜻ｳ驥埼㍼ (Net)</div>', '<div className="tw-text-xs tw-text-slate-400 tw-font-bold tw-mb-1">正味重量 (Net)</div>'],
    ["窶ｻ 豁｣蜻ｳ驥埼㍼ = 邱城㍾驥・- 遨ｺ霆企㍾驥・", "※ 正味重量 = 総重量 - 空車重量"],
    ["遨ｺ霆企㍾驥擾ｼ・tare}kg・峨ｈ繧雁､ｧ縺阪＞蛟､繧貞・蜉帙＠縺ｦ縺上□縺輔＞", "空車重量（{tare}kg）より大きい値を入力してください"],
    ["{mode === 'INTERMEDIATE' ? '闕ｷ荳九ｍ縺怜ｯｾ雎｡縺ｮ闕ｷ迚ｩ縺後≠繧翫∪縺帙ｓ' : '蝗槫庶縺励◆闕ｷ迚ｩ縺後≠繧翫∪縺帙ｓ'}", "{mode === 'INTERMEDIATE' ? '荷下ろし対象の荷物がありません' : '回収した荷物がありません'}"],
    ['<div className="tw-text-xs tw-text-slate-500 tw-font-bold">豁｣蜻ｳ驥埼㍼繧ｿ繝ｼ繧ｲ繝・ヨ</div>', '<div className="tw-text-xs tw-text-slate-500 tw-font-bold">正味重量ターゲット</div>'],
    ['<div className="tw-text-xs tw-text-slate-500 tw-font-bold">谿九ｊ隱ｿ謨ｴ</div>', '<div className="tw-text-xs tw-text-slate-500 tw-font-bold">残り調整</div>'],
    ['<div className="tw-text-xs tw-text-slate-400">讎らｮ・ {item.actualWeight}kg</div>', '<div className="tw-text-xs tw-text-slate-400">概算: {item.actualWeight}kg</div>'],
    ["謌ｻ繧・", "戻る"],
    ["谺｡縺へ", "次へ"],
    ["{mode === 'INTERMEDIATE' ? '闕ｷ荳九ｍ縺怜ｮ御ｺ・・莨第・' : '遒ｺ螳壹＠縺ｦ讌ｭ蜍咏ｵゆｺ・}", "{mode === 'INTERMEDIATE' ? '荷下ろし完了・休憩' : '確定して業務終了'}"],
    ['title="譛€邨ら｢ｺ隱・', 'title="最終確認"'],
    ["{mode === 'INTERMEDIATE' ? '荳ｭ髢楢差荳九ｍ縺励ｒ螳御ｺ・＠縺ｾ縺吶°・・ : '讌ｭ蜍呎律蝣ｱ繧呈署蜃ｺ縺励∪縺吶°・・}", "{mode === 'INTERMEDIATE' ? '中間荷下ろしを完了しますか？' : '業務日報を提出しますか？'}"],
    ["? '蟇ｾ雎｡縺ｮ闕ｷ迚ｩ縺ｯ縲瑚差荳九ｍ縺玲ｸ医∩縲阪→縺ｪ繧翫€∽ｼ第・繧ｹ繝・・繧ｿ繧ｹ縺ｫ遘ｻ陦後＠縺ｾ縺吶€・", "? '対象の荷物は「荷下ろし済み」となり、休憩ステータスに移行します。'"],
    [": '荳€蠎ｦ謠仙・縺吶ｋ縺ｨ菫ｮ豁｣縺ｧ縺阪∪縺帙ｓ縲ょ・蜉帛・螳ｹ縺ｫ髢馴＆縺・′縺ｪ縺・°遒ｺ隱阪＠縺ｦ縺上□縺輔＞縲・}", ": '一度提出すると修正できません。入力内容に間違いがないか確認してください。'}"],
    ["繧ｭ繝｣繝ｳ繧ｻ繝ｫ", "キャンセル"],
    ["遒ｺ螳壹☆繧・", "確定する"]
]);

// 3. InspectionPage.tsx
safeFix('src/features/repaper-route/driver/sandbox/pages/InspectionPage.tsx', [
    ["始業前点検", "始業前点検"], // Sometimes it looks correct but hidden characters
    ["始業前点検", "始業前点検"],
    ["蜈ｨ縺ｦ縺ｮ鬆・岼繧偵€檎焚蟶ｸ縺ｪ縺励€阪→縺吶ｋ", "全ての項目を「異常なし」とする"],
    ["荵怜漁蜩｡轤ｹ讀懶ｼ亥ｿ・茨ｼ・", "乗務員点検（必須）"],
    ["霆贋ｸ｡譌･蟶ｸ轤ｹ讀・", "車両日常点検"],
    ["{isAllChecked ? '轤ｹ讀懷ｮ御ｺ・・讌ｭ蜍咎幕蟋・ : '蜈ｨ縺ｦ縺ｮ鬆・岼繧堤｢ｺ隱阪＠縺ｦ縺上□縺輔＞'}", "{isAllChecked ? '点検完了・業務開始' : '全ての項目を確認してください'}"],
    ['title="荳€諡ｬ繝√ぉ繝・け縺ｮ遒ｺ隱・', 'title="一括チェックの確認"'],
    ["豕穂ｻ､縺ｫ蝓ｺ縺･縺冗｢ｺ隱・", "法令に基づく確認"],
    ["繧｢繝ｫ繧ｳ繝ｼ繝ｫ繝√ぉ繝・け繧貞性繧€蜈ｨ縺ｦ縺ｮ鬆・岼繧堤｢ｺ隱阪＠縲∫焚蟶ｸ縺後↑縺・％縺ｨ繧定ｪ鍋ｴ・＠縺ｾ縺吶°・・", "アルコールチェックを含む全ての項目を確認し、異常がないことを誓約しますか？"],
    ["窶ｻ驟呈ｰ怜ｸｯ縺ｳ驕玖ｻ｢縺翫ｈ縺ｳ陌壼⊃蝣ｱ蜻翫・蜴ｳ豁｣縺ｫ蜃ｦ鄂ｰ縺輔ｌ縺ｾ縺吶€・", "※酒気帯び運転および虚偽報告は厳正に処罰されます。"]
]);

// 4. StopDetailPage.tsx
safeFix('src/features/repaper-route/driver/sandbox/pages/StopDetailPage.tsx', [
    ["const isOp = ['+', '-', 'ﾃ・, 'ﾃｷ'].includes(char);", "const isOp = ['+', '-', '×', '÷'].includes(char);"],
    ["const lastIsOp = ['+', '-', 'ﾃ・, 'ﾃｷ'].includes(lastChar);", "const lastIsOp = ['+', '-', '×', '÷'].includes(lastChar);"],
    ["莉頑律繧ゆｸ€譌･螳牙・驕玖ｻ｢縺ｧ縺企｡倥＞縺励∪縺吶€・", "今日も一日安全運転でお願いします"],
    ["蝗槫庶蟇ｾ雎｡縺ｮ闕ｷ迚ｩ", "回収対象の荷物"],
    ["謨ｰ驥・(kg)", "数量 (kg)"],
    [">竏・/button>", ">-</button>"],
    [">竚ｫ</button>", ">⌫</button>"],
    ["蠅玲ｸ帛腰菴・", "増減単位"],
    ["繝ｪ繧ｻ繝・ヨ", "リセット"],
    ["繝ｪ繧ｹ繝医↓縺ｪ縺・刀逶ｮ繧定ｿｽ蜉", "リストにない品目を追加"],
    ["菴懈･ｭ繧剃ｸｭ譁ｭ縺励※謌ｻ繧・", "作業を中断して戻る"],
    ["邱城㍾驥擾ｼ域ｦらｮ暦ｼ・", "総重量（概算）:"],
    ["菫ｮ豁｣蜀・ｮｹ繧剃ｿ晏ｭ・", "修正内容を保存"],
    ["菴懈･ｭ螳御ｺ・・蜃ｺ逋ｺ", "作業完了・出発"],
    ['title="蜩∫岼霑ｽ蜉"', 'title="品目追加"'],
    ["蜩∫岼蜷・", "品目名"],
    ["萓・ 邊怜､ｧ縺斐∩", "例: 粗大ごみ"],
    ["驥埼㍼ (kg)", "重量 (kg)"],
    ["霑ｽ蜉縺吶ｋ", "追加する"],
    ["菴懈･ｭ螳御ｺ・", "作業完了"],
    ["縺顔夢繧梧ｧ倥〒縺励◆縲・br/>谺｡縺ｮ逶ｮ逧・慍縺ｸ蜷代°縺｣縺ｦ縺上□縺輔＞縲・", "お疲れ様でした。<br/>次の目的地へ向かってください。"],
    ["蜀・ｮｹ繧剃ｿｮ豁｣縺吶ｋ", "内容を修正する"],
    ["繝ｪ繧ｹ繝医↓謌ｻ繧・", "リストに戻る"]
]);

// 5. DriverApp.tsx
safeFix('src/features/repaper-route/driver/sandbox/DriverApp.tsx', [
    ["逕ｳ隲九ョ繝ｼ繧ｿ繧帝€∽ｿ｡縺励∪縺励◆縲・", "申請データを送信しました。"],
    ["逵溷ｮ溘ｒ隱ｭ縺ｿ霎ｼ縺ｿ荳ｭ...", "真実を読み込み中..."],
    ["if (view === 'inspection') return '蟋区･ｭ蜑咲せ讀・;", "if (view === 'inspection') return '始業前点検';"],
    ["if (view === 'route') return '譛ｬ譌･縺ｮ譯井ｻｶ繝ｪ繧ｹ繝・;", "if (view === 'route') return '本日の案件リスト';"],
    ["if (view === 'stop') return '譯井ｻｶ隧ｳ邏ｰ';", "if (view === 'stop') return '案件詳細';"],
    ["if (view === 'fuel') return '邨ｦ豐ｹ蝣ｱ蜻・;", "if (view === 'fuel') return '給油報告';"],
    ["if (view === 'report') return '讌ｭ蜍呎律蝣ｱ繧ｵ繝槭Μ';", "if (view === 'report') return '業務日報サマリ';"],
    ["if (view === 'end') return '譛ｬ譌･縺ｮ讌ｭ蜍咏ｵゆｺ・;", "if (view === 'end') return '本日の業務終了';"],
    ["currentRouteName=\"繧ｳ繝ｼ繧ｹA-1\"", "currentRouteName=\"コースA-1\""],
    ["onChangeCourse={() => showToast('繧ｳ繝ｼ繧ｹ螟画峩縺ｯ邂｡逅・€・∈騾｣邨｡縺励※縺上□縺輔＞', 'info')}", "onChangeCourse={() => showToast('コース変更は管理者へ連絡してください', 'info')}"],
    ["name: '荳肴・'", "name: '不明'"],
    ["showToast('繧ｳ繝ｼ繧ｹ螟画峩縺ｯ邂｡逅・€・∈騾｣邨｡縺励※縺上□縺輔＞', 'info');", "showToast('コース変更は管理者へ連絡してください', 'info');"],
    ['title="霆贋ｸ｡繧帝∈謚・', 'title="車両を選択"'],
    ["窶ｻ霆贋ｸ｡繧貞､画峩縺吶ｋ縺ｨ縲∵悽譌･縺ｮ驕玖｡悟溽ｸｾ繝・・繧ｿ縺ｫ邏蝉ｻ倥￠繧峨ｌ縺ｾ縺・", "※車両を変更すると、本日の運行実績データに紐付けられます"],
    ['title="邱頑€･莠区・蝣ｱ蜻・', 'title="緊急事態報告"'],
    ["title={transferStep === 'SELECT' ? \"隴ｲ貂｡蜈医ｒ驕ｸ謚・ : \"隴ｲ貂｡縺ｮ遒ｺ隱・}", "title={transferStep === 'SELECT' ? \"譲渡先を選択\" : \"譲渡の確認\"}"],
    ["{c.distance} 莉倩ｿ・", "{c.distance} 付近"],
    ["隴ｲ貂｡縺吶ｋ譯井ｻｶ", "譲渡する案件"],
    ["隴ｲ貂｡蜈医ラ繝ｩ繧､繝舌・", "譲渡先ドライバー"],
    ["髮ｻ隧ｱ縺励※萓晞ｼ繧堤｢ｺ螳壹☆繧・", "電話して依頼を確定する"]
]);

// 6. FuelPage.tsx (Layout Fix)
safeFix('src/features/repaper-route/driver/sandbox/pages/FuelPage.tsx', [
    ['className="tw-grid tw-grid-cols-2 tw-gap-4"', 'className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-4"'],
    ['tw-top-1/2 tw-translate-y-1/2', 'tw-top-1/2 tw--translate-y-1/2']
]);
