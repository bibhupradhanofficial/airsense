import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    console.log('--- Checking Database Structure ---');

    // Check if we can reach any table
    const { data: locations, error: locErr } = await supabase.from('locations').select('count', { count: 'exact', head: true });
    if (locErr) {
        console.error('Error fetching locations:', locErr.message);
    } else {
        console.log('Locations table found.');
    }

    const { data: invites, error: invErr } = await supabase.from('admin_invitations').select('count', { count: 'exact', head: true });
    if (invErr) {
        console.error('Error fetching admin_invitations:', invErr.message);
    } else {
        console.log('admin_invitations table found.');
    }

    // Try a broad query to see what PostgREST sees
    // Supabase JS doesn't have a direct "list tables" without SQL, but we can try to hit the rest endpoint indirectly? 
    // Actually, let's just use the RPC to refresh if it exists or just tell the user if both fail.
}

check();
