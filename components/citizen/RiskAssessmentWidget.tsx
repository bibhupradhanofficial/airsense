'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAQIDisplay, resolveUserLocation } from '@/lib/aqi-utils';
import { Shield, AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

type ProfileType = 'General' | 'Child' | 'Elderly' | 'Asthmatic' | 'Pregnant';

const PROFILE_ADVICE: Record<ProfileType, { dos: string[], donts: string[] }> = {
    General: {
        dos: ['Check AQI before outdoor exercise', 'Keep windows closed if AQI > 150', 'Use an air purifier if possible'],
        donts: ['Prolonged outdoor exertion when AQI is High', 'Operating diesel generators in poorly ventilated areas']
    },
    Child: {
        dos: ['Limit outdoor playtime during peak pollution hours', 'Encourage indoor activities', 'Keep classrooms well-ventilated with purified air'],
        donts: ['Playing near heavy traffic roads', 'Outdoor sports matches on "Very Unhealthy" days']
    },
    Elderly: {
        dos: ['Stay indoors during morning and evening peaks', 'Keep rescue medications (if any) handy', 'Monitor for chest pain or shortness of breath'],
        donts: ['Early morning walks when smog is visible', 'Strenuous domestic chores during high pollution']
    },
    Asthmatic: {
        dos: ['Carry your inhaler at all times', 'Follow your asthma action plan strictly', 'Use N95 masks when going out'],
        donts: ['Outdoor activities without medication', 'Ignoring minor wheezing or coughing']
    },
    Pregnant: {
        dos: ['Minimize exposure to traffic exhaust', 'Eat antioxidant-rich foods', 'Consult doctor if experiencing respiratory distress'],
        donts: ['Walking in high-traffic areas', 'Using chemical-heavy indoor sprays/cleaners']
    }
};

export const RiskAssessmentWidget: React.FC = () => {
    const [profile, setProfile] = useState<ProfileType>('General');
    const [location, setLocation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const loc = await resolveUserLocation();
            // Mocking an AQI for the loc
            setLocation({ ...loc, aqi: 165 }); // Moderate/Unhealthy for demo
            setLoading(false);
        };
        init();
    }, []);

    const advice = PROFILE_ADVICE[profile];
    const aqiDisplay = location ? getAQIDisplay(location.aqi) : null;

    return (
        <Card className="p-8 border-teal-100 shadow-xl bg-gradient-to-br from-white to-teal-50/30 overflow-hidden relative">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Badge className="bg-teal-600">Personalized Safety</Badge>
                        <h3 className="text-3xl font-black text-zinc-900 leading-tight">Am I at Risk?</h3>
                        <p className="text-zinc-500">Get specific health advice based on your profile and current local conditions.</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Select Your Profile</label>
                        <Select onValueChange={(v) => setProfile(v as ProfileType)} defaultValue="General">
                            <SelectTrigger className="w-full h-14 rounded-2xl border-zinc-200 bg-white text-lg font-medium focus:ring-teal-500/20">
                                <SelectValue placeholder="Select profile" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-zinc-100">
                                <SelectItem value="General">General Adult</SelectItem>
                                <SelectItem value="Child">Child / Student</SelectItem>
                                <SelectItem value="Elderly">Elderly (65+)</SelectItem>
                                <SelectItem value="Asthmatic">Respiratory Issues (Asthma/COPD)</SelectItem>
                                <SelectItem value="Pregnant">Pregnant Women</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {location && (
                        <div className="p-4 rounded-2xl bg-white border border-teal-100 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-tighter">Current Location</p>
                                    <p className="font-bold text-zinc-900">{location.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black" style={{ color: aqiDisplay?.color }}>{location.aqi}</p>
                                <p className="text-[10px] uppercase font-bold text-zinc-400">AQI Index</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border border-teal-50 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-2 pb-4 border-b border-zinc-100">
                        <div className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                            <Info className="h-4 w-4" />
                        </div>
                        <h4 className="font-black text-xl text-zinc-900">Your Action Plan</h4>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <p className="text-xs font-black text-teal-600 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3" /> Recommended Do's
                            </p>
                            <ul className="space-y-2">
                                {advice.dos.map((item, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-zinc-600 bg-teal-50/50 p-2 rounded-xl">
                                        <span className="shrink-0 text-teal-600 mt-0.5">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                                <XCircle className="h-3 w-3" /> Crucial Dont's
                            </p>
                            <ul className="space-y-2">
                                {advice.donts.map((item, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-zinc-600 bg-red-50/50 p-2 rounded-xl">
                                        <span className="shrink-0 text-red-500 mt-0.5">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/20 blur-3xl rounded-full -mr-20 -mt-20"></div>
        </Card>
    );
};
