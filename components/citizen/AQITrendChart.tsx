'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

interface TrendData {
    time: string;
    aqi: number;
}

interface AQITrendChartProps {
    data: TrendData[];
}

export const AQITrendChart: React.FC<AQITrendChartProps> = ({ data }) => {
    return (
        <Card className="p-6 shadow-sm border-zinc-100 h-[350px] w-full">
            <h3 className="text-sm font-semibold text-zinc-500 mb-6 uppercase tracking-wider">24-Hour AQI Trend</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#888' }}
                            minTickGap={30}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#888' }}
                            domain={[0, 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#0D9488', fontWeight: 'bold' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="aqi"
                            stroke="#0D9488"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorAqi)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
