'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LocationSearch } from '@/components/citizen/LocationSearch';
import { AQIGauge } from '@/components/citizen/AQIGauge';
import { PollutantCard } from '@/components/citizen/PollutantCard';
import { AQITrendChart } from '@/components/citizen/AQITrendChart';
import { NearbyStations } from '@/components/citizen/NearbyStations';
import { ComparisonView } from '@/components/citizen/ComparisonView';
import { HealthAdvisory } from '@/components/citizen/HealthAdvisory';
import { PushAlertBanner } from '@/components/citizen/PushAlertBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    Info,
    RefreshCcw,
    History,
    TrendingUp,
    ArrowLeftRight,
    Globe,
    MinusCircle,
    PlusCircle,
    Wind,
    Activity
} from 'lucide-react';
import { getAQIDisplay, getAQICategory } from '@/lib/aqi-utils';
import { useAQISubscription } from '@/lib/realtime/useAQISubscription';
import { useAQIStore } from '@/store/aqiStore';
import { createClient } from '@/lib/supabase/client';

const POPULAR_CITIES = [
    'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Bhubaneswar', 'Pune'
];

interface Location {
    id: string | null;
    name: string;
    state: string;
    country: string;
    lat: number;
    lng: number;
    aqi: number;
    lastUpdated: string;
}

export default function SearchPage() {
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [compareLocation, setCompareLocation] = useState<Location | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Initialize real-time subscription for selected location
    const { isConnected } = useAQISubscription(selectedLocation?.id ?? undefined);
    const readings = useAQIStore((state) => state.readings);

    // Sync selected location with real-time store
    const liveSelectedLocation = useMemo(() => {
        if (!selectedLocation?.id) return selectedLocation;
        const liveReading = readings[selectedLocation.id];
        if (!liveReading) return selectedLocation;

        return {
            ...selectedLocation,
            aqi: liveReading.aqi,
            lastUpdated: new Date(liveReading.timestamp).toLocaleTimeString(),
        };
    }, [selectedLocation, readings]);

    useEffect(() => {
        const saved = localStorage.getItem('recent_searches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse recent searches", e);
            }
        }
    }, []);

    const fetchDataForLocation = async (name: string) => {
        const supabase = createClient();

        // Try to find the location in our database first
        const { data: dbLocation } = await supabase
            .from('locations')
            .select('*')
            .ilike('name', `%${name}%`)
            .limit(1)
            .single();

        if (dbLocation) {
            // Fetch latest reading from DB
            const { data: latestReading } = await supabase
                .from('aqi_readings')
                .select('*')
                .eq('location_id', dbLocation.id)
                .order('recorded_at', { ascending: false })
                .limit(1)
                .single();

            return {
                id: dbLocation.id,
                name: dbLocation.name,
                state: dbLocation.state || 'State',
                country: dbLocation.country || 'India 🇮🇳',
                lat: dbLocation.latitude,
                lng: dbLocation.longitude,
                aqi: latestReading?.aqi_value || Math.floor(Math.random() * 250) + 50,
                lastUpdated: latestReading ? new Date(latestReading.recorded_at).toLocaleTimeString() : new Date().toLocaleTimeString(),
            };
        }

        // Mock fallback if not in DB
        return {
            id: null,
            name,
            state: 'State',
            country: 'India 🇮🇳',
            lat: name.toLowerCase() === 'mumbai' ? 19.0760 : 28.6139 + (Math.random() - 0.5) * 0.1,
            lng: name.toLowerCase() === 'mumbai' ? 72.8777 : 77.2090 + (Math.random() - 0.5) * 0.1,
            aqi: Math.floor(Math.random() * 250) + 50,
            lastUpdated: new Date().toLocaleTimeString(),
        };
    };

    const handleSearch = async (name: string) => {
        setIsLoading(true);
        const data = await fetchDataForLocation(name);

        if (isComparing) {
            setCompareLocation(data);
        } else {
            setSelectedLocation(data);
            // Update recent searches only for main location
            const updated = [name, ...recentSearches.filter(s => s !== name)].slice(0, 5);
            setRecentSearches(updated);
            localStorage.setItem('recent_searches', JSON.stringify(updated));
        }

        setIsLoading(false);
    };

    const handleRefresh = async () => {
        if (!selectedLocation) return;

        const now = Date.now();
        const storageKey = `last_refresh_${selectedLocation.name.toLowerCase().replace(/\s+/g, '_')}`;
        const lastRefresh = localStorage.getItem(storageKey);
        const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

        if (lastRefresh && now - parseInt(lastRefresh) < REFRESH_INTERVAL_MS) {
            const remaining = Math.ceil((REFRESH_INTERVAL_MS - (now - parseInt(lastRefresh))) / 60000);
            alert(`Rate limit reached. Please wait ${remaining} minute(s) before refreshing ${selectedLocation.name} again.`);
            return;
        }

        setIsRefreshing(true);
        localStorage.setItem(storageKey, now.toString());

        const data = await fetchDataForLocation(selectedLocation.name);
        setSelectedLocation(data);

        setIsRefreshing(false);
    };

    const trendData = useMemo(() => Array.from({ length: 24 }).map((_, i) => ({
        time: `${(new Date().getHours() - (23 - i) + 24) % 24}:00`,
        aqi: Math.floor(Math.random() * 100) + 100,
    })), []);

    const nearbyStations = useMemo(() => {
        if (selectedLocation?.name.toLowerCase() === 'mumbai') {
            return [
                { id: 'm1', name: 'Colaba, Mumbai', distance: 2.1, aqi: 145 },
                { id: 'm2', name: 'Worli, Mumbai', distance: 5.4, aqi: 128 },
                { id: 'm3', name: 'Bandra Kurla Complex', distance: 8.2, aqi: 167 },
                { id: 'm4', name: 'Sion, Mumbai', distance: 10.5, aqi: 192 },
                { id: 'm5', name: 'Borivali East', distance: 22.1, aqi: 98 },
            ];
        }
        return [
            { id: '1', name: 'R.K. Puram', distance: 4.2, aqi: 234 },
            { id: '2', name: 'Dwarka Sector 8', distance: 12.5, aqi: 187 },
            { id: '3', name: 'NSIT Dwarka', distance: 15.1, aqi: 156 },
            { id: '4', name: 'Sirifort', distance: 8.8, aqi: 210 },
            { id: '5', name: 'Mandir Marg', distance: 10.2, aqi: 195 },
        ];
    }, [selectedLocation]);

    const pollutantComparison = useMemo(() => [
        { name: 'PM2.5', unit: 'µg/m³', loc1Value: 156.4, loc2Value: 142.1 },
        { name: 'PM10', unit: 'µg/m³', loc1Value: 245.2, loc2Value: 210.8 },
        { name: 'NO2', unit: 'ppb', loc1Value: 45.1, loc2Value: 38.4 },
        { name: 'SO2', unit: 'ppb', loc1Value: 12.4, loc2Value: 15.2 },
        { name: 'CO', unit: 'ppm', loc1Value: 2.1, loc2Value: 1.8 },
        { name: 'O3', unit: 'ppb', loc1Value: 34.0, loc2Value: 42.5 },
    ], []);

    return (
        <div className="container mx-auto max-w-6xl px-4 py-12 space-y-16">
            {/* Search Interface */}
            <section className="flex flex-col items-center gap-8 text-center mt-8">
                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Search AQI Explorer</h1>
                    <p className="text-zinc-500 max-w-md mx-auto">Enter any city or neighborhood to see live air quality and historical trends.</p>
                </div>

                <div className="w-full max-w-2xl space-y-4">
                    <LocationSearch onSelect={(l) => handleSearch(l.name)} />

                    <div className="flex flex-col gap-4">
                        {recentSearches.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                <History className="h-4 w-4 text-zinc-400" />
                                {recentSearches.map(city => (
                                    <button
                                        key={city}
                                        onClick={() => handleSearch(city)}
                                        className="px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-600 hover:bg-zinc-200 transition-colors"
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <TrendingUp className="h-4 w-4 text-zinc-400" />
                            {POPULAR_CITIES.map(city => (
                                <button
                                    key={city}
                                    onClick={() => handleSearch(city)}
                                    className="px-3 py-1 rounded-full border border-zinc-200 text-xs font-medium text-zinc-600 hover:border-teal-300 hover:bg-teal-50 transition-colors"
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Activity className="h-10 w-10 text-teal-600 animate-pulse" />
                    <p className="text-zinc-500 font-medium">Fetching real-time data...</p>
                </div>
            )}

            {liveSelectedLocation && !isLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="lg:col-span-3">
                        <PushAlertBanner />
                    </div>

                    {/* Results Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 lg:col-span-3">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-500/20 text-2xl relative">
                                📍
                                {isConnected && (
                                    <div className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
                                    </div>
                                )}
                            </div>
                            <div className="text-left">
                                <h2 className="text-3xl font-black text-zinc-900 flex items-center gap-3">
                                    {liveSelectedLocation.name}
                                    {isConnected && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse py-0.5 px-2 text-[10px] font-black uppercase tracking-tighter">
                                            Live
                                        </Badge>
                                    )}
                                </h2>
                                <div className="flex items-center gap-2 text-zinc-500 mt-1">
                                    <span>{liveSelectedLocation.state}, {liveSelectedLocation.country}</span>
                                    <span className="text-zinc-200">•</span>
                                    <span className="text-xs font-mono">{liveSelectedLocation.lat.toFixed(4)}, {liveSelectedLocation.lng.toFixed(4)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3.5">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-100 flex items-center gap-2 py-1 px-3">
                                    <Globe className="h-3 w-3" /> Satellite + Meteorological Data
                                </Badge>
                                <div className="cursor-help text-zinc-400 hover:text-zinc-600">
                                    <Info className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                                <span>Last updated: {liveSelectedLocation.lastUpdated}</span>
                                <Button
                                    disabled={isRefreshing}
                                    onClick={handleRefresh}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full hover:bg-teal-50 hover:text-teal-600"
                                >
                                    <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {!isComparing ? (
                        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Main Gauges and Advisories */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-10 rounded-3xl shadow-sm border border-zinc-100 relative overflow-hidden">
                                    {isConnected && (
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-green-50/50 border border-green-100 text-[10px] font-bold text-green-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                Live Sync
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex flex-col items-center justify-center">
                                        <AQIGauge aqi={liveSelectedLocation.aqi} />
                                    </div>
                                    <div className="flex flex-col justify-center space-y-6">
                                        <div className="space-y-2 text-left">
                                            <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Current Quality</p>
                                            <p className="text-4xl font-black" style={{ color: getAQIDisplay(liveSelectedLocation.aqi).color }}>
                                                {getAQIDisplay(liveSelectedLocation.aqi).category}
                                            </p>
                                        </div>
                                        <p className="text-zinc-600 leading-relaxed text-left">
                                            {getAQIDisplay(liveSelectedLocation.aqi).description}
                                        </p>
                                        <div className="pt-4 border-t border-zinc-100 text-left">
                                            <p className="text-xs text-zinc-400 flex items-center gap-2">
                                                <Info className="h-3 w-3" /> Data from OpenAQ Network + Meteorological Analysis
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <HealthAdvisory aqi={liveSelectedLocation.aqi} />

                                <AQITrendChart data={trendData} />

                                <div className="flex justify-center">
                                    <Button
                                        onClick={() => setIsComparing(true)}
                                        className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-2xl h-14 px-8 font-bold gap-3 shadow-xl"
                                    >
                                        <PlusCircle className="h-5 w-5" /> Compare with another location
                                    </Button>
                                </div>
                            </div>

                            {/* Right Column: Nearby */}
                            <div className="space-y-8 text-left">
                                <NearbyStations
                                    stations={nearbyStations}
                                    onSelect={(s) => handleSearch(s.name)}
                                />
                                <Card className="p-6 bg-teal-900 text-white border-none shadow-xl overflow-hidden relative">
                                    <div className="relative z-10 space-y-4">
                                        <h3 className="font-black text-xl leading-tight">Join the Network</h3>
                                        <p className="text-teal-200 text-sm">Contribute hyper-local data from your neighborhood by installing an AirSense IoT node.</p>
                                        <Button className="bg-white text-teal-900 hover:bg-teal-50 w-full font-bold">Inquire About Hardware</Button>
                                    </div>
                                    <Wind className="absolute -bottom-4 -right-4 h-24 w-24 text-teal-800 opacity-50" />
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="lg:col-span-3 space-y-12">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-zinc-900">Comparison View</h3>
                                <Button
                                    onClick={() => {
                                        setIsComparing(false);
                                        setCompareLocation(null);
                                    }}
                                    variant="ghost"
                                    className="text-zinc-500 hover:text-red-600 font-bold gap-2"
                                >
                                    <MinusCircle className="h-5 w-5" /> Exit Comparison
                                </Button>
                            </div>

                            {!compareLocation ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200 gap-6">
                                    <div className="p-4 rounded-full bg-white shadow-md">
                                        <ArrowLeftRight className="h-10 w-10 text-teal-600" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-xl font-bold text-zinc-900">Select a second location</p>
                                        <p className="text-zinc-500 text-sm max-w-xs">Search for another city or area to compare its air quality side-by-side with {liveSelectedLocation.name}.</p>
                                    </div>
                                    <div className="w-full max-w-md">
                                        <LocationSearch onSelect={(l) => handleSearch(l.name)} />
                                    </div>
                                </div>
                            ) : (
                                <ComparisonView
                                    loc1={{ name: liveSelectedLocation.name, aqi: liveSelectedLocation.aqi }}
                                    loc2={{ name: compareLocation.name, aqi: compareLocation.aqi }}
                                    pollutants={pollutantComparison}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
