'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Info } from 'lucide-react';

const MASK_DATA = [
    { name: 'No Mask', effectiveness: '0%', bestFor: 'Clean Air', aqiLimit: 50, color: 'zinc' },
    { name: 'Surgical', effectiveness: '20-40%', bestFor: 'Large Droplets', aqiLimit: 100, color: 'blue' },
    { name: 'N95 Respirator', effectiveness: '95%', bestFor: 'PM2.5 / Smog', aqiLimit: 300, color: 'teal' },
    { name: 'N99 Respirator', effectiveness: '99%', bestFor: 'Severe Pollution', aqiLimit: 500, color: 'purple' },
];

export const MaskGuide: React.FC = () => {
    return (
        <Card className="p-8 border-zinc-100 shadow-sm overflow-hidden bg-white">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">The Mask Protection Guide</h3>
                <Badge variant="secondary" className="bg-teal-50 text-teal-700 py-1.5 px-4 font-bold border-teal-100">Recommended for AQI &gt; 150</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {MASK_DATA.map((mask) => (
                    <div key={mask.name} className="flex flex-col p-6 rounded-3xl border border-zinc-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all group">
                        <div className="space-y-4 mb-6">
                            <div className="h-14 w-14 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:bg-white shadow-sm transition-colors">
                                <span className="text-2xl">😷</span>
                            </div>
                            <div>
                                <h4 className="font-black text-lg text-zinc-900 leading-tight">{mask.name}</h4>
                                <p className="text-xs font-bold text-zinc-400 mt-1">Best for: {mask.bestFor}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mt-auto">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Effectiveness</p>
                                <p className="text-2xl font-black text-teal-600">{mask.effectiveness}</p>
                            </div>

                            <div className="pt-4 border-t border-zinc-100 space-y-3">
                                <div className="flex items-center gap-2 text-xs font-medium">
                                    {mask.aqiLimit >= 150 ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-400" />}
                                    <span className={mask.aqiLimit >= 150 ? 'text-zinc-900' : 'text-zinc-400'}>High Pollution</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium">
                                    {mask.aqiLimit >= 300 ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-red-400" />}
                                    <span className={mask.aqiLimit >= 300 ? 'text-zinc-900' : 'text-zinc-400'}>Severe Smog</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-teal-50 flex items-start gap-4 text-teal-800 text-sm">
                <Info className="h-5 w-5 shrink-0 mt-0.5 text-teal-600" />
                <p><strong>Pro-Tip:</strong> To be effective, N95/N99 masks must have a tight seal around the nose and mouth. Facial hair or improper fit can significantly reduce protection.</p>
            </div>
        </Card>
    );
};
