import { describe, it, expect } from 'vitest';
import { buildPrintableData } from './printUtils';
import { Driver, Job, Customer } from '../types';

describe('printUtils', () => {
  it('should transform data correctly into grouped blocks', () => {
    const drivers: Driver[] = [
      { id: 'd1', name: '田中', currentVehicle: '1号車', course: 'A' }
    ];

    const customers: Customer[] = [
      { 
        id: 'c1', 
        name: '株式会社A', 
        address: '東京都渋谷区...', 
        defaultDuration: 15,
        scheduleRules: { mon: ['every'], wed: ['every'], fri: ['every'] },
        isDeleted: false,
        isInvalid: false,
      },
      { 
        id: 'c2', 
        name: '株式会社B', 
        address: '東京都新宿区...', 
        defaultDuration: 20, 
        note: '顧客マスタ備考',
        scheduleRules: { mon: ['every'], tue: ['every'], wed: ['every'], thu: ['every'], fri: ['every'], sat: ['every'], sun: ['every'] },
        isDeleted: false,
        isInvalid: false,
      }
    ];

    const jobs: Job[] = [
      {
        id: 'j1',
        driverId: 'd1',
        title: '株式会社A',
        originalCustomerId: 'c1',
        startTime: '07:30', // 早朝
        duration: 15,
        note: 'ジョブ固有備考'
      },
      {
        id: 'j2',
        driverId: 'd1',
        title: '株式会社B',
        originalCustomerId: 'c2',
        startTime: '13:00', // pm
        duration: 20,
        note: '顧客マスタ備考' // 同じ備考
      },
      {
        id: 'j3',
        driverId: 'd1',
        title: '孤児データ',
        originalCustomerId: 'unknown',
        startTime: '09:00', // am
        duration: 30,
        isOrphan: true
      }
    ];

    const result = buildPrintableData('d1', drivers, jobs, customers as any);
    
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.driverName).toBe('田中');
    expect(result.vehicleName).toBe('1号車');
    expect(result.groups.length).toBe(3); // 早朝, am, pm の3グループが生成されるはず

    const earlyGroup = result.groups.find(g => g.period === '早朝');
    expect(earlyGroup).toBeDefined();
    expect(earlyGroup?.blocks.length).toBe(3); // atsugi, j1, atsugi
    expect(earlyGroup?.blocks[1].customerName).toBe('株式会社A');
    expect(earlyGroup?.blocks[1].schedule).toBe('(月・水・金)');
    expect(earlyGroup?.blocks[1].rowCount).toBe(3); // 最低3行

    const amGroup = result.groups.find(g => g.period === '午前');
    expect(amGroup).toBeDefined();
    expect(amGroup?.blocks.length).toBe(3); // atsugi, j3, atsugi
    expect(amGroup?.blocks[1].customerName).toBe('【顧客マスタ未解決】');
    
    const pmGroup = result.groups.find(g => g.period === '午後');
    expect(pmGroup).toBeDefined();
    expect(pmGroup?.blocks.length).toBe(3); // atsugi, j2, atsugi
    expect(pmGroup?.blocks[1].customerName).toBe('株式会社B');
    expect(pmGroup?.blocks[1].schedule).toBe('(毎日)');
    // 備考が重複していないか確認
    expect(pmGroup?.blocks[1].notes.filter(n => n.includes('顧客マスタ備考')).length).toBe(1);
  });
});
