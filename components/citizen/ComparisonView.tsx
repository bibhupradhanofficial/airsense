'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { AQIGauge } from './AQIGauge';
import { getPollutantStatus } from '@/lib/aqi-utils';

interface PollutantRow {
    name: string;
    unit: string;
    loc1Value: number;
    loc2Value: number;
}

interface ComparisonViewProps {
    loc1: {
        name: string;
        aqi: number;
    };
    loc2: {
        name: string;
        aqi: number;
    };
    pollutants: PollutantRow[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ loc1, loc2, pollutants }) => {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 border-zinc-100 shadow-sm flex flex-col items-center">
                    <p className="text-lg font-bold text-zinc-900 mb-6">{loc1.name}</p>
                    <AQIGauge aqi={loc1.aqi} />
                </Card>
                <Card className="p-8 border-zinc-100 shadow-sm flex flex-col items-center">
                    <p className="text-lg font-bold text-zinc-900 mb-6">{loc2.name}</p>
                    <AQIGauge aqi={loc2.aqi} />
                </Card>
            </div>

            <Card className="overflow-hidden border-zinc-100 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-zinc-900">Pollutant</th>
                            <th className="px-6 py-4 text-sm font-semibold text-zinc-900">{loc1.name}</th>
                            <th className="px-6 py-4 text-sm font-semibold text-zinc-900">{loc2.name}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {pollutants.map((pollutant) => {
                            const isLoc1Worse = pollutant.loc1Value > pollutant.loc2Value;

                            return (
                                <tr key={pollutant.name} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-zinc-900">{pollutant.name}</span>
                                        <span className="ml-1 text-[10px] text-zinc-400 uppercase tracking-tighter">({pollutant.unit})</span>
                                    </td>
                                    <td className={`px-6 py-4 text-sm ${isLoc1Worse ? 'font-bold underline decoration-red-400 decoration-2 underline-offset-4' : 'text-zinc-600'}`}>
                                        {pollutant.loc1Value}
                                    </td>
                                    <td className={`px-6 py-4 text-sm ${!isLoc1Worse ? 'font-bold underline decoration-red-400 decoration-2 underline-offset-4' : 'text-zinc-600'}`}>
                                        {pollutant.loc2Value}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
