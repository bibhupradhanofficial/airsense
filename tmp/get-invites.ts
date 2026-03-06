import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkInvites() {
    console.log('--- Checking Admin Invitations ---');

    const { data: invites, error } = await supabase
        .from('admin_invitations')
        .select('*');

    if (error) {
        console.error('Error fetching invitations:', error.message);
        return;
    }

    console.log('Total invitations:', invites.length);
    console.table(invites.map(inv => ({
        id: inv.id,
        invite_code: inv.invite_code,
        admin_type: inv.admin_type,
        used_by: inv.used_by,
        expires_at: inv.expires_at,
        is_expired: new Date(inv.expires_at) < new Date()
    })));
}

checkInvites();
