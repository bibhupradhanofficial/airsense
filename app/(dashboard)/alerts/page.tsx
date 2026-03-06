
"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { applyCityFilter } from '@/lib/admin/queryHelpers';
import { Bell, AlertTriangle, Info, ShieldAlert, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AlertsPage() {
    const supabase = createClient();
    const { adminContext } = useAdminContext();
    const { selectedCityId } = useAdminStore();

    const { data: alerts, isLoading } = useQuery({
        queryKey: ['system-alerts', adminContext, selectedCityId],
        queryFn: async () => {
            if (!adminContext) return [];
            // Mocking alerts from AQI readings for now as there's no alerts table
            let query = supabase
                .from('aqi_readings')
                .select('*, locations!inner(name, city)')
                .gte('aqi_value', 200)
                .order('recorded_at', { ascending: false })
                .limit(20);

            query = applyCityFilter(query, adminContext, selectedCityId);
            const { data, error } = await query;
            if (error) throw error;
            return data as any[];
        },
        enabled: !!adminContext
    });

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
                    <Bell className="h-8 w-8 mr-3 text-[#00D4FF]" />
                    System Alerts
                </h1>
                <p className="text-gray-400 mt-2">Real-time air quality anomalies and sensor health notifications.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-[#132238] rounded-2xl animate-pulse" />
                    ))
                ) : alerts?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-[#132238]/50 rounded-3xl border border-dashed border-[#1e2a3b]">
                        <ShieldAlert className="h-12 w-12 text-gray-700 mb-4" />
                        <h3 className="text-white font-medium">No active alerts</h3>
                        <p className="text-gray-500 text-sm">All regions are operating within normal parameters.</p>
                    </div>
                ) : (
                    alerts?.map((alert) => (
                        <Card key={alert.id} className="bg-[#132238] border-[#1e2a3b] hover:bg-[#1a2b45] transition-colors border-l-4 border-l-orange-500 overflow-hidden">
                            <CardContent className="p-5 flex items-center">
                                <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20 mr-5">
                                    <AlertTriangle className="h-6 w-6 text-orange-500" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-orange-400 border-orange-500/30 text-[10px] font-bold">
                                            HIGH AQI EVENT
                                        </Badge>
                                        <span className="text-[10px] text-gray-500 font-mono">
                                            {alert.id.slice(0, 8).toUpperCase()}
                                        </span>
                                    </div>
                                    <h4 className="text-white font-bold text-lg">
                                        Elevated Pollution Spike Detected in {alert.locations.name}
                                    </h4>
                                    <div className="flex items-center text-xs text-gray-500 mt-2 gap-4">
                                        <span className="flex items-center">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {alert.locations.city}
                                        </span>
                                        <span className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {new Date(alert.recorded_at).toLocaleString()}
                                        </span>
                                        <span className="flex items-center text-orange-400 font-bold">
                                            AQI: {Math.round(alert.aqi_value)}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <Badge className="bg-orange-500/20 text-orange-400 border-none font-bold">
                                        PENDING REVIEW
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
