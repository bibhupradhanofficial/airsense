import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkState() {
    console.log('--- Checking Database State ---');

    // Check invitations
    const { data: invites, error: invError } = await supabase
        .from('admin_invitations')
        .select('*');

    if (invError) console.error('Error fetching invitations:', invError.message);
    else {
        console.log('Invitations:');
        console.table(invites.map(inv => ({
            code: inv.invite_code,
            used_by: inv.used_by,
            used_at: inv.used_at
        })));
    }

    // Check profiles
    const { data: profiles, error: profError } = await supabase
        .from('user_profiles')
        .select('*');

    if (profError) console.error('Error fetching profiles:', profError.message);
    else {
        console.log('User Profiles:');
        console.table(profiles.map(p => ({
            id: p.id,
            role: p.role,
            admin_type: p.admin_type,
            is_active: p.is_active
        })));
    }

    // Check auth users via admin client
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) console.error('Error fetching auth users:', authError.message);
    else {
        console.log('Auth Users:');
        console.table(users.map(u => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at
        })));
    }
}

checkState();
