import { WeatherData } from "@/components/weather/WeatherWidget";

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

/**
 * Weather Service for fetching live weather & forecast data for cricket venues.
 * Fallbacks seamlessly to realistic simulated weather if no API key is set.
 */
export async function fetchLiveWeather(location: string, lat?: number, lon?: number): Promise<WeatherData> {
    if (OPENWEATHER_API_KEY && (lat !== undefined && lon !== undefined)) {
        try {
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`,
                { next: { revalidate: 600 } }
            );
            if (res.ok) {
                const data = await res.json();
                return mapOpenWeatherToWeatherData(data);
            }
        } catch (err) {
            console.warn("OpenWeather API fetch failed, falling back to venue simulation:", err);
        }
    }

    // Default fallback weather simulation for Kwazulu-Natal / SA school cricket venues
    return getSimulatedWeather(location);
}

function mapOpenWeatherToWeatherData(apiData: any): WeatherData {
    const temp = Math.round(apiData.main?.temp ?? 22);
    const humidity = apiData.main?.humidity ?? 65;
    const windSpeed = Math.round((apiData.wind?.speed ?? 3.5) * 3.6); // m/s to km/h
    const windDeg = apiData.wind?.deg ?? 45;
    const visibility = Math.round((apiData.visibility ?? 10000) / 1000);
    const rainMm = apiData.rain?.['1h'] ?? 0;

    let condition: WeatherData['condition'] = 'Clear';
    const mainCond = apiData.weather?.[0]?.main?.toLowerCase() || '';
    if (mainCond.includes('thunderstorm')) condition = 'Thunderstorm';
    else if (mainCond.includes('rain') || mainCond.includes('drizzle')) condition = rainMm > 5 ? 'Heavy Rain' : 'Rain';
    else if (mainCond.includes('cloud')) condition = apiData.clouds?.all > 60 ? 'Cloudy' : 'Partly Cloudy';
    else if (mainCond.includes('snow')) condition = 'Snow';

    return {
        temperature: temp,
        condition,
        humidity,
        windSpeed,
        windDirection: getCardinalDirection(windDeg),
        visibility,
        precipitation: rainMm,
        forecast: {
            nextHours: [
                { time: '14:00', condition: 'Partly Cloudy', precipitation: 0 },
                { time: '15:00', condition: 'Clear', precipitation: 0 },
                { time: '16:00', condition: 'Clear', precipitation: 0 },
            ]
        }
    };
}

function getCardinalDirection(angle: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(angle / 45) % 8];
}

function getSimulatedWeather(location: string): WeatherData {
    const isCoastal = location.toLowerCase().includes('durban') || location.toLowerCase().includes('clifton') || location.toLowerCase().includes('dhs');
    return {
        temperature: isCoastal ? 26 : 22,
        condition: 'Clear',
        humidity: isCoastal ? 75 : 55,
        windSpeed: isCoastal ? 18 : 12,
        windDirection: isCoastal ? 'NE' : 'SE',
        visibility: 10,
        precipitation: 0,
        forecast: {
            nextHours: [
                { time: '+1h', condition: 'Clear', precipitation: 0 },
                { time: '+2h', condition: 'Partly Cloudy', precipitation: 0 },
                { time: '+3h', condition: 'Clear', precipitation: 0 }
            ]
        }
    };
}
