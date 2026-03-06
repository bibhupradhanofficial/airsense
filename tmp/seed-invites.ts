import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedInvites() {
    console.log('--- Seeding Admin Invitations ---');

    const invites = [
        {
            invite_code: 'CENTRAL_ADMIN',
            admin_type: 'central_admin',
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        },
        {
            invite_code: 'DELHI_ADMIN_2024',
            admin_type: 'city_admin',
            assigned_city_name: 'Delhi',
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            invite_code: 'MUMBAI_ADMIN_2024',
            admin_type: 'city_admin',
            assigned_city_name: 'Mumbai',
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        }
    ];

    console.log('Inserting invitations:', invites.map(i => i.invite_code).join(', '));

    const { data, error } = await supabase
        .from('admin_invitations')
        .upsert(invites, { onConflict: 'invite_code' });

    if (error) {
        console.error('Error seeding invitations:', error.message);
        return;
    }

    console.log('Invitations seeded successfully!');
}

seedInvites();
