import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    console.log('Checking Supabase Realtime configuration...');

    // 1. Check if table is in publication
    const { data: pubData, error: pubError } = await supabase
        .rpc('check_realtime_publication', { table_name: 'aqi_readings' });

    if (pubError) {
        // Fallback: try to query direct if we have permissions (though unlikely via RPC if not defined)
        console.warn('RPC check_realtime_publication failed, trying direct query...');

        const { data: tables, error: tableError } = await supabase
            .from('pg_publication_tables')
            .select('*')
            .eq('pubname', 'supabase_realtime')
            .eq('tablename', 'aqi_readings');

        if (tableError) {
            console.error('Could not check publication tables:', tableError.message);
        } else {
            console.log('Realtime Publication Status:', tables?.length > 0 ? 'ENABLED' : 'DISABLED');
        }
    } else {
        console.log('Realtime Publication Status (via RPC):', pubData);
    }

    // 2. Try to subscribe and see the status
    const channel = supabase.channel('healthcheck');
    channel.subscribe((status) => {
        console.log('Websocket Connectivity Test Status:', status);
        if (status === 'SUBSCRIBED') {
            console.log('SUCCESS: Websocket connected to Supabase Realtime');
            process.exit(0);
        }
        if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
            console.error('FAILURE: Websocket failed with status:', status);
            process.exit(1);
        }
    });

    // Wait a bit for the connection
    setTimeout(() => {
        console.error('TIMED OUT waiting for websocket connection');
        process.exit(1);
    }, 10000);
}

check();
