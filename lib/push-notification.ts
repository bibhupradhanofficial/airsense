'use client';

import { createClient } from '@/lib/supabase/client';

export async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('SW registered successfully:', registration);
            return registration;
        } catch (error) {
            console.error('SW registration failed:', error);
        }
    }
}

export async function subscribeUser() {
    const registration = await registerServiceWorker();
    if (!registration) return;

    try {
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
        });

        const supabase = createClient();
        const { error } = await supabase.from('push_subscriptions').upsert({
            endpoint: subscription.endpoint,
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')!) as any)),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')!) as any)),
            threshold_aqi: 100 // Default
        });

        if (error) console.error('Error saving subscription:', error);
        return subscription;
    } catch (error) {
        console.error('Failed to subscribe user:', error);
    }
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
