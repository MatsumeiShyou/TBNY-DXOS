import { Job, Customer, Driver } from '../types';
import { timeToMinutes } from './timeUtils';

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
  period: string;
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
  customers: Customer[],
  masterItems: { id: string, name: string }[] = []
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

  const groups: PrintableGroup[] = [];
  let currentGroupBlocks: PrintableBlock[] = [];
  let currentPeriod = '';
  let prevJobEndTime = -1;

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

    let manager = '';
    if (customer?.supplierName) {
      manager = customer.supplierName;
    } else {
      const match = customerName.match(/[（(]([^）)]+)[）)]/);
      if (match) {
        manager = match[1];
      }
    }
    if (manager.length > 5) {
      manager = manager.substring(0, 5) + '...';
    }

    const items: PrintableItem[] = [];
    if (customer?.items && Array.isArray(customer.items)) {
      customer.items.forEach(itemId => {
        const masterItem = masterItems.find(mi => mi.id === itemId);
        if (masterItem) {
          items.push({
            name: masterItem.name,
            estimatedWeight: '',
            actualWeight: ''
          });
        }
      });
    }
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

    const startMins = job.startTime ? timeToMinutes(job.startTime) : -1;
    // 顧客のデフォルト滞在時間、または30分
    const duration = job.duration || customer?.defaultDuration || 30;

    let isNewGroup = false;

    if (currentGroupBlocks.length === 0) {
      isNewGroup = true;
    } else {
      // 直前のジョブ終了時間より、今回のジョブ開始時間が遅ければ（間が空いていれば）新しいグループ
      if (startMins !== -1 && prevJobEndTime !== -1 && startMins > prevJobEndTime) {
        isNewGroup = true;
      }
    }

    if (isNewGroup) {
      if (currentGroupBlocks.length > 0) {
        groups.push({
          period: currentPeriod,
          blocks: [
            createAtsugiBlock(`group-${groups.length}-start`),
            ...currentGroupBlocks,
            createAtsugiBlock(`group-${groups.length}-end`),
          ],
        });
      }

      currentGroupBlocks = [];

      if (startMins === -1) {
        currentPeriod = '未定';
      } else if (startMins < 8 * 60) {
        currentPeriod = '早朝';
      } else if (startMins < 12 * 60) {
        currentPeriod = '午前';
      } else if (startMins < 17 * 60) {
        currentPeriod = '午後';
      } else {
        currentPeriod = '夜間';
      }
    }

    currentGroupBlocks.push(block);

    if (startMins !== -1) {
      prevJobEndTime = startMins + duration;
    } else {
      prevJobEndTime = -1;
    }
  });

  if (currentGroupBlocks.length > 0) {
    groups.push({
      period: currentPeriod,
      blocks: [
        createAtsugiBlock(`group-${groups.length}-start`),
        ...currentGroupBlocks,
        createAtsugiBlock(`group-${groups.length}-end`),
      ],
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
