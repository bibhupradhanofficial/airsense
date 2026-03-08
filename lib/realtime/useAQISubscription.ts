'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAQIStore } from '@/store/aqiStore';
import { AQReading } from '@/types/aqi';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useAQISubscription(locationId?: string) {
    const isConnectionActive = useAQIStore((state) => state.isConnectionActive);
    const setConnectionActive = useAQIStore((state) => state.setConnectionActive);
    const setStoreReading = useAQIStore((state) => state.setReading);

    const [latestReading, setLatestReading] = useState<AQReading | null>(null);
    const supabase = createClient();
    const channelRef = useRef<RealtimeChannel | null>(null);
    const retryCountRef = useRef(0);
    const MAX_RETRIES = 5;

    const subscribe = useCallback(() => {
        // If already establishing or established, don't initiate again for this instance
        if (channelRef.current) return;

        const channelName = `aqi-updates-${locationId || 'global'}`;
        console.log(`[Realtime] Subscribing to ${channelName}...`);

        const newChannel = supabase
            .channel(channelName)
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
                    console.log(`[Realtime] New reading recieved:`, newReading);

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
                    const locId = newReading.location_id || locationId;
                    if (locId) {
                        setStoreReading(locId, formattedReading);
                    }
                }
            )
            .subscribe((status, error) => {
                console.log(`[Realtime] Status for ${channelName}: ${status}`, error || '');

                const connected = status === 'SUBSCRIBED';

                // Only update global state if we are the primary subscriber (global)
                if (!locationId) {
                    setConnectionActive(connected);
                }

                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    if (retryCountRef.current < MAX_RETRIES) {
                        retryCountRef.current += 1;
                        console.warn(`[Realtime] Connection failed. Retrying (${retryCountRef.current}/${MAX_RETRIES})...`);
                        setTimeout(() => {
                            channelRef.current = null;
                            subscribe();
                        }, 2000 * retryCountRef.current);
                    }
                } else if (connected) {
                    retryCountRef.current = 0;
                }
            });

        channelRef.current = newChannel;
    }, [locationId, supabase, setStoreReading, setConnectionActive]);

    const unsubscribe = useCallback(() => {
        if (channelRef.current) {
            console.log(`[Realtime] Unsubscribing from channel...`);
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
            if (!locationId) {
                setConnectionActive(false);
            }
        }
    }, [supabase, locationId, setConnectionActive]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            subscribe();
        }, 500); // Small delay to let client auth stabilize

        return () => {
            clearTimeout(timeout);
            unsubscribe();
        };
    }, [subscribe, unsubscribe]);

    return { latestReading, isConnected: isConnectionActive, subscribe, unsubscribe };
}
