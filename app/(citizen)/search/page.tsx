'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
    Activity,
    Flame,
    ChevronRight,
} from 'lucide-react';
import { getAQIDisplay, getAQICategory } from '@/lib/aqi-utils';
import { useAQISubscription } from '@/lib/realtime/useAQISubscription';
import { useAQIStore } from '@/store/aqiStore';
import { createClient } from '@/lib/supabase/client';
import { FireRiskAssessment, degreesToCardinal } from '@/lib/api-clients/firms';
import { searchLocations } from '@/lib/api-clients/geocoding';

const POPULAR_CITIES = [
    'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Bhubaneswar', 'Pune'
];

interface Location {
    id: string | null;
    name: string;
    city: string;
    state: string;
    country: string;
    lat: number;
    lng: number;
    aqi: number;
    pollutants?: {
        pm25?: number;
        pm10?: number;
        no2?: number;
        so2?: number;
        co?: number;
        o3?: number;
    };
    lastUpdated: string;
}

const fetchDataForLocation = async (name: string): Promise<Location> => {
    const supabase = createClient();

    // Try to find the location in our database first (check name or city)
    const { data: dbLocation } = await supabase
        .from('locations')
        .select('*')
        .or(`name.ilike.%${name}%,city.ilike.%${name}%`)
        .limit(1)
        .maybeSingle();

    if (dbLocation) {
        // Fetch latest reading from DB
        const { data: latestReading } = await supabase
            .from('aqi_readings')
            .select('*')
            .eq('location_id', dbLocation.id)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        return {
            id: dbLocation.id,
            name: dbLocation.name,
            city: dbLocation.city,
            state: dbLocation.state || 'State',
            country: dbLocation.country || 'India 🇮🇳',
            lat: dbLocation.latitude,
            lng: dbLocation.longitude,
            aqi: latestReading?.aqi_value || 150,
            pollutants: latestReading ? {
                pm25: latestReading.pm25 ?? undefined,
                pm10: latestReading.pm10 ?? undefined,
                no2: latestReading.no2 ?? undefined,
                so2: latestReading.so2 ?? undefined,
                co: latestReading.co ?? undefined,
                o3: latestReading.o3 ?? undefined,
            } : undefined,
            lastUpdated: latestReading ? new Date(latestReading.recorded_at).toLocaleTimeString() : 'Recently',
        };
    }

    // Fallback: Using Nominatim (OSM) for forward geocoding
    try {
        const suggestions = await searchLocations(name);
        if (suggestions.length > 0) {
            const loc = suggestions[0];
            return {
                id: null,
                name: loc.display_name.split(',')[0],
                city: loc.city || name,
                state: loc.state || 'India',
                country: 'India 🇮🇳',
                lat: loc.lat,
                lng: loc.lon,
                aqi: 120, // Default for non-monitored locations
                lastUpdated: 'Just now',
            };
        }
    } catch (e) {
        console.error("Geocoding fallback failed", e);
    }

    // Ultimate mock fallback
    return {
        id: null,
        name,
        city: name,
        state: 'State',
        country: 'India 🇮🇳',
        lat: name.toLowerCase() === 'mumbai' ? 19.0760 : (name.toLowerCase() === 'pune' ? 18.5204 : 28.6139),
        lng: name.toLowerCase() === 'mumbai' ? 72.8777 : (name.toLowerCase() === 'pune' ? 73.8567 : 77.2090),
        aqi: 120,
        lastUpdated: 'Just now',
    };
};

function SearchParamsHandler({ onSearch }: { onSearch: (q: string) => void }) {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const lastQueryRef = React.useRef<string | null>(null);

    useEffect(() => {
        if (query && query !== lastQueryRef.current) {
            onSearch(query);
            lastQueryRef.current = query;
        }
    }, [query, onSearch]);

    return null;
}

export default function SearchPage() {
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [compareLocation, setCompareLocation] = useState<Location | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [fireRisk, setFireRisk] = useState<FireRiskAssessment | null>(null);
    const [nearbyStations, setNearbyStations] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);

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
            pollutants: liveReading.pollutants,
            lastUpdated: new Date(liveReading.timestamp).toLocaleTimeString(),
        };
    }, [selectedLocation, readings]);

    // Fetch Nearby Stations & Trend Data
    useEffect(() => {
        if (!selectedLocation) return;

        const fetchExtraData = async () => {
            const supabase = createClient();

            // 1. Fetch real trend data if location exists in DB
            if (selectedLocation.id) {
                const { data: history } = await supabase
                    .from('aqi_readings')
                    .select('aqi_value, recorded_at')
                    .eq('location_id', selectedLocation.id)
                    .order('recorded_at', { ascending: false })
                    .limit(24);

                if (history && history.length > 0) {
                    setTrendData(history.reverse().map(h => ({
                        time: new Date(h.recorded_at).getHours() + ':00',
                        aqi: h.aqi_value
                    })));
                } else {
                    // Fallback to random if no history
                    setTrendData(Array.from({ length: 24 }).map((_, i) => ({
                        time: `${(new Date().getHours() - (23 - i) + 24) % 24}:00`,
                        aqi: Math.max(0, selectedLocation.aqi + Math.floor(Math.random() * 40 - 20)),
                    })));
                }
            } else {
                // Mock trend for non-DB locations
                setTrendData(Array.from({ length: 24 }).map((_, i) => ({
                    time: `${(new Date().getHours() - (23 - i) + 24) % 24}:00`,
                    aqi: Math.max(0, selectedLocation.aqi + Math.floor(Math.random() * 40 - 20)),
                })));
            }

            // 2. Fetch Nearby Stations (same city)
            const { data: otherLocs } = await supabase
                .from('locations')
                .select('id, name, latitude, longitude')
                .eq('city', selectedLocation.city)
                .neq('name', selectedLocation.name)
                .limit(5);

            if (otherLocs && otherLocs.length > 0) {
                const stationIds = otherLocs.map(l => l.id);
                const { data: latestReadings } = await supabase
                    .from('aqi_readings')
                    .select('location_id, aqi_value')
                    .in('location_id', stationIds)
                    .order('recorded_at', { ascending: false });

                const formatted = otherLocs.map(l => {
                    const reading = latestReadings?.find(r => r.location_id === l.id);
                    return {
                        id: l.id,
                        name: l.name,
                        distance: 2.5 + Math.random() * 5, // Mock distance
                        aqi: reading?.aqi_value || 100
                    };
                });
                setNearbyStations(formatted);
            } else {
                // Fallback to some defaults if nothing found
                setNearbyStations([
                    { id: 'f1', name: 'City Center', distance: 1.2, aqi: selectedLocation.aqi + 5 },
                    { id: 'f2', name: 'Industrial Zone', distance: 4.8, aqi: selectedLocation.aqi + 25 },
                ]);
            }
        };

        fetchExtraData();
    }, [selectedLocation]);

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

    const handleSearch = React.useCallback(async (name: string) => {
        setIsLoading(true);
        const data = await fetchDataForLocation(name);

        if (isComparing) {
            setCompareLocation(data);
        } else {
            setSelectedLocation(data);

            // Populate global store with initial DB reading if it exists
            if (data.id && data.pollutants) {
                useAQIStore.getState().setReading(data.id, {
                    aqi: data.aqi,
                    pollutants: data.pollutants as any,
                    source: 'auto',
                    timestamp: new Date().toISOString()
                });
            }

            // Fetch fire risk for main location
            try {
                const fireResp = await fetch(`/api/firms?lat=${data.lat}&lon=${data.lng}&radius=300&days=2`);
                if (fireResp.ok) {
                    const fireData = await fireResp.json();
                    setFireRisk(fireData);
                }
            } catch (e) {
                console.error("Failed to fetch fire data during search", e);
            }

            // Update recent searches only for main location
            setRecentSearches(prev => {
                const updated = [name, ...prev.filter(s => s !== name)].slice(0, 5);
                localStorage.setItem('recent_searches', JSON.stringify(updated));
                return updated;
            });
        }

        setIsLoading(false);
    }, [isComparing]);

    const handleRefresh = async () => {
        if (!selectedLocation) return;
        const now = Date.now();
        const storageKey = `last_refresh_${selectedLocation.name.toLowerCase().replace(/\s+/g, '_')}`;
        const lastRefresh = localStorage.getItem(storageKey);
        const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

        if (lastRefresh && now - parseInt(lastRefresh) < REFRESH_INTERVAL_MS) {
            const remaining = Math.ceil((REFRESH_INTERVAL_MS - (now - parseInt(lastRefresh))) / 60000);
            alert(`Rate limit reached. Please wait ${remaining} minute(s) before refreshing ${selectedLocation.name} again.`);
            return;
        }

        setIsRefreshing(true);
        localStorage.setItem(storageKey, now.toString());
        const data = await fetchDataForLocation(selectedLocation.name);
        setSelectedLocation(data);

        // Update store
        if (data.id && data.pollutants) {
            useAQIStore.getState().setReading(data.id, {
                aqi: data.aqi,
                pollutants: data.pollutants as any,
                source: 'auto',
                timestamp: new Date().toISOString()
            });
        }
        try {
            const fireResp = await fetch(`/api/firms?lat=${data.lat}&lon=${data.lng}&radius=300&days=2`);
            if (fireResp.ok) {
                const fireData = await fireResp.json();
                setFireRisk(fireData);
            }
        } catch (e) {
            console.error("Failed to refresh fire data", e);
        }
        setIsRefreshing(false);
    };


    const pollutantComparison = useMemo(() => {
        // Prefer live selected location data
        const p = liveSelectedLocation?.pollutants;

        return [
            { name: 'PM2.5', unit: 'µg/m³', loc1Value: p?.pm25 || 156.4, loc2Value: 142.1 },
            { name: 'PM10', unit: 'µg/m³', loc1Value: p?.pm10 || 245.2, loc2Value: 210.8 },
            { name: 'NO2', unit: 'ppb', loc1Value: p?.no2 || 45.1, loc2Value: 38.4 },
            { name: 'SO2', unit: 'ppb', loc1Value: p?.so2 || 12.4, loc2Value: 15.2 },
            { name: 'CO', unit: 'ppm', loc1Value: p?.co || 2.1, loc2Value: 1.8 },
            { name: 'O3', unit: 'ppb', loc1Value: p?.o3 || 34.0, loc2Value: 42.5 },
        ];
    }, [liveSelectedLocation]);

    return (
        <div className="container mx-auto max-w-6xl px-4 py-12 space-y-16">
            <Suspense fallback={null}>
                <SearchParamsHandler onSearch={handleSearch} />
            </Suspense>
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

                                {/* Fire Activity Card */}
                                <Card className="p-6 bg-white border border-zinc-100 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                                            <Flame className="h-4 w-4 text-orange-500" />
                                            Nearby Fire Activity
                                        </h3>
                                        {fireRisk && fireRisk.totalFiresInRegion > 0 && (
                                            <Badge className="bg-orange-100 text-orange-700 border-none font-bold">
                                                {fireRisk.totalFiresInRegion} Sensors
                                            </Badge>
                                        )}
                                    </div>

                                    {!fireRisk || fireRisk.totalFiresInRegion === 0 ? (
                                        <p className="text-zinc-500 text-sm py-2">
                                            No active fires detected within 300km. <span className="text-emerald-500">✓</span>
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                {fireRisk.hotspots.slice(0, 4).map((fire, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-xs pb-3 border-b border-zinc-50 last:border-0 last:pb-0">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-bold text-zinc-800">
                                                                {Math.round(fire.distanceKm || 0)}km • {degreesToCardinal(fire.windBearing || 0)}
                                                            </span>
                                                            <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Upwind Hotspot</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-black text-orange-600">{fire.frp} MW</div>
                                                            <div className="text-[10px] text-zinc-400">Intensity</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-2">
                                                <p className="text-[10px] text-zinc-400 italic">
                                                    Updated every 3–12 hours via NASA VIIRS satellite
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </Card>

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
