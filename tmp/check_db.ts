import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function check() {
    console.log('Listing locations...');
    const { data: locations, error } = await supabase.from('locations').select('id, name, city').limit(10);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Locations:', locations);
    }

    console.log('Listing invitations...');
    const { data: invitations, error2 } = await supabase.from('admin_invitations').select('*').limit(10);
    if (error2) {
        console.error('Error:', error2);
    } else {
        console.log('Invitations:', invitations);
    }
}

check();
