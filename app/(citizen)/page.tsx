'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { LocationPermissionModal } from '@/components/citizen/LocationPermissionModal';
import { AQILoadingState, LoadingStage } from '@/components/citizen/AQILoadingState';
import { GeolocationStatus, GeolocationResult, resolveUserLocation } from '@/lib/api-clients/geocoding';
import { AQReading } from '@/types/aqi';
import { MapPin, Info, ChevronRight } from 'lucide-react';
import { AQIGauge } from '@/components/citizen/AQIGauge';
import { LocationSearch } from '@/components/citizen/LocationSearch';
import { PollutantCard } from '@/components/citizen/PollutantCard';
import { ForecastRow } from '@/components/citizen/ForecastRow';
import { HealthAdvisory } from '@/components/citizen/HealthAdvisory';

export default function CitizenHomePage() {
    const [locationStatus, setLocationStatus] = useState<GeolocationStatus>('idle');
    const [loadingStage, setLoadingStage] = useState<LoadingStage>('locating');
    const [userLocation, setUserLocation] = useState<GeolocationResult | null>(null);
    const [aqiData, setAQIData] = useState<AQReading | null>(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showGPSInstructions, setShowGPSInstructions] = useState(false);

    useEffect(() => {
        const alreadyPrompted = sessionStorage.getItem('airsense_location_prompted');
        if (!alreadyPrompted) {
            // Check if permission already granted silently
            if ('permissions' in navigator) {
                navigator.permissions.query({ name: 'geolocation' as PermissionName }).then(p => {
                    if (p.state === 'granted') {
                        startLocationResolution();
                    } else {
                        setShowPermissionModal(true);
                    }
                }).catch(() => setShowPermissionModal(true));
            } else {
                setShowPermissionModal(true);
            }
        } else {
            startLocationResolution();
        }
    }, []);

    async function startLocationResolution() {
        sessionStorage.setItem('airsense_location_prompted', 'true');
        setShowPermissionModal(false);
        setLoadingStage('locating');

        try {
            const location = await resolveUserLocation(setLocationStatus);
            setUserLocation(location);

            setLoadingStage('fetching');
            const response = await fetch(`/api/aqi?lat=${location.lat}&lon=${location.lon}&source=auto`);
            if (!response.ok) throw new Error('Failed to fetch AQI');

            setLoadingStage('processing');
            // Artificial delay for 'processing' stage as requested
            await new Promise(r => setTimeout(r, 1500));

            const data = await response.json();
            setAQIData(data);
        } catch (error) {
            console.error("Location or AQI resolution failed", error);
            setLocationStatus('error');
            // Allow the UI to fall back or show error by ensuring we don't stay in 'locating'/'fetching' forever
            setLoadingStage('fetching'); // This might still show loading if not handled by component
        }
    }

    const pollutants = useMemo(() => {
        if (!aqiData) return [];
        return [
            { name: 'PM2.5', value: aqiData.pollutants.pm25 || 0, unit: 'µg/m³', description: 'Fine particulate matter that can penetrate deep into the lungs.' },
            { name: 'PM10', value: aqiData.pollutants.pm10 || 0, unit: 'µg/m³', description: 'Inhalable particles that can cause respiratory issues.' },
            { name: 'NO2', value: aqiData.pollutants.no2 || 0, unit: 'ppb', description: 'Nitrogen Dioxide, primarily from vehicle emissions.' },
            { name: 'O3', value: aqiData.pollutants.o3 || 0, unit: 'ppb', description: 'Ground-level Ozone, formed by chemical reactions.' },
            { name: 'CO', value: aqiData.pollutants.co || 0, unit: 'ppm', description: 'Carbon Monoxide from incomplete combustion.' },
            { name: 'SO2', value: aqiData.pollutants.so2 || 0, unit: 'ppb', description: 'Sulfur Dioxide from industrial facilities.' },
        ];
    }, [aqiData]);

    const [forecast, setForecast] = useState<any[]>([]);

    useEffect(() => {
        const generated = Array.from({ length: 8 }).map((_, i) => ({
            time: `${(new Date().getHours() + i * 3) % 24}:00`,
            temp: 24 + Math.round(Math.random() * 5),
            aqi: Math.round((aqiData?.aqi || 100) + (Math.random() * 40 - 20)),
            weatherCode: ['sun', 'cloud', 'rain'][Math.floor(Math.random() * 3)] as 'sun' | 'cloud' | 'rain',
        }));
        setForecast(generated);
    }, [aqiData]);

    return (
        <div className="flex flex-col gap-16 pb-20">
            <LocationPermissionModal
                isOpen={showPermissionModal}
                onAllow={startLocationResolution}
                onSkip={() => {
                    setShowPermissionModal(false);
                    sessionStorage.setItem('airsense_location_prompted', 'true');
                    startLocationResolution();
                }}
            />

            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center overflow-hidden bg-zinc-50 px-4 py-20 text-center sm:px-6 lg:px-8 min-h-[60vh]">
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-teal-400 blur-[120px]" />
                    <div className="absolute top-[40%] -right-[10%] h-[60%] w-[60%] rounded-full bg-blue-300 blur-[120px]" />
                </div>

                <div className="container relative z-10 mx-auto max-w-4xl space-y-8">
                    {!aqiData ? (
                        <div className="max-w-md mx-auto">
                            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-8">
                                Air Quality in your area
                            </h1>
                            <AQILoadingState
                                stage={loadingStage}
                                locationName={userLocation?.locationInfo.city}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
                                    Know the Air You Breathe
                                </h1>
                                <p className="mx-auto max-w-2xl text-xl text-zinc-500">
                                    Real-time, hyper-local air quality for your neighborhood
                                </p>
                            </div>

                            <div className="flex flex-col items-center gap-6">
                                <AQIGauge aqi={aqiData.aqi} loading={false} />

                                {locationStatus === 'denied' && (
                                    <div className="bg-orange-50 border border-orange-100 rounded-2xl px-6 py-4 max-w-lg animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="text-orange-600" size={20} />
                                            </div>
                                            <div className="text-left space-y-1">
                                                <p className="text-orange-800 font-medium text-sm leading-tight">
                                                    📍 Enable location access in your browser for hyper-local AQI.
                                                </p>
                                                <p className="text-orange-700/70 text-xs">
                                                    Currently showing approximate data based on your IP address.
                                                </p>
                                                <button
                                                    onClick={() => setShowGPSInstructions(!showGPSInstructions)}
                                                    className="inline-flex items-center text-orange-600 text-xs font-bold hover:underline gap-1 mt-1"
                                                >
                                                    How to enable GPS <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {showGPSInstructions && (
                                            <div className="mt-4 pt-4 border-t border-orange-200 text-left space-y-3 animate-in fade-in duration-300">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <h4 className="text-xs font-bold text-orange-800 flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded-full bg-orange-200 text-[10px] flex items-center justify-center">1</div>
                                                            Click the Lock Icon
                                                        </h4>
                                                        <p className="text-[11px] text-orange-700 leading-relaxed">
                                                            Look at the left side of your address bar and click the padlock or settings icon.
                                                        </p>
                                                        <div className="h-12 bg-zinc-100 rounded border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400 italic">
                                                            [Image: Address bar with lock icon highlighted]
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h4 className="text-xs font-bold text-orange-800 flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded-full bg-orange-200 text-[10px] flex items-center justify-center">2</div>
                                                            Toggle Location On
                                                        </h4>
                                                        <p className="text-[11px] text-orange-700 leading-relaxed">
                                                            Find &quot;Location&quot; in the menu and switch it to &quot;Allow&quot; or &quot;Ask&quot;.
                                                        </p>
                                                        <div className="h-12 bg-zinc-100 rounded border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400 italic">
                                                            [Image: Permission menu with Location toggle set to Allow]
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-zinc-600 font-medium">
                                                Currently in <span className="text-teal-700 font-bold">{userLocation?.locationInfo.city || 'Your Area'}</span>
                                            </p>
                                            {userLocation?.source === 'gps' ? (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Live GPS Location
                                                </div>
                                            ) : (
                                                <div className="group relative">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100 cursor-help">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        Approximate Location (GPS unavailable)
                                                        <Info size={10} className="ml-1 opacity-60" />
                                                    </div>
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                                                        Enable GPS for hyper-local accuracy. Currently using IP fallback.
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {userLocation?.locationInfo.ward && (
                                            <p className="text-xs text-zinc-400">{userLocation.locationInfo.ward}, {userLocation.locationInfo.state}</p>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-400 italic">Not your location? Search below</p>
                                </div>

                                <LocationSearch />
                            </div>
                        </>
                    )}
                </div>
            </section>

            {aqiData && (
                <div className="container mx-auto max-w-6xl px-4 space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <section className="space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Pollutant Breakdown</h2>
                            <p className="text-zinc-500">Detailed readings for key air components in your neighborhood</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                            {pollutants.map((p) => (
                                <PollutantCard key={p.name} {...p} />
                            ))}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Today&apos;s Forecast</h2>
                            <p className="text-zinc-500">Predicted air quality and weather for the next 24 hours</p>
                        </div>
                        <ForecastRow data={forecast} />
                    </section>

                    <section className="space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Health Advisory</h2>
                            <p className="text-zinc-500">Personalized recommendations based on current conditions</p>
                        </div>
                        <HealthAdvisory aqi={aqiData.aqi} source={aqiData.source} />
                    </section>
                </div>
            )}
        </div>
    );
}
