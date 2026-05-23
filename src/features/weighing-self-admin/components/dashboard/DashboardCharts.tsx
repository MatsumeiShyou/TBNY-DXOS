/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TimeSeriesData, ChartFilter, Item } from '../../types';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import { itemApi } from '../../services/api';

interface DashboardChartsProps {
  data: TimeSeriesData[];
  onDrillDown: (filter: ChartFilter) => void;
  loading: boolean;
  period: '7d' | '30d' | '3m';
  onPeriodChange: (period: '7d' | '30d' | '3m') => void;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ data, onDrillDown, loading, period, onPeriodChange }) => {
    const [chartMetric, setChartMetric] = useState<'count' | 'netWeight'>('count');
    const [aggregationType, setAggregationType] = useState<'daily' | 'weekly'>('daily');
    const [allItems, setAllItems] = useState<Item[]>([]);

    useEffect(() => {
        itemApi.get()
            .then(items => setAllItems(items.sort((a, b) => a.name.localeCompare(b.name, 'ja'))))
            .catch(err => {
                console.error('Failed to fetch items in DashboardCharts:', err);
                setAllItems([]);
            });
    }, []);

    const COLORS = useMemo(() => ['#60a5fa', '#4ade80', '#fbbf24', '#f472b6', '#a78bfa', '#2dd4bf'], []);

    const itemColorMap = useMemo(() => {
        const map: Record<string, string> = {};
        allItems.forEach((item, index) => {
            map[item.name] = COLORS[index % COLORS.length];
        });
        return map;
    }, [allItems, COLORS]);

    const dailyChartData = useMemo(() => {
        return data.map(d => ({
            ...d,
            ...d.items,
        }));
    }, [data]);

    const weeklyChartData = useMemo(() => {
        if (data.length === 0) {
            return [];
        }

        const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
        const series: { key: string; count: number; netWeight: number; items: Record<string, number> }[] = weekDays.map(day => ({
            key: day,
            count: 0,
            netWeight: 0,
            items: {},
        }));
        
        data.forEach(r => {
            const dayIndex = new Date(r.key + 'T00:00:00').getDay();
            series[dayIndex].count += r.count;
            series[dayIndex].netWeight += r.netWeight;
            Object.entries(r.items).forEach(([itemName, itemWeight]) => {
                if (!series[dayIndex].items[itemName]) {
                    series[dayIndex].items[itemName] = 0;
                }
                series[dayIndex].items[itemName] += itemWeight;
            });
        });
        
        return series.map(d => ({
            ...d,
            ...d.items,
        }));
    }, [data]);

    if (loading) {
        return (
            <Card className="tw-p-6">
                <Skeleton className="tw-h-80 tw-w-full" />
            </Card>
        );
    }

    if (data.length === 0) {
        return (
            <Card className="tw-p-6 tw-h-96 tw-flex tw-items-center tw-justify-center">
                <div className="tw-text-center tw-text-text-secondary">
                    <p>グラフを表示するデータがありません。</p>
                    <p className="tw-text-sm">
                        この期間に記録データがありません。
                    </p>
                </div>
            </Card>
        );
    }

    const isDrilldownEnabled = aggregationType === 'daily';

    const handleBarClick = (payload: any) => {
        if (!isDrilldownEnabled) return;
        const dataKey = payload.payload?.key || payload.key;
        if (dataKey) {
            onDrillDown({
                dateFrom: dataKey,
                dateTo: dataKey,
            });
        }
    };

    const displayData = aggregationType === 'daily' ? dailyChartData : weeklyChartData;

    const chartTitle = aggregationType === 'daily'
        ? (chartMetric === 'count' ? '日別計量件数' : '日別差引重量（品目別）')
        : (chartMetric === 'count' ? '曜日別計量件数' : '曜日別差引重量（品目別）');
    
    const chartRangeTitle = period === '7d'
        ? '(過去1週間)'
        : period === '30d' 
        ? '(過去30日間)' 
        : `(過去3ヶ月)`;

    return (
        <Card className="tw-p-6">
            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between sm:tw-items-center tw-mb-4 tw-gap-4">
                <h2 className="tw-text-xl tw-font-semibold">
                  {chartTitle}
                  <span className="tw-text-sm tw-font-normal tw-text-text-secondary tw-ml-2">{chartRangeTitle}</span>
                </h2>
                <div className="tw-flex tw-items-center tw-gap-2 tw-flex-wrap">
                    <div className="tw-flex tw-items-center tw-gap-1 tw-p-1 tw-bg-slate-100 tw-dark:bg-slate-800/50 tw-rounded-lg tw-self-start">
                        <button onClick={() => onPeriodChange('7d')} className={`tw-px-3 tw-py-1 tw-text-xs tw-rounded-md tw-transition-all ${period === '7d' ? 'tw-bg-white tw-text-slate-800 tw-shadow-sm tw-font-bold tw-dark:bg-blue-600 tw-dark:text-white tw-dark:shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'tw-text-slate-500 hover:tw-bg-slate-200/50 tw-dark:text-slate-400 tw-dark:hover:bg-slate-700/50'}`}>過去1週間</button>
                        <button onClick={() => onPeriodChange('30d')} className={`tw-px-3 tw-py-1 tw-text-xs tw-rounded-md tw-transition-all ${period === '30d' ? 'tw-bg-white tw-text-slate-800 tw-shadow-sm tw-font-bold tw-dark:bg-blue-600 tw-dark:text-white tw-dark:shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'tw-text-slate-500 hover:tw-bg-slate-200/50 tw-dark:text-slate-400 tw-dark:hover:bg-slate-700/50'}`}>過去30日間</button>
                        <button onClick={() => onPeriodChange('3m')} className={`tw-px-3 tw-py-1 tw-text-xs tw-rounded-md tw-transition-all ${period === '3m' ? 'tw-bg-white tw-text-slate-800 tw-shadow-sm tw-font-bold tw-dark:bg-blue-600 tw-dark:text-white tw-dark:shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'tw-text-slate-500 hover:tw-bg-slate-200/50 tw-dark:text-slate-400 tw-dark:hover:bg-slate-700/50'}`}>過去3ヶ月</button>
                    </div>
                    <div className="tw-flex tw-items-center tw-gap-1 tw-p-1 tw-bg-slate-100 tw-dark:bg-slate-800/50 tw-rounded-lg tw-self-start">
                        <button onClick={() => setAggregationType('daily')} className={`tw-px-3 tw-py-1 tw-text-xs tw-rounded-md tw-transition-all ${aggregationType === 'daily' ? 'tw-bg-white tw-text-slate-800 tw-shadow-sm tw-font-bold tw-dark:bg-blue-600 tw-dark:text-white tw-dark:shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'tw-text-slate-500 hover:tw-bg-slate-200/50 tw-dark:text-slate-400 tw-dark:hover:bg-slate-700/50'}`}>日別</button>
                        <button onClick={() => setAggregationType('weekly')} className={`tw-px-3 tw-py-1 tw-text-xs tw-rounded-md tw-transition-all ${aggregationType === 'weekly' ? 'tw-bg-white tw-text-slate-800 tw-shadow-sm tw-font-bold tw-dark:bg-blue-600 tw-dark:text-white tw-dark:shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'tw-text-slate-500 hover:tw-bg-slate-200/50 tw-dark:text-slate-400 tw-dark:hover:bg-slate-700/50'}`}>曜日別</button>
                    </div>
                    <div className="tw-flex tw-items-center tw-gap-1 tw-p-1 tw-bg-slate-100 tw-dark:bg-slate-800/50 tw-rounded-lg tw-self-start">
                        <button onClick={() => setChartMetric('count')} className={`tw-px-3 tw-py-1 tw-text-xs tw-rounded-md tw-transition-all ${chartMetric === 'count' ? 'tw-bg-white tw-text-slate-800 tw-shadow-sm tw-font-bold tw-dark:bg-blue-600 tw-dark:text-white tw-dark:shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'tw-text-slate-500 hover:tw-bg-slate-200/50 tw-dark:text-slate-400 tw-dark:hover:bg-slate-700/50'}`}>件数</button>
                        <button onClick={() => setChartMetric('netWeight')} className={`tw-px-3 tw-py-1 tw-text-xs tw-rounded-md tw-transition-all ${chartMetric === 'netWeight' ? 'tw-bg-white tw-text-slate-800 tw-shadow-sm tw-font-bold tw-dark:bg-blue-600 tw-dark:text-white tw-dark:shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'tw-text-slate-500 hover:tw-bg-slate-200/50 tw-dark:text-slate-400 tw-dark:hover:bg-slate-700/50'}`}>重量</button>
                    </div>
                </div>
            </div>

            <div className="tw-h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={displayData}
                        margin={{ top: 5, right: 20, left: -10, bottom: 20 }}
                        onClick={handleBarClick}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                        <XAxis 
                            dataKey="key" 
                            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} 
                            tickLine={{ stroke: 'var(--color-text-secondary)' }}
                            axisLine={{ stroke: 'var(--color-border-subtle)' }}
                            tickFormatter={aggregationType === 'daily' ? (tick) => new Date(tick + 'T00:00:00').getDate().toString() : undefined}
                        />
                        <YAxis 
                            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} 
                            tickLine={{ stroke: 'var(--color-text-secondary)' }}
                            axisLine={{ stroke: 'var(--color-border-subtle)' }}
                            tickFormatter={(value) => value.toLocaleString()}
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip chartMetric={chartMetric} />} cursor={{ fill: 'rgb(var(--color-interactive-default) / 0.1)' }}/>
                        <Legend verticalAlign="bottom" wrapperStyle={{paddingTop: '10px'}}/>
                        
                        {chartMetric === 'count' ? (
                            <Bar 
                                dataKey="count" 
                                name="計量件数"
                                fill="rgb(var(--color-interactive-default))"
                                radius={[4, 4, 0, 0]} 
                                style={{ cursor: isDrilldownEnabled ? 'pointer' : 'default' }}
                            />
                        ) : (
                            allItems.map((item, index) => (
                                <Bar 
                                    key={item.id}
                                    dataKey={item.name}
                                    stackId="a"
                                    name={item.name}
                                    fill={itemColorMap[item.name] || COLORS[index % COLORS.length]}
                                    style={{ cursor: isDrilldownEnabled ? 'pointer' : 'default' }}
                                />
                            ))
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};


interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  chartMetric: 'count' | 'netWeight';
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, chartMetric }) => {
    if (active && payload && payload.length) {
        if (chartMetric === 'count') {
            return (
                <div className="tw-p-2 tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md tw-shadow-lg tw-text-sm">
                  <p className="tw-font-bold">{`${label}`}</p>
                  <p style={{ color: payload[0].fill }}>{`計量件数: ${payload[0].value.toLocaleString()} 件`}</p>
                </div>
            );
        }

        const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);

        if (total === 0) {
             return (
                <div className="tw-p-2 tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md tw-shadow-lg tw-text-sm">
                  <p className="tw-font-bold">{`${label}`}</p>
                  <p className="tw-text-text-secondary">データなし</p>
                </div>
            );
        }

        return (
            <div className="tw-p-3 tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md tw-shadow-lg tw-text-sm tw-min-w-[200px]">
                <p className="tw-font-bold tw-mb-2">{`${label}`}</p>
                <div className="tw-space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={`item-${index}`} className="tw-flex tw-items-center tw-justify-between">
                            <div className="tw-flex tw-items-center">
                                <span className="tw-w-2.5 tw-h-2.5 tw-rounded-full tw-mr-2" style={{ backgroundColor: entry.color }}></span>
                                <span>{entry.name}:</span>
                            </div>
                            <span className="tw-font-semibold tw-ml-4">{entry.value.toLocaleString()} kg</span>
                        </div>
                    ))}
                </div>
                {payload.length > 1 && (
                    <div className="tw-border-t tw-border-border-default tw-mt-2 tw-pt-2 tw-flex tw-justify-between tw-font-bold">
                        <span>合計:</span>
                        <span>{total.toLocaleString()} kg</span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export default DashboardCharts;
