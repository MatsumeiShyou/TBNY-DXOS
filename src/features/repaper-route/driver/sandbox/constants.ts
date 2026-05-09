import type { InspectionItem, BaseTask } from './types';

/**
 * Operational Constants (Static)
 * 
 * 運用ルールに基づく定数。マスタデータ（車両・案件等）はここには含めず、
 * 全て実 DB (useDriverOSBridge) から取得する。
 */

export const ADMIN_PHONE_NUMBER = '03-1234-5678'; // 緊急時連絡先

export const INITIAL_INSPECTION_ITEMS: InspectionItem[] = [
  { id: 'dr-1', label: 'アルコール検知器によるチェック', checked: false },
  { id: 'dr-2', label: '免許証の携帯確認', checked: false },
  { id: 'dr-3', label: '健康状態（睡眠・体調不良なし）', checked: false },
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

export const TRAFFIC_STATUS_OPTIONS = [
  { label: '順調', value: 'OK', icon: 'fa-regular fa-face-smile', color: 'tw-text-green-600' },
  { label: '少し遅れ', value: 'DELAY_SLIGHT', icon: 'fa-regular fa-face-meh', color: 'tw-text-yellow-600' },
  { label: '渋滞中', value: 'JAM', icon: 'fa-solid fa-traffic-light', color: 'tw-text-red-600' },
  { label: 'トラブル', value: 'TROUBLE', icon: 'fa-solid fa-triangle-exclamation', color: 'tw-text-red-600' },
];

export const HELP_CONTENT: Record<string, { title: string, description: string, action: string }> = {
  "priority-badge": {
    title: "優先バッジ",
    description: "緊急性が高い案件に表示されます（赤色点滅）。",
    action: "この案件は優先して配送を行ってください。"
  },
  "status-badge-header": {
    title: "ドライバーステータス",
    description: "現在のあなたの業務状態を表示しています。",
    action: "作業に合わせて自動的に切り替わります。"
  },
  "trouble-button": {
    title: "トラブル報告ボタン",
    description: "事故や故障が発生した場合に使用する緊急ボタンです。",
    action: "タップすると連絡先や対応フローを案内します。"
  }
  // 必要に応じて追加可能
};
