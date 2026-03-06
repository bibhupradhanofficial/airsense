
"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { applyCityFilter } from '@/lib/admin/queryHelpers';
import { ShieldAlert, CheckCircle2, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function PolicyHubPage() {
    const supabase = createClient();
    const { adminContext } = useAdminContext();
    const { selectedCityId } = useAdminStore();

    const { data: recommendations, isLoading } = useQuery({
        queryKey: ['policy-recommendations', adminContext, selectedCityId],
        queryFn: async () => {
            if (!adminContext) return [];
            let query = supabase
                .from('policy_recommendations')
                .select('*, locations!inner(name, city)')
                .order('created_at', { ascending: false });

            query = applyCityFilter(query, adminContext, selectedCityId);
            const { data, error } = await query;
            if (error) throw error;
            return data as any[];
        },
        enabled: !!adminContext
    });

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Policy Hub</h1>
                    <p className="text-gray-400 mt-2">AI-Generated environmental interventions and regulatory actions.</p>
                </div>
                <div className="flex gap-4">
                    <Card className="bg-[#132238] border-[#1e2a3b] p-3 flex items-center space-x-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Actioned</p>
                            <p className="text-lg font-bold text-white leading-none">12</p>
                        </div>
                    </Card>
                    <Card className="bg-[#132238] border-[#1e2a3b] p-3 flex items-center space-x-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <ShieldAlert className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Pending</p>
                            <p className="text-lg font-bold text-white leading-none">
                                {recommendations?.filter(r => r.status === 'pending').length || 0}
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <Card key={i} className="bg-[#132238] border-[#1e2a3b] h-32 animate-pulse" />
                    ))
                ) : recommendations?.length === 0 ? (
                    <div className="text-center py-20 bg-[#132238] rounded-3xl border border-dashed border-[#1e2a3b]">
                        <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-white font-bold">No Policy Recommendations</h3>
                        <p className="text-gray-500 text-sm">System is currently observing no critical air quality events.</p>
                    </div>
                ) : (
                    recommendations?.map((rec) => {
                        const content = typeof rec.recommendation_text === 'string'
                            ? JSON.parse(rec.recommendation_text)
                            : rec.recommendation_text;

                        return (
                            <Card key={rec.id} className="bg-[#132238] border-[#1e2a3b] overflow-hidden group hover:border-[#00D4FF]/30 transition-all">
                                <div className="flex flex-col md:flex-row">
                                    <div className={cn(
                                        "w-2 shrink-0",
                                        rec.severity === 'critical' ? 'bg-red-500' :
                                            rec.severity === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                                    )} />
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="border-[#1e2a3b] text-gray-400 font-mono text-[10px]">
                                                        {rec.id.slice(0, 8).toUpperCase()}
                                                    </Badge>
                                                    <Badge className={cn(
                                                        "font-bold text-[10px]",
                                                        rec.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                                    )}>
                                                        {rec.severity.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-[#00D4FF] transition-colors">
                                                    {content.headline || 'Policy Recommendation'}
                                                </h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 font-medium">LOCATION</p>
                                                <p className="text-sm text-white font-bold">{rec.locations.name}, {rec.locations.city}</p>
                                            </div>
                                        </div>

                                        <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-3xl">
                                            {rec.anomaly_summary}
                                        </p>

                                        <div className="bg-[#0A1628] rounded-2xl p-4 border border-[#1e2a3b]">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center">
                                                <ArrowRight className="h-3 w-3 mr-1 text-[#00D4FF]" />
                                                Proposed Interventions
                                            </p>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {content.immediateActions?.map((action: string, idx: number) => (
                                                    <li key={idx} className="flex items-start text-sm text-gray-300">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-[#00D4FF] mt-1.5 mr-2 shrink-0" />
                                                        {action}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-[#0A1628]/50 border-l border-[#1e2a3b] flex flex-col justify-center items-center gap-3 w-full md:w-48">
                                        <Button className="w-full bg-[#00D4FF] hover:bg-[#00b0d6] text-black font-bold h-11">
                                            Approve
                                        </Button>
                                        <Button variant="outline" className="w-full border-[#1e2a3b] text-gray-400 hover:text-white h-11">
                                            Dismiss
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
