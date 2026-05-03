
import type { InspectionItem, Stop, User, Vehicle, RouteInfo, BaseTask, Colleague } from './types';
import { StopStatus, DriverStatus } from './types';

export const CURRENT_USER: User = {
  id: 'd-001',
  name: '田中 太郎',
  vehicleId: 'v-101',
  vehicleName: '2tトラック A号車',
  currentStatus: DriverStatus.IDLE
};

export const ADMIN_PHONE_NUMBER = '03-1234-5678'; // For SOS escalation

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v-101', name: '2tトラック A号車', plateNumber: '品川 100 あ 12-34', isInspected: true, tareWeight: 2800 },
  { id: 'v-102', name: '2tトラック B号車', plateNumber: '品川 100 あ 56-78', isInspected: false, tareWeight: 2800 }, 
  { id: 'v-103', name: '軽バン C号車', plateNumber: '品川 400 い 99-99', isInspected: false, tareWeight: 950 },
];

export const MOCK_COLLEAGUES: Colleague[] = [
  { id: 'd-002', name: '鈴木 一郎', status: DriverStatus.DRIVING, distance: '2.5km', phoneNumber: '090-1111-2222' },
  { id: 'd-003', name: '佐藤 花子', status: DriverStatus.LOADING, distance: '5.0km', phoneNumber: '090-3333-4444' },
  { id: 'd-004', name: '高橋 健', status: DriverStatus.IDLE, distance: '12km', phoneNumber: '090-5555-6666' },
];

export const INITIAL_INSPECTION_ITEMS: InspectionItem[] = [
  // Driver Checks (Safety & Compliance)
  { id: 'dr-1', label: 'アルコール検知器によるチェック', checked: false },
  { id: 'dr-2', label: '免許証の携帯確認', checked: false },
  { id: 'dr-3', label: '健康状態（睡眠・体調不良なし）', checked: false },
  // Vehicle Checks
  { id: '1', label: 'タイヤの空気圧・摩耗', checked: false },
  { id: '2', label: 'ライト・ウインカーの点灯', checked: false },
  { id: '3', label: 'ブレーキの効き具合', checked: false },
  { id: '4', label: 'エンジンオイル・冷却水', checked: false },
  { id: '5', label: '積載具・固縛装置の状態', checked: false },
];

export const DEFAULT_BASE_TASKS: BaseTask[] = [
  { id: 'bt-1', label: '洗車・車内清掃', checked: false },
  { id: 'bt-2', label: '翌日の資材積み込み', checked: false },
  { id: 'bt-3', label: '日報・伝票の提出', checked: false },
  { id: 'bt-4', label: 'アルコールチェック（帰庫）', checked: false },
];

// Route A: Tokyo (Default)
export const MOCK_STOPS_TOKYO: Stop[] = [
  {
    id: 's-1',
    customerName: '株式会社 鈴木商店',
    address: '東京都大田区蒲田5-13-23',
    lat: 35.562479,
    lng: 139.716073,
    scheduledTime: '09:00',
    status: StopStatus.PENDING,
    isPriority: true,
    notes: '裏口の搬入口を使用すること。',
    constraints: {
      entryInstruction: '正門からの入場禁止。北側通用口を使用してください。'
    },
    items: [
      { id: 'c-1', name: '可燃ゴミ', defaultWeight: 20, isCollected: false, isUnloaded: false }, // kg only
      { id: 'c-2', name: 'ダンボール', defaultWeight: 10, isCollected: false, isUnloaded: false },
    ]
  },
  {
    id: 's-2',
    customerName: '佐藤クリーニング',
    address: '東京都品川区東品川2-2-2',
    lat: 35.620000,
    lng: 139.750000,
    scheduledTime: '10:30',
    status: StopStatus.PENDING,
    items: [
      { id: 'c-3', name: '産業廃棄物A', defaultWeight: 20, isCollected: false, isUnloaded: false },
    ]
  },
  {
    id: 's-3',
    customerName: '高橋物流センター',
    address: '東京都江東区青海1-1-1',
    lat: 35.620000,
    lng: 139.780000,
    scheduledTime: '13:00',
    status: StopStatus.PENDING,
    items: [
      { id: 'c-4', name: '古紙', defaultWeight: 50, isCollected: false, isUnloaded: false },
      { id: 'c-5', name: '金属スクラップ', defaultWeight: 30, isCollected: false, isUnloaded: false },
    ]
  },
  {
    id: 's-4',
    customerName: '山田製作所',
    address: '東京都墨田区押上1-1-2',
    lat: 35.710000,
    lng: 139.810000,
    scheduledTime: '14:30',
    status: StopStatus.PENDING,
    items: [
      { id: 'c-6', name: 'プラスチック', defaultWeight: 15, isCollected: false, isUnloaded: false },
    ]
  }
];

// Route B: Chiba (New)
export const MOCK_STOPS_CHIBA: Stop[] = [
  {
    id: 's-b1',
    customerName: '船橋ロジスティクス',
    address: '千葉県船橋市浜町2-1-1',
    lat: 35.685,
    lng: 139.99,
    scheduledTime: '09:30',
    status: StopStatus.PENDING,
    items: [
      { id: 'cb-1', name: '梱包用ラップ', defaultWeight: 40, isCollected: false, isUnloaded: false },
      { id: 'cb-2', name: '発泡スチロール', defaultWeight: 10, isCollected: false, isUnloaded: false },
    ]
  },
  {
    id: 's-b2',
    customerName: '幕張メッセ搬入口',
    address: '千葉県千葉市美浜区中瀬2-1',
    lat: 35.648,
    lng: 140.04,
    scheduledTime: '11:00',
    status: StopStatus.PENDING,
    isPriority: true,
    notes: 'イベント開催中のため入場証提示必須。',
    aiAlert: {
      message: '周辺道路の混雑が予測されます。'
    },
    items: [
      { id: 'cb-3', name: '展示会廃材', defaultWeight: 100, isCollected: false, isUnloaded: false },
    ]
  },
  {
    id: 's-b3',
    customerName: '浦安鉄鋼団地 組合事務所',
    address: '千葉県浦安市鉄鋼通り1-1',
    lat: 35.635,
    lng: 139.90,
    scheduledTime: '14:00',
    status: StopStatus.PENDING,
    items: [
      { id: 'cb-4', name: '鉄くず', defaultWeight: 200, isCollected: false, isUnloaded: false },
    ]
  }
];

export const MOCK_STOPS = MOCK_STOPS_TOKYO; // Default export for compatibility

export const MOCK_COURSES: RouteInfo[] = [
  { id: 'r-1', name: '東京エリア通常', area: '大田区・品川区・江東区', stops: MOCK_STOPS_TOKYO },
  { id: 'r-2', name: '千葉湾岸ルート', area: '船橋市・千葉市・浦安市', stops: MOCK_STOPS_CHIBA },
  { id: 'r-3', name: '神奈川早朝便', area: '横浜市・川崎市', stops: [] }, // Empty for demo
];

export const TRAFFIC_STATUS_OPTIONS = [
  { label: '順調', value: 'OK', icon: 'fa-regular fa-face-smile', color: 'text-green-600' },
  { label: '少し遅れ', value: 'DELAY_SLIGHT', icon: 'fa-regular fa-face-meh', color: 'text-yellow-600' },
  { label: '渋滞中', value: 'JAM', icon: 'fa-solid fa-traffic-light', color: 'text-red-600' },
  { label: 'トラブル', value: 'TROUBLE', icon: 'fa-solid fa-triangle-exclamation', color: 'text-red-600' },
];

// --- Help Mode Content ---
export const HELP_CONTENT: Record<string, { title: string, description: string, action: string }> = {
  "priority-badge": {
    title: "優先バッジ",
    description: "緊急性が高い、または時間厳守の案件に表示されます（赤色点滅）。",
    action: "このマークがある案件は、他の案件より優先して配送を行ってください。遅れる可能性がある場合は早めに管理者に相談してください。"
  },
  "status-badge-header": {
    title: "ドライバーステータス",
    description: "現在のあなたの業務状態（待機中、移動中、作業中など）を表示しています。",
    action: "案件の開始・完了操作に合わせて自動的に切り替わります。管理者はこの情報を見て配車を調整します。"
  },
  "trouble-button": {
    title: "トラブル報告ボタン",
    description: "事故、故障、大幅な遅延が発生した場合に使用する緊急ボタンです。",
    action: "タップするとメニューが開き、状況に応じた連絡先（警察・救急・管理者）や対応フローを案内します。"
  },
  "demo-button": {
    title: "デモ用：依頼受信",
    description: "テスト用に、他のドライバーからの「案件交換依頼」をシミュレーションするボタンです。",
    action: "本来の業務アプリには存在しません。動作確認用です。"
  },
  "course-info": {
    title: "コース情報カード",
    description: "現在担当しているルート名とエリアを表示しています。",
    action: "タップすると、担当コースの変更メニューが開きます（空きコースがある場合）。"
  },
  "vehicle-selector": {
    title: "車両乗り換えメニュー",
    description: "現在搭乗している車両です。故障や急な変更で別の車に乗り換える際に使用します。",
    action: "タップすると空き車両一覧が表示され、乗り換え登録ができます。"
  },
  "nav-route": {
    title: "ルート一覧画面",
    description: "本日の配送・回収予定リストを表示します。",
    action: "業務の基本画面です。次にどこへ行くか迷ったらここを押してください。"
  },
  "nav-fuel": {
    title: "給油報告",
    description: "ガソリンスタンドで給油した際に、レシートを撮影・報告する機能です。",
    action: "給油時のみ使用します。"
  },
  "nav-report": {
    title: "実績・日報",
    description: "本日の作業進捗や、完了後の日報確認を行う画面です。",
    action: "進捗率を確認したり、業務終了後に日報を提出する際に使用します。"
  },
  "nav-end": {
    title: "業務終了ウィザード",
    description: "一日の業務が全て完了した際、または拠点に戻って荷下ろしをする際に使用します。",
    action: "帰庫後の重量報告フロー（トラックスケール入力など）を開始します。"
  },
  "btn-reorder": {
    title: "訪問順序の変更",
    description: "渋滞や現場の都合に合わせて、回る順番を自由に変更できます。",
    action: "タップしてモードを切り替え、矢印ボタンで順序を入れ替えてください。"
  },
  "btn-status-report": {
    title: "状況報告（簡易）",
    description: "運転中に「渋滞」や「少し遅れそう」といった状況をワンタップで管理者に伝えます。",
    action: "電話するほどではないが、状況を共有しておきたい時に使ってください。"
  },
  "fab-intermediate": {
    title: "中間荷下ろし（拠点帰還）",
    description: "荷台がいっぱいになり、一度拠点に戻って荷物を下ろす場合に使用します。",
    action: "午前の部が終了した際などにタップし、積載リセットと休憩報告を行います。"
  },
  "btn-navi": {
    title: "Googleマップ連携",
    description: "配送先住所を目的地として、外部の地図アプリを起動します。",
    action: "経路がわからない場合に使用してください。"
  },
  "btn-arrive": {
    title: "現地到着打刻",
    description: "現場に到着し、車を停めたタイミングで押します。",
    action: "これを押すと作業入力モードに切り替わります。待機時間の計測開始点となります。"
  },
  "input-calculator": {
    title: "重量入力・電卓",
    description: "回収したゴミや資源の重量を入力します。電卓機能付きです。",
    action: "タップすると専用テンキーが開きます。「10+20=」のように計算して入力できます。"
  },
  "btn-add-item": {
    title: "品目追加ボタン",
    description: "予定リストにない品目を急遽回収した場合に使います。",
    action: "現場で追加依頼があった場合、ここで品名と重量を登録してください。"
  },
  "input-gross-weight": {
    title: "トラックスケール値入力",
    description: "車両ごと秤に乗った際の「総重量」を入力します。",
    action: "ここに入力すると、空車重量を引いた「正味重量（積んだ荷物の重さ）」が自動計算されます。"
  },
  "step-indicator": {
    title: "報告の2段階プロセス",
    description: "重量の「総量入力」と「内訳配分」の2ステップで行います。",
    action: "まず総重量を確定させ、次に各案件への割り振りを微調整します。"
  },
  "check-summary": {
    title: "集計値チェック",
    description: "本日の総回収量や件数に間違いがないか確認する項目です。",
    action: "間違いがなければタップしてチェックを入れてください。"
  },
  "check-list": {
    title: "入力漏れチェック",
    description: "各案件ごとの入力漏れや、訪問忘れがないか確認する項目です。",
    action: "全て確認したらタップしてください。両方チェックすると「提出ボタン」が現れます。"
  }
};
