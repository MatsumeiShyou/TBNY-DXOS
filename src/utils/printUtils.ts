import { Job, Customer, Driver } from '../types';

export type PrintableItem = {
  name: string;
  estimatedWeight: string;
  actualWeight: string;
};

export type PrintableBlock = {
  id: string;
  isAtsugi: boolean;
  sequence: number | string;
  manager: string;
  customerName: string;
  schedule: string;
  address: string;
  notes: string[];
  plannedStartTime: string;
  items: PrintableItem[];
  rowCount: number; // 最低3、アイテム数に応じて増加
};

export type PrintableGroup = {
  period: '早朝' | 'am' | 'pm';
  blocks: PrintableBlock[];
};

export type PrintableDispatchSheetData = {
  date: string;
  driverName: string;
  vehicleName: string;
  groups: PrintableGroup[];
};

function formatSchedule(scheduleRules?: Record<string, string[]>): string {
  if (!scheduleRules) return '';
  const dayMap: Record<string, string> = { mon: '月', tue: '火', wed: '水', thu: '木', fri: '金', sat: '土', sun: '日' };
  const activeDays = Object.keys(dayMap).filter(d => scheduleRules[d] && scheduleRules[d].length > 0);
  if (activeDays.length === 0) return '';
  if (activeDays.length === 7) return '(毎日)';
  return `(${activeDays.map(d => dayMap[d]).join('・')})`;
}

function createAtsugiBlock(id: string): PrintableBlock {
  return {
    id,
    isAtsugi: true,
    sequence: '',
    manager: '',
    customerName: '厚木事業所',
    schedule: '',
    address: '', // 画像では厚木事業所の住所は空欄
    notes: [],
    plannedStartTime: '',
    items: [],
    rowCount: 3,
  };
}

export function buildPrintableData(
  driverId: string,
  drivers: Driver[],
  jobs: Job[],
  customers: Customer[]
): PrintableDispatchSheetData | null {
  const driver = drivers.find((d) => d.id === driverId);
  if (!driver) return null;

  const targetJobs = jobs.filter((j) => j.driverId === driverId);

  // 1. startTime昇順, ないものは後ろ
  const sortedJobs = [...targetJobs].sort((a, b) => {
    if (a.startTime && b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    if (a.startTime && !b.startTime) return -1;
    if (!a.startTime && b.startTime) return 1;
    return 0;
  });

  const earlyMorningBlocks: PrintableBlock[] = [];
  const amBlocks: PrintableBlock[] = [];
  const pmBlocks: PrintableBlock[] = [];

  sortedJobs.forEach((job, index) => {
    const customer = customers.find((c) => c.id === job.originalCustomerId);
    const isOrphan = job.isOrphan || (job.originalCustomerId && !customer);

    const prefixes: string[] = [];
    if (job.preferredTime) prefixes.push(`【時間指定】${job.preferredTime}着`);
    if (job.requiredVehicle || customer?.requiredVehicle) prefixes.push('【要車両】');
    if (job.isDeleted || customer?.isDeleted) prefixes.push('【削除済】');
    if (job.isSuspended) prefixes.push('【一時停止】');

    let customerName = customer?.name || job.title;
    let address = customer?.address || '';
    if (isOrphan) {
      customerName = '【顧客マスタ未解決】';
      address = '【顧客マスタ未解決】';
      prefixes.push(`【顧客マスタ未解決】`);
    }

    const cNote = customer?.note || '';
    const jNote = job.note || '';
    let noteStr = '';
    if (isOrphan && job.originalCustomerId) {
      noteStr = `[ID: ${job.originalCustomerId}] ${jNote}`;
    } else if (cNote && jNote) {
      if (cNote === jNote) {
        noteStr = cNote;
      } else {
        noteStr = `${cNote} / ${jNote}`;
      }
    } else {
      noteStr = cNote || jNote;
    }
    if (noteStr) prefixes.push(noteStr);

    // 抽出：括弧内（例：「㈱ﾘﾗｲｽﾞ（DSP）」から「DSP」を取り出す）
    let manager = '';
    if (customer?.supplierName) {
      manager = customer.supplierName;
    } else {
      const match = customerName.match(/[（(]([^）)]+)[）)]/);
      if (match) {
        manager = match[1];
        // 名前から括弧部分を削除するかは要検討だが、画像を見ると「富士ロジ（長沼）」の長沼は残ってて、PSなどの管理名が別にある。
        // 今回はそのまま抽出のみ行う。
      }
    }
    // 特別に DSP, PS, アイイ などがよく使われる
    if (manager.length > 5) {
      manager = manager.substring(0, 5) + '...'; // 長すぎる場合は切る
    }

    // items の変換（現在 job に items はないが、将来的に拡張されることを見越す）
    const items: PrintableItem[] = [];
    // ダミーで空を少し入れておく？ いや、items が無ければ空配列でよい。

    const rowCount = Math.max(3, items.length);

    const block: PrintableBlock = {
      id: job.id,
      isAtsugi: false,
      sequence: index + 1,
      manager,
      customerName,
      schedule: formatSchedule(customer?.scheduleRules),
      address,
      plannedStartTime: job.startTime || '',
      notes: prefixes,
      items,
      rowCount,
    };

    // 時間帯による振り分け
    if (job.startTime) {
      const [h] = job.startTime.split(':').map(Number);
      if (h < 8) {
        earlyMorningBlocks.push(block);
      } else if (h < 12) {
        amBlocks.push(block);
      } else {
        pmBlocks.push(block);
      }
    } else {
      amBlocks.push(block);
    }
  });

  const groups: PrintableGroup[] = [];

  if (earlyMorningBlocks.length > 0) {
    groups.push({
      period: '早朝',
      blocks: [createAtsugiBlock('early-start'), ...earlyMorningBlocks, createAtsugiBlock('early-end')]
    });
  }
  if (amBlocks.length > 0) {
    groups.push({
      period: 'am',
      blocks: [createAtsugiBlock('am-start'), ...amBlocks, createAtsugiBlock('am-end')]
    });
  }
  if (pmBlocks.length > 0) {
    groups.push({
      period: 'pm',
      blocks: [createAtsugiBlock('pm-start'), ...pmBlocks, createAtsugiBlock('pm-end')]
    });
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return {
    date: dateStr,
    driverName: driver.name,
    vehicleName: driver.currentVehicle || '',
    groups,
  };
}
