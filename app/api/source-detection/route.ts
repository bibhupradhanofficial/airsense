import { NextResponse } from 'next/server';
import { classifyPollutionSource, computeAnomalyScore, detectSustainedAnomaly, AQReading, WeatherData } from '@/lib/ml/sourceDetection';
// import { createClient } from '@/lib/supabase/server'; // Will implement full Supabase client in later phase

// Mock Supabase fetch for demonstration purposes
async function fetchRecentReadings(_locationId: string): Promise<AQReading[]> {
    // In a real implementation:
    // const supabase = createClient();
    // const { data } = await supabase.from('readings').select('*').eq('location_id', locationId).order('timestamp', { ascending: false }).limit(24);

    const now = new Date();
    const mockReadings: AQReading[] = [];

    // Generating 24 hours of mock data
    for (let i = 0; i < 24; i++) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        mockReadings.push({
            timestamp: d.toISOString(),
            aqi: 160 + Math.random() * 50, // Sustained high AQI
            pm25: 80 + Math.random() * 20,
            pm10: 170 + Math.random() * 30, // High PM10 (Construction signature)
            no2: 40 + Math.random() * 10,
            so2: 10 + Math.random() * 5,
            co: 1 + Math.random(),
            o3: 30 + Math.random() * 10
        });
    }
    return mockReadings;
}

async function fetchCurrentWeather(_lat: number, _lon: number): Promise<WeatherData> {
    // In a real implementation: Call OpenWeatherMap API
    return {
        windSpeed: 10, // low wind
        windDirection: 180,
        temperature: 30,
        humidity: 50,
    };
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { location_id, lat, lon } = body;

        if (!location_id || !lat || !lon) {
            return NextResponse.json({ error: 'Missing required parameters: location_id, lat, lon' }, { status: 400 });
        }

        // 1. Fetch data
        const history = await fetchRecentReadings(location_id);
        const weather = await fetchCurrentWeather(lat, lon);

        if (!history || history.length === 0) {
            return NextResponse.json({ error: 'No historical readings found' }, { status: 404 });
        }

        const currentReading = history[0]; // Assuming sorted descending

        // 2. Run Heuristic ML Rules
        const signatures = classifyPollutionSource(currentReading, weather, history);
        const anomalyScore = computeAnomalyScore(currentReading, history);
        const isSustained = detectSustainedAnomaly(history, 6); // e.g., > 150 AQI for 6 hours

        // 3. Save to database (mocked for now)
        // const supabase = createClient();
        // if (signatures.length > 0) {
        //    await supabase.from('pollution_sources').insert({
        //       location_id,
        //       detected_source: signatures[0].sourceType,
        //       confidence: signatures[0].confidence,
        //       anomaly_score: anomalyScore
        //    });
        // }

        return NextResponse.json({
            location_id,
            current_aqi: currentReading.aqi,
            detected_sources: signatures,
            anomaly_score: anomalyScore,
            sustained_anomaly: isSustained,
            trigger_policy_engine: anomalyScore > 6 || isSustained
        });

    } catch (error: Error | any) {
        console.error('Error in source-detection API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
