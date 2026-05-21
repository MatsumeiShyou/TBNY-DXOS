import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SummaryCard from './SummaryCard';
import DashboardCharts from './DashboardCharts';
import type { WeighingRecord, DashboardSummary, TimeSeriesData, View, ChartFilter, Item, DateRange } from '../../types';
import { getRecentRecords, getDashboardSummary, getDashboardTimeSeries, itemApi } from '../../services/api';
import Skeleton from '../ui/Skeleton';
import Card from '../ui/Card';
import { FileText, Search, UserPlus, FileClock, Calendar, FileQuestion, AlertOctagon } from 'lucide-react';
import Button from '../ui/Button';
import { useAppContext } from '../../hooks/useAppContext';
import ItemFilter from './ItemFilter';

interface DashboardScreenProps {
    setCurrentView: (view: View) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ setCurrentView }) => {
  const [recentRecords, setRecentRecords] = useState<WeighingRecord[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '3m'>('30d');
  const { withStatusHandling } = useAppContext();

  useEffect(() => {
      itemApi.get()
          .then(setAllItems)
          .catch(err => {
              console.error('Failed to fetch items in DashboardScreen:', err);
              setAllItems([]);
          });
  }, []);

  const fetchData = useCallback(async () => {
    const formatDate = (date: Date): string => date.toISOString().split('T')[0];
    
    // モックデータ用に現在の日付を固定
    const endDate = new Date('2025-11-20T23:59:59');
    const startDate = new Date(endDate);
    
    if (chartPeriod === '7d') {
        startDate.setDate(startDate.getDate() - 7);
    } else if (chartPeriod === '30d') {
        startDate.setDate(startDate.getDate() - 30);
    } else { // '3m'
        startDate.setMonth(startDate.getMonth() - 3);
    }

    const dateRange: DateRange = {
        from: formatDate(startDate),
        to: formatDate(endDate)
    };
      
    withStatusHandling(async () => {
      // サマリーと最近の記録は、現在の仕様では期間に依存しない
      const [records, summaryData, timeSeriesData] = await Promise.all([
        getRecentRecords(5),
        getDashboardSummary(),
        getDashboardTimeSeries(dateRange) // APIコールに期間を渡す
      ]);
      setRecentRecords(records);
      setSummary(summaryData);
      setTimeSeries(timeSeriesData);
    });
  }, [chartPeriod, withStatusHandling]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTimeSeries = useMemo(() => {
    if (selectedItemIds.length === 0) {
        return timeSeries;
    }

    const allItemsMap = new Map(allItems.map(item => [item.id, item.name]));

    return timeSeries.map(dataPoint => {
        const filteredItems: Record<string, number> = {};
        let filteredNetWeight = 0;

        for (const itemId of selectedItemIds) {
            const itemName = allItemsMap.get(itemId);
            if (itemName && dataPoint.items[itemName] !== undefined) {
                const itemWeight = dataPoint.items[itemName];
                filteredItems[itemName] = itemWeight;
                filteredNetWeight += itemWeight;
            }
        }
        
        return {
            ...dataPoint,
            netWeight: filteredNetWeight,
            items: filteredItems,
        };
    });
  }, [timeSeries, selectedItemIds, allItems]);

  const handleDrillDown = (filter: ChartFilter) => {
    setCurrentView({ name: 'records', params: { ...filter } });
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isInitialLoading = !summary || allItems.length === 0;

  return (
    <div className="tw-space-y-8">
      <div>
        <h1 className="tw-text-3xl tw-font-bold">ダッシュボード</h1>
        <p className="tw-text-text-secondary tw-mt-1">ようこそ。システム全体の概要を確認できます。</p>
      </div>

      <ItemFilter 
        allItems={allItems} 
        selectedIds={selectedItemIds}
        onSelectionChange={setSelectedItemIds} 
      />

      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6">
          {isInitialLoading ? (
              <>
                  <Skeleton className="tw-h-32" />
                  <Skeleton className="tw-h-32" />
                  <Skeleton className="tw-h-32" />
                  <Skeleton className="tw-h-32" />
              </>
          ) : summary && (
              <>
                  <SummaryCard title="本日の記録数" value={summary.todayCount} icon={FileClock} />
                  <SummaryCard title="今月の記録数" value={summary.monthCount} icon={Calendar} />
                  <SummaryCard title="未確認の記録" value={summary.unconfirmedCount} icon={FileQuestion} color="blue"  />
                  <SummaryCard title="エラー件数" value={summary.errorCount} icon={AlertOctagon} color="red" />
              </>
          )}
      </div>
      
      <DashboardCharts 
        data={filteredTimeSeries} 
        loading={isInitialLoading} 
        onDrillDown={handleDrillDown}
        period={chartPeriod}
        onPeriodChange={setChartPeriod}
      />

      <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-8">
        <div className="lg:tw-col-span-2">
            <h2 className="tw-text-xl tw-font-semibold tw-mb-4">最近の記録</h2>
            <Card className="tw-p-0 tw-overflow-hidden">
                <div className="tw-overflow-x-auto">
                    <table className="tw-w-full tw-text-sm">
                        <thead className="tw-bg-background-tertiary">
                            <tr>
                                <th className="tw-p-3 tw-text-left tw-font-semibold tw-text-text-secondary">記録ID</th>
                                <th className="tw-p-3 tw-text-left tw-font-semibold tw-text-text-secondary">日時</th>
                                <th className="tw-p-3 tw-text-left tw-font-semibold tw-text-text-secondary">ドライバー</th>
                                <th className="tw-p-3 tw-text-right tw-font-semibold tw-text-text-secondary">差引重量</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isInitialLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="tw-border-t tw-border-border-default">
                                        <td className="tw-p-3"><Skeleton className="tw-h-4 tw-w-32" /></td>
                                        <td className="tw-p-3"><Skeleton className="tw-h-4 tw-w-40" /></td>
                                        <td className="tw-p-3"><Skeleton className="tw-h-4 tw-w-24" /></td>
                                        <td className="tw-p-3 tw-flex tw-justify-end"><Skeleton className="tw-h-4 tw-w-16" /></td>
                                    </tr>
                                ))
                            ) : (
                                recentRecords.map((record) => (
                                    <tr key={record.recordId} className={`tw-border-t tw-border-border-default hover:tw-bg-background-tertiary tw-cursor-pointer`} onClick={() => handleDrillDown({ dateFrom: record.weighedAt.split('T')[0], dateTo: record.weighedAt.split('T')[0]})}>
                                        <td className="tw-p-3 tw-font-mono tw-text-xs">{record.recordId}</td>
                                        <td className="tw-p-3">{formatDate(record.weighedAt)}</td>
                                        <td className="tw-p-3">{record.driverName}</td>
                                        <td className="tw-p-3 tw-text-right tw-font-semibold">{record.netWeight.toLocaleString()} kg</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
        <div>
          <h2 className="tw-text-xl tw-font-semibold tw-mb-4">クイックアクション</h2>
          <div className="tw-space-y-3">
             <Button variant="outline" size="lg" icon={<Search />} className="tw-w-full tw-justify-start" onClick={() => setCurrentView({ name: 'records' })}>記録を検索</Button>
             <Button variant="outline" size="lg" icon={<FileText />} className="tw-w-full tw-justify-start">CSVエクスポート</Button>
             <Button variant="outline" size="lg" icon={<UserPlus />} className="tw-w-full tw-justify-start">ユーザー追加</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
