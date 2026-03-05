"use client";

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { getAQIColor } from '@/lib/utils/aqi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const NATIONAL_CENTER: [number, number] = [78.9629, 20.5937];

export function NationalAQIMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const supabase = createClient();

    const { data: cityData, isLoading } = useQuery({
        queryKey: ['national-aqi-data'],
        queryFn: async () => {
            const { data: locations, error } = await supabase
                .from('locations')
                .select(`
                    id,
                    name,
                    city,
                    latitude,
                    longitude,
                    aqi_readings (
                        aqi_value,
                        pm25,
                        pm10,
                        no2,
                        so2,
                        co,
                        o3,
                        recorded_at
                    )
                `);

            if (error) throw error;

            // Group by city and aggregate
            const cityMap: Record<string, any> = {};

            locations.forEach(loc => {
                const city = loc.city;
                if (!cityMap[city]) {
                    cityMap[city] = {
                        name: city,
                        lat: loc.latitude,
                        lon: loc.longitude,
                        state: 'Region', // We don't have state in locations, using 'Region' as fallback
                        aqi: 0,
                        readingsCount: 0,
                        anomalies: 0,
                        pollutants: { pm25: 0, pm10: 0, no2: 0, so2: 0, co: 0, o3: 0 }
                    };
                }

                const readings = (loc as any).aqi_readings || [];
                readings.forEach((r: any) => {
                    cityMap[city].aqi += r.aqi_value;
                    cityMap[city].readingsCount += 1;
                    if (r.aqi_value > 300) cityMap[city].anomalies += 1;

                    // Aggregate pollutants for finding "top"
                    if (r.pm25) cityMap[city].pollutants.pm25 += r.pm25;
                    if (r.pm10) cityMap[city].pollutants.pm10 += r.pm10;
                });
            });

            return Object.values(cityMap).map((city: any) => {
                const avgAqi = city.readingsCount > 0 ? Math.round(city.aqi / city.readingsCount) : 0;

                // Simple logic for top pollutant
                const topPollutant = city.pollutants.pm25 > city.pollutants.pm10 ? 'PM2.5' : 'PM10';

                return {
                    name: city.name,
                    lat: city.lat,
                    lon: city.lon,
                    aqi: avgAqi,
                    state: city.state,
                    topPollutant,
                    anomalies: city.anomalies
                };
            }).sort((a, b) => b.aqi - a.aqi);
        }
    });

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: NATIONAL_CENTER,
            zoom: 4,
            attributionControl: false
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    useEffect(() => {
        if (!map.current || !cityData) return;

        // Clean up old markers
        const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
        existingMarkers.forEach(m => m.remove());

        cityData.forEach((city) => {
            const el = document.createElement('div');
            el.className = 'national-marker';

            const hexColor = city.aqi > 300 ? '#ef4444' : city.aqi > 200 ? '#f97316' : city.aqi > 100 ? '#eab308' : '#22c55e';
            const size = Math.max(12, city.aqi / 10);

            el.style.backgroundColor = hexColor;
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.boxShadow = `0 0 15px ${hexColor}`;
            el.style.cursor = 'pointer';

            const category = city.aqi > 300 ? 'Hazardous' : city.aqi > 200 ? 'Poor' : city.aqi > 100 ? 'Moderate' : 'Good';

            new mapboxgl.Marker(el)
                .setLngLat([city.lon, city.lat])
                .setPopup(
                    new mapboxgl.Popup({ offset: 25, closeButton: false })
                        .setHTML(`
                            <div class="p-3 bg-[#0A1628] text-white border border-[#1e2a3b] rounded-lg shadow-xl min-w-[200px]">
                                <div class="flex items-center justify-between mb-2">
                                    <h3 class="font-bold text-lg">${city.name}</h3>
                                    <span class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">${city.state}</span>
                                </div>
                                <div class="space-y-2">
                                    <div class="flex justify-between items-center bg-[#132238] p-2 rounded">
                                        <span class="text-sm font-medium">Current AQI</span>
                                        <span class="text-xl font-black" style="color: ${hexColor}">${city.aqi}</span>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div class="bg-[#132238] p-2 rounded flex flex-col items-center">
                                            <span class="text-[9px] text-gray-400 uppercase">Category</span>
                                            <span class="text-xs font-bold" style="color: ${hexColor}">${category}</span>
                                        </div>
                                        <div class="bg-[#132238] p-2 rounded flex flex-col items-center">
                                            <span class="text-[9px] text-gray-400 uppercase">Top Pollutant</span>
                                            <span class="text-xs font-bold text-teal-400">${city.topPollutant}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `)
                )
                .addTo(map.current!);
        });
    }, [cityData]);

    return (
        <div className="flex flex-col space-y-6">
            {/* Map Container */}
            <Card className="bg-[#132238] border-[#1e2a3b] overflow-hidden group shadow-2xl relative">
                <div className="absolute top-4 left-4 z-10 bg-[#0A1628]/80 backdrop-blur-md border border-[#1e2a3b] rounded-lg p-3">
                    <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-2">AQI Legend</h3>
                    <div className="space-y-1">
                        {[
                            { label: 'Hazardous (300+)', color: '#ef4444' },
                            { label: 'Poor (201-300)', color: '#f97316' },
                            { label: 'Moderate (101-200)', color: '#eab308' },
                            { label: 'Good (0-100)', color: '#22c55e' }
                        ].map(item => (
                            <div key={item.label} className="flex items-center space-x-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[10px] text-gray-300 font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <CardHeader className="border-b border-[#1e2a3b] bg-[#0A1628]/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-white text-lg">National Air Quality Distribution</CardTitle>
                    <Badge variant="outline" className="text-[#00D4FF] border-[#00D4FF]/30">LIVE National Stats</Badge>
                </CardHeader>
                <div ref={mapContainer} className="h-[500px] w-full" />
            </Card>

            {/* Rankings Table */}
            <Card className="bg-[#132238] border-[#1e2a3b] shadow-2xl">
                <CardHeader className="border-b border-[#1e2a3b]">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg font-bold">India City Performance Rankings</CardTitle>
                        <span className="text-xs text-gray-500 font-medium">Sorted by highest AQI</span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-[#0A1628]/80 backdrop-blur-sm">
                            <TableRow className="border-[#1e2a3b] hover:bg-transparent">
                                <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Rank</TableHead>
                                <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">City</TableHead>
                                <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">State</TableHead>
                                <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest text-right">AQI</TableHead>
                                <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest text-right">Top Source</TableHead>
                                <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest text-right">Anomalies</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cityData?.map((city, index) => (
                                <TableRow key={city.name} className="border-[#1e2a3b] hover:bg-[#1e2a3b]/50 group transition-all duration-300">
                                    <TableCell className="text-gray-500 font-mono text-sm">{index + 1}</TableCell>
                                    <TableCell className="text-white font-bold">{city.name}</TableCell>
                                    <TableCell className="text-gray-400 text-sm">{city.state}</TableCell>
                                    <TableCell className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black shadow-lg ${city.aqi > 300 ? 'bg-red-500/20 text-red-500 shadow-red-500/10' :
                                            city.aqi > 200 ? 'bg-orange-500/20 text-orange-500 shadow-orange-500/10' :
                                                city.aqi > 100 ? 'bg-yellow-500/20 text-yellow-500 shadow-yellow-500/10' :
                                                    'bg-green-500/20 text-green-500 shadow-green-500/10'
                                            }`}>
                                            {city.aqi}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline" className="text-teal-400 border-teal-900/50 bg-teal-900/10">
                                            {city.topPollutant}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {city.anomalies > 0 ? (
                                            <div className="flex items-center justify-end space-x-1 text-orange-500 font-bold text-sm">
                                                <span>{city.anomalies}</span>
                                                <AlertTriangle className="h-4 w-4" />
                                            </div>
                                        ) : (
                                            <span className="text-gray-600 text-sm italic">Clean</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

// Global styles for mapbox popups in high-prio dark mode
const mapStyle = `
.mapboxgl-popup-content {
    background: transparent !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
}
.mapboxgl-popup-tip {
    border-top-color: #0A1628 !important;
    border-bottom-color: #0A1628 !important;
}
`;
if (typeof document !== 'undefined') {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = mapStyle;
    document.head.appendChild(styleEl);
}
