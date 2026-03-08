import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvValue = (key: string) => {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvValue('SUPABASE_URL') || getEnvValue('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnvValue('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function refreshData() {
    console.log('Fetching all locations...');
    const { data: locations, error: locError } = await supabase.from('locations').select('id, city');

    if (locError) {
        console.error('Error fetching locations:', locError);
        return;
    }

    console.log(`Found ${locations.length} locations. Generating fresh readings...`);

    const now = new Date();
    const readings = locations.map(loc => {
        // Deterministic but "random-ish" AQI based on city name length or similar
        let baseAqi = 100 + (loc.city.length * 10) % 200;
        if (loc.city === 'Delhi') baseAqi = 350;
        if (loc.city === 'Mumbai') baseAqi = 180;

        return {
            location_id: loc.id,
            aqi_value: Math.round(baseAqi + (Math.random() - 0.5) * 50),
            pm25: baseAqi * 0.6 + (Math.random() - 0.5) * 20,
            pm10: baseAqi * 1.2 + (Math.random() - 0.5) * 30,
            source: 'iot',
            recorded_at: now.toISOString()
        };
    });

    const chunkSize = 100;
    for (let i = 0; i < readings.length; i += chunkSize) {
        const chunk = readings.slice(i, i + chunkSize);
        const { error } = await supabase.from('aqi_readings').insert(chunk);
        if (error) console.error(`Error inserting chunk ${i}:`, error.message);
    }

    console.log(`Success! Inserted ${readings.length} fresh readings at ${now.toISOString()}`);
}

refreshData().catch(console.error);
