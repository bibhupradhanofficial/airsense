"use client";

import { useState, useMemo, useEffect } from 'react';
import Map, { Source, Layer, NavigationControl, Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { useAQISubscription } from '@/lib/realtime/useAQISubscription';
import { useAQIStore } from '@/store/aqiStore';
import { getAQICategory } from '@/lib/utils/aqi';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { applyCityFilter } from '@/lib/admin/queryHelpers';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';
import { AQIColorScale } from '@/components/shared/AQIColorScale';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const CITY_COORDINATES: Record<string, { lat: number, lng: number, zoom: number }> = {
    'Mumbai': { lat: 19.0760, lng: 72.8777, zoom: 11 },
    'New Delhi': { lat: 28.6139, lng: 77.2090, zoom: 11 },
    'Delhi': { lat: 28.6139, lng: 77.2090, zoom: 11 },
    'Bangalore': { lat: 12.9716, lng: 77.5946, zoom: 11 },
    'Chennai': { lat: 13.0827, lng: 80.2707, zoom: 11 },
    'Kolkata': { lat: 22.5726, lng: 88.3639, zoom: 11 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867, zoom: 11 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714, zoom: 11 },
    'Pune': { lat: 18.5204, lng: 73.8567, zoom: 11 },
    'Jaipur': { lat: 26.9124, lng: 75.7873, zoom: 11 },
    'Lucknow': { lat: 26.8467, lng: 80.9462, zoom: 11 },
};

export function CityHeatMap() {
    const supabase = createClient();
    const { adminContext, cityName } = useAdminContext();
    const { selectedCityId } = useAdminStore();

    const activeCity = selectedCityId || cityName;

    const [viewState, setViewState] = useState({
        longitude: 77.2090, // Default Delhi
        latitude: 28.6139,
        zoom: 10,
        pitch: 45,
        bearing: -17.6
    });

    // Update viewState when activeCity changes
    useEffect(() => {
        if (activeCity && CITY_COORDINATES[activeCity]) {
            const coords = CITY_COORDINATES[activeCity];
            setViewState(prev => ({
                ...prev,
                longitude: coords.lng,
                latitude: coords.lat,
                zoom: coords.zoom
            }));
        }
    }, [activeCity]);

    const [activeLayer, setActiveLayer] = useState<'heatmap' | 'satellite'>('heatmap');

    // Real-time subscription
    useAQISubscription();
    const readings = useAQIStore((state) => state.readings);

    // Fetch locations to display as markers
    const { data: locations } = useQuery({
        queryKey: ['locations', adminContext, selectedCityId],
        queryFn: async () => {
            if (!adminContext) return [];

            let query = supabase.from('locations').select('*');
            query = applyCityFilter(query, adminContext, selectedCityId);

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!adminContext
    });

    const { data: interpolatedGrid, isLoading } = useQuery({
        queryKey: ['heatmap-grid', viewState.longitude, viewState.latitude],
        queryFn: async () => {
            const delta = 0.2;
            const minLng = viewState.longitude - delta;
            const minLat = viewState.latitude - delta;
            const maxLng = viewState.longitude + delta;
            const maxLat = viewState.latitude + delta;

            const bbox = `${minLat},${minLng},${maxLat},${maxLng}`;
            const res = await fetch(`/api/interpolate?bbox=${bbox}&resolution=0.01`);
            if (!res.ok) throw new Error('Failed to fetch heatmap grid');
            return res.json();
        },
        staleTime: 60000,
    });

    const heatmapLayer = useMemo(() => ({
        id: 'aqi-heatmap',
        type: 'heatmap',
        paint: {
            'heatmap-weight': [
                'interpolate',
                ['linear'],
                ['get', 'aqi'],
                0, 0,
                500, 1
            ],
            'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 1,
                15, 3
            ],
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0,255,0,0)',
                0.2, '#10b981', // Good (Green)
                0.4, '#eab308', // Moderate (Yellow)
                0.6, '#f97316', // Poor (Orange)
                0.8, '#ef4444', // Very Poor (Red)
                1, '#7f1d1d'    // Severe (Dark Red)
            ],
            'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 2,
                15, 20
            ] as any,
            'heatmap-opacity': 0.7,
        }
    }), []);

    // ... inside component ...
    // markers logic
    const markers = useMemo(() => {
        return locations?.map((loc: any) => {
            const reading = readings[loc.id];
            const aqi = reading?.aqi || 0;
            const category = getAQICategory(aqi);
            const isHighSeverity = aqi > 200;

            return (
                <Marker
                    key={loc.id}
                    longitude={loc.longitude}
                    latitude={loc.latitude}
                    anchor="center"
                >
                    <div className="relative group cursor-pointer">
                        {isHighSeverity && (
                            <div className="absolute inset-0 -m-2 rounded-full border-2 border-red-500 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                        )}

                        <div
                            className="w-4 h-4 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-125"
                            style={{ backgroundColor: category.color }}
                            title={`${loc.name}: AQI ${aqi}`}
                        />

                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#0A1628] border border-[#1e2a3b] rounded p-2 text-[10px] whitespace-nowrap z-50">
                            <p className="font-bold text-white">{loc.name}</p>
                            <p style={{ color: category.color }}>AQI: {aqi} ({category.label})</p>
                        </div>
                    </div>
                </Marker>
            );
        });
    }, [locations, readings]);

    return (
        <Card className="bg-[#132238] border-[#1e2a3b] h-[600px] flex flex-col overflow-hidden relative group shadow-2xl">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b border-[#1e2a3b] z-10 bg-[#0A1628]/80 backdrop-blur-sm absolute top-0 w-full left-0">
                <CardTitle className="text-lg font-bold text-white flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-[#00D4FF]" />
                    {activeCity ? `${activeCity} Spatial AQI Engine` : 'Spatial Interpolation Engine'}
                </CardTitle>

                {/* Layer Controls */}
                <div className="flex bg-[#0A1628] rounded-md border border-[#1e2a3b] p-1 shadow-inner">
                    <button
                        onClick={() => setActiveLayer('heatmap')}
                        className={`px-3 py-1 text-xs font-semibold rounded ${activeLayer === 'heatmap' ? 'bg-[#00D4FF] text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Heatmap
                    </button>
                    <button
                        onClick={() => setActiveLayer('satellite')}
                        className={`px-3 py-1 text-xs font-semibold rounded ${activeLayer === 'satellite' ? 'bg-[#00D4FF] text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Satellite
                    </button>
                </div>
            </CardHeader>

            <div className="flex-1 w-full relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-[#0A1628]/50 backdrop-blur-sm z-20 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4FF]" />
                    </div>
                )}

                <Map
                    {...(viewState as any)}
                    onMove={(evt: any) => setViewState(evt.viewState)}
                    mapStyle={activeLayer === 'satellite' ? 'mapbox://styles/mapbox/satellite-v9' : 'mapbox://styles/mapbox/dark-v11'}
                    mapboxAccessToken={MAPBOX_TOKEN}
                    style={{ width: '100%', height: '100%' }}
                    attributionControl={false}
                >
                    <NavigationControl {...({ position: 'bottom-right' } as any)} />

                    {interpolatedGrid && activeLayer === 'heatmap' && (
                        <Source type="geojson" data={interpolatedGrid}>
                            <Layer {...(heatmapLayer as any)} />
                        </Source>
                    )}

                    {/* Sensor Markers */}
                    {markers}
                </Map>
            </div>

            <div className="absolute bottom-6 left-6 z-10 p-3 bg-[#0A1628]/90 backdrop-blur-md border border-[#1e2a3b] rounded-xl shadow-xl">
                <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">AQI Density</p>
                <AQIColorScale />
            </div>
        </Card>
    );
}
