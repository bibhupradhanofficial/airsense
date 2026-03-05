'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminStore } from '@/store/adminStore';
import { AdminContext, getAdminContext } from '@/types/admin';
import { UserProfile } from '@/types';

export function useAdminContext() {
    const supabase = createClient();
    const { adminContext, profile, setAdminContext } = useAdminStore();
    const [isLoading, setIsLoading] = useState(!adminContext);
    const [fullName, setFullName] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAdminData() {
            if (adminContext && profile) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setIsLoading(false);
                return;
            }

            setFullName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Administrator');
            setEmail(session.user.email || null);

            const { data: profileData, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profileData && !error) {
                const profile = profileData as unknown as UserProfile;
                const context = getAdminContext(profile);
                setAdminContext(context, profile);
            }
            setIsLoading(false);
        }

        fetchAdminData();
    }, [supabase, adminContext, profile, setAdminContext]);

    return {
        adminContext,
        profile,
        fullName,
        email,
        isLoading,
        isSuperAdmin: adminContext?.type === 'super_admin',
        isCityAdmin: adminContext?.type === 'city_admin',
        cityName: adminContext?.type === 'city_admin' ? adminContext.cityFilter.name : null
    };
}
