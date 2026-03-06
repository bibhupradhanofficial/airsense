import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function check() {
    console.log('Checking Supabase Realtime for aqi_readings table using ANON key...');

    const channel = supabase
        .channel('test-aqi-readings-anon')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'aqi_readings'
            },
            (payload) => {
                console.log('Received payload:', payload);
            }
        );

    channel.subscribe((status, err) => {
        console.log('Subscription Status:', status);
        if (err) {
            console.error('Subscription Error:', err);
        }

        if (status === 'SUBSCRIBED') {
            console.log('SUCCESS: Subscribed to aqi_readings with ANON key');
            process.exit(0);
        }

        if (status === 'CHANNEL_ERROR') {
            console.error('FAILURE: Channel error with ANON key.');
            process.exit(1);
        }
    });

    setTimeout(() => {
        console.error('TIMED OUT waiting for subscription');
        process.exit(1);
    }, 10000);
}

check();
