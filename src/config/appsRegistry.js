/**
 * DXOS アプリケーション登録簿
 * 
 * staffs.allowed_apps の ID 値と、ポータル上の表示情報を紐づける
 * 唯一の定義ファイル（SSOT）。
 * 
 * 新しいモジュールを追加する際は、ここに1行追加するだけでよい。
 */

export const APPS_REGISTRY = {
  'repaper-route-admin': {
    label: '配車管理ボード',
    description: '統合配車組み・現場管理・車両ステータス。',
    icon: 'LayoutDashboard',
    color: '#10b981',
    gradientFrom: '#047857',
    gradientTo: '#10b981',
    url: '/repaper-route/?activeView=board',
    order: 1,
  },
  'repaper-route-driver': {
    label: 'ドライバー画面',
    description: '自分の担当ルートと現場詳細を確認。',
    icon: 'Truck',
    color: '#3b82f6',
    gradientFrom: '#1d4ed8',
    gradientTo: '#3b82f6',
    url: '/repaper-route/?activeView=board',
    order: 2,
  },
  'master-data': {
    label: 'マスタデータ管理',
    description: '支払先・仕入先・回収先・車両・スタッフの一元管理',
    icon: 'Database',
    color: '#8b5cf6',
    gradientFrom: '#8b5cf6',
    gradientTo: '#a855f7',
    url: null,
    order: 3,
  },
  'weighing-self-driver': {
    label: 'セルフ計量記録',
    description: '協力会社ドライバー向けセルフ計量入力',
    icon: 'Scale',
    color: '#f59e0b',
    gradientFrom: '#f59e0b',
    gradientTo: '#ef4444',
    url: null,
    order: 4,
  },
  'weighing-admin': {
    label: '計量管理ダッシュボード',
    description: '計量データの検証・CSVエクスポート・マスター設定',
    icon: 'BarChart3',
    color: '#ef4444',
    gradientFrom: '#ef4444',
    gradientTo: '#f97316',
    url: null,
    order: 5,
  },
};
