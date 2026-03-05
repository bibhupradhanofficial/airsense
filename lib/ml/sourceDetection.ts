export type TimeOfDay = 'morning_rush' | 'daytime' | 'evening_rush' | 'night';

export interface PollutionSignature {
  sourceType: 'TRAFFIC' | 'CONSTRUCTION_DUST' | 'BIOMASS_BURNING' | 'INDUSTRIAL';
  confidence: number; // 0 to 1
  indicators: string[];
  timePattern: TimeOfDay;
}

export interface AQReading {
  timestamp: string; // ISO string
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
}

export interface WeatherData {
  windSpeed: number; // km/h
  windDirection: number; // degrees
  temperature: number; // Celsius
  humidity: number; // percentage
}

// Ensure ratios don't divide by zero
const getRatio = (num: number, den: number) => (den > 0 ? num / den : 0);

function getTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 7 && hour <= 10) return 'morning_rush';
  if (hour >= 17 && hour <= 20) return 'evening_rush';
  if (hour > 10 && hour < 17) return 'daytime';
  return 'night';
}

function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function isBurningSeason(date: Date): boolean {
  const month = date.getMonth(); // 0 is Jan, 9 is Oct, 11 is Dec
  return month >= 9 || month <= 0; // Oct (9), Nov (10), Dec (11), Jan (0)
}

/**
 * Classifies pollution sources based on heuristic rules and statistical patterns.
 */
export function classifyPollutionSource(
  reading: AQReading,
  weather: WeatherData,
  historicalReadings: AQReading[]
): PollutionSignature[] {
  const signatures: PollutionSignature[] = [];
  const date = new Date(reading.timestamp);
  const timePattern = getTimeOfDay(date);
  const weekday = isWeekday(date);

  // 1. TRAFFIC signature
  if (reading.no2 > 100 && reading.co > 0) { // Assuming 'elevated' CO > 0 (will tune base baseline later)
    if (timePattern === 'morning_rush' || timePattern === 'evening_rush') {
      signatures.push({
        sourceType: 'TRAFFIC',
        confidence: weekday ? 0.9 : 0.6,
        indicators: ['High NO2', 'Elevated CO', 'Rush hour timing'],
        timePattern,
      });
    }
  }

  // 2. CONSTRUCTION DUST signature
  const pmRatio = getRatio(reading.pm25, reading.pm10);
  if (reading.pm10 > 150 && pmRatio < 0.3) {
    if (timePattern === 'daytime' || timePattern === 'morning_rush' || timePattern === 'evening_rush') {
      if (weather.windSpeed < 20) {
        signatures.push({
          sourceType: 'CONSTRUCTION_DUST',
          confidence: 0.85,
          indicators: ['High PM10', 'Low PM2.5/PM10 ratio (coarse particles)', 'Daytime operation', 'Low wind speed'],
          timePattern,
        });
      }
    }
  }

  // 3. BIOMASS BURNING signature
  // 'Elevated PM2.5' heuristics (e.g. > 60 for 24h average, > ~100 for hourly spike)
  if (reading.pm25 > 100 && pmRatio > 0.7) {
    if (isBurningSeason(date)) {
      signatures.push({
        sourceType: 'BIOMASS_BURNING',
        confidence: 0.8,
        indicators: ['High PM2.5', 'High PM2.5/PM10 ratio (fine particles)', 'Burning season (Oct-Jan)'],
        timePattern,
      });
    }
  }

  // 4. INDUSTRIAL signature
  if (reading.so2 > 50 || (reading.no2 > 100 && timePattern !== 'morning_rush' && timePattern !== 'evening_rush')) {
    signatures.push({
      sourceType: 'INDUSTRIAL',
      confidence: 0.75,
      indicators: ['High SO2 or sustained high NO2 outside rush hours', 'Non-traffic temporal pattern'],
      timePattern,
    });
  }

  // Sort by highest confidence first
  return signatures.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Calculates a Z-score based anomaly score (0-10) for the current reading
 * against numerical history. (Simplified Z-Score bounding)
 */
export function computeAnomalyScore(current: AQReading, history: AQReading[]): number {
  if (history.length === 0) return 0;

  const aqiValues = history.map((r) => r.aqi);
  const mean = aqiValues.reduce((sum, val) => sum + val, 0) / aqiValues.length;
  
  const variance = aqiValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / aqiValues.length;
  const stdDev = Math.sqrt(variance) || 1; // Prevent div/0

  const zScore = (current.aqi - mean) / stdDev;

  // Map Z-score to an anomaly scale of 0-10
  // e.g., z=0 -> 0, z=3 -> ~9. Threshold > 6 is roughly z > 2.0
  let score = zScore * 3;
  
  if (score < 0) score = 0;
  if (score > 10) score = 10;

  return Math.round(score * 10) / 10;
}

/**
 * Detects if the AQI has been > 150 for more than `thresholdHours` consecutive hours
 */
export function detectSustainedAnomaly(readings: AQReading[], thresholdHours: number): boolean {
  if (readings.length < thresholdHours) return false;

  // We assume readings are sorted latest first or time-series (we should sort ensuring chronological)
  // Let's sort oldest to newest
  const sorted = [...readings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  let consecutiveCount = 0;
  for (const r of sorted) {
    if (r.aqi > 150) {
      consecutiveCount++;
      if (consecutiveCount >= thresholdHours) return true;
    } else {
      consecutiveCount = 0;
    }
  }

  return false;
}
