"use client";

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAQIStore } from '@/store/aqiStore';
import { AQReading } from '@/types/aqi';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useAQISubscription(locationId?: string) {
    const [isConnected, setIsConnected] = useState(false);
    const [latestReading, setLatestReading] = useState<AQReading | null>(null);
    const setStoreReading = useAQIStore((state) => state.setReading);
    const supabase = createClient();
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);

    const subscribe = useCallback(() => {
        if (channel) return;

        const newChannel = supabase
            .channel('aqi-updates')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'aqi_readings',
                    filter: locationId ? `location_id=eq.${locationId}` : undefined,
                },
                (payload) => {
                    const newReading = payload.new as any;

                    // Map DB structure to AQReading
                    const formattedReading: AQReading = {
                        aqi: newReading.aqi_value,
                        pollutants: {
                            pm25: newReading.pm25,
                            pm10: newReading.pm10,
                            no2: newReading.no2,
                            so2: newReading.so2,
                            co: newReading.co,
                            o3: newReading.o3,
                        },
                        source: newReading.source || 'auto',
                        timestamp: newReading.recorded_at || new Date().toISOString(),
                    };

                    setLatestReading(formattedReading);

                    // If we have a locationId in the reading, update the store
                    const locId = newReading.location_id || locationId;
                    if (locId) {
                        setStoreReading(locId, formattedReading);
                    }
                }
            )
            .subscribe((status) => {
                setIsConnected(status === 'SUBSCRIBED');
            });

        setChannel(newChannel);
    }, [locationId, channel, supabase, setStoreReading]);

    const unsubscribe = useCallback(() => {
        if (channel) {
            supabase.removeChannel(channel);
            setChannel(null);
            setIsConnected(false);
        }
    }, [channel, supabase]);

    useEffect(() => {
        subscribe();
        return () => {
            unsubscribe();
        };
    }, [subscribe, unsubscribe]);

    return { latestReading, isConnected, subscribe, unsubscribe };
}
