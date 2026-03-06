
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, count, error } = await supabase
        .from('locations')
        .select('name, city', { count: 'exact' })
        .limit(5);

    if (error) {
        console.error(error);
        return;
    }

    console.log('Total locations:', count);
    console.log('Sample locations:', data);

    // Also check aqi_readings
    const { count: aqiCount } = await supabase
        .from('aqi_readings')
        .select('*', { count: 'exact', head: true });
    console.log('Total aqi_readings:', aqiCount);
}

check();
