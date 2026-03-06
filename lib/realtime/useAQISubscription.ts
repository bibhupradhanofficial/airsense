'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAQIStore } from '@/store/aqiStore';
import { AQReading } from '@/types/aqi';
import { RealtimeChannel } from '@supabase/supabase-js';

// We use a simple counter to track how many components are using a specific channel
const channelUsageCount: Record<string, number> = {};

export function useAQISubscription(locationId?: string) {
    const [isConnected, setIsConnected] = useState(false);
    const [latestReading, setLatestReading] = useState<AQReading | null>(null);
    const setStoreReading = useAQIStore((state) => state.setReading);
    const supabase = createClient();
    const channelRef = useRef<RealtimeChannel | null>(null);
    const channelId = `aqi-updates-${locationId || 'global'}`;

    const subscribe = useCallback(() => {
        if (channelRef.current) return;

        // Increment usage count
        channelUsageCount[channelId] = (channelUsageCount[channelId] || 0) + 1;

        const newChannel = supabase
            .channel(channelId)
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
            .subscribe((status, err) => {
                if (err) {
                    console.error(`Supabase Realtime subscription error for ${channelId}:`, err);
                    setIsConnected(false);
                    return;
                }

                const isSubscribed = status === 'SUBSCRIBED';
                setIsConnected(isSubscribed);

                if (!isSubscribed) {
                    console.log(`Supabase Realtime status for ${channelId}:`, status);
                }
            });

        channelRef.current = newChannel;
    }, [locationId, channelId, supabase, setStoreReading]);

    const unsubscribe = useCallback(() => {
        if (channelRef.current) {
            // Decrement usage count
            channelUsageCount[channelId] = Math.max(0, (channelUsageCount[channelId] || 0) - 1);

            // Only remove the channel if no other component is using it
            if (channelUsageCount[channelId] === 0) {
                supabase.removeChannel(channelRef.current);
            }

            channelRef.current = null;
            setIsConnected(false);
        }
    }, [supabase, channelId]);

    useEffect(() => {
        subscribe();
        return () => {
            unsubscribe();
        };
    }, [subscribe, unsubscribe]);

    return { latestReading, isConnected, subscribe, unsubscribe };
}
