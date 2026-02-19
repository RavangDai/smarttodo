import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudSun, Cloud, CloudRain, CloudSnow, Sun, CloudLightning, Wind, Droplets, Eye, X, AlertTriangle } from 'lucide-react';

// Maps WMO Weather interpretation codes (WW)
// https://open-meteo.com/en/docs
const getWeatherConditionFromCode = (code) => {
    // 0: Clear sky
    if (code === 0) return 'Sunny';

    // 1, 2, 3: Mainly clear, partly cloudy, and overcast
    if (code >= 1 && code <= 3) return 'Partly Cloudy';

    // 45, 48: Fog and depositing rime fog
    if (code === 45 || code === 48) return 'Cloudy';

    // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
    // 56, 57: Freezing Drizzle: Light and dense intensity
    if (code >= 51 && code <= 57) return 'Drizzle';

    // 61, 63, 65: Rain: Slight, moderate and heavy intensity
    // 66, 67: Freezing Rain: Light and heavy intensity
    // 80, 81, 82: Rain showers: Slight, moderate, and violent
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'Rain';

    // 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
    // 77: Snow grains
    // 85, 86: Snow showers slight and heavy
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'Snow';

    // 95: Thunderstorm: Slight or moderate
    // 96, 99: Thunderstorm with slight and heavy hail
    if (code >= 95 && code <= 99) return 'Thunderstorm';

    return 'Cloudy'; // Default
};

const mapConditionToIcon = (condition) => {
    const c = (condition || '').toLowerCase();
    if (c.includes('thunder') || c.includes('lightning')) return 'thunderstorm';
    if (c.includes('snow')) return 'snow';
    if (c.includes('rain') || c.includes('drizzle')) return 'rain';
    if (c.includes('cloud') || c.includes('overcast') || c.includes('fog')) return 'cloudy';
    if (c.includes('partly') || c.includes('few')) return 'partly_cloudy';
    if (c.includes('sun') || c.includes('clear')) return 'sunny';
    return 'partly_cloudy';
};

const getWeatherIcon = (condition, size = 20) => {
    const iconType = mapConditionToIcon(condition);

    switch (iconType) {
        case 'thunderstorm': return <CloudLightning size={size} className="text-yellow-400" />;
        case 'snow': return <CloudSnow size={size} className="text-blue-200" />;
        case 'rain': return <CloudRain size={size} className="text-blue-400" />;
        case 'cloudy': return <Cloud size={size} className="text-gray-400" />;
        case 'partly_cloudy': return <CloudSun size={size} className="text-amber-400" />;
        case 'sunny': return <Sun size={size} className="text-yellow-400" />;
        default: return <CloudSun size={size} className="text-amber-400" />;
    }
};

const OUTDOOR_KEYWORDS = ['hiking', 'outdoor', 'park', 'run', 'walk', 'jog', 'bike', 'cycling', 'garden', 'picnic', 'meeting outside', 'soccer', 'football', 'tennis', 'swim', 'beach', 'camp'];

const WeatherWidget = ({ tasks = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    // Check for outdoor tasks
    const outdoorTasks = tasks.filter(t =>
        !t.isCompleted && OUTDOOR_KEYWORDS.some(kw => t.title.toLowerCase().includes(kw))
    );

    const hasBadWeather = weather?.forecast?.some(d =>
        d.condition.toLowerCase().includes('rain') ||
        d.condition.toLowerCase().includes('storm') ||
        d.condition.toLowerCase().includes('snow')
    );

    const showWeatherAlert = outdoorTasks.length > 0 && hasBadWeather;

    // Fetch weather
    useEffect(() => {
        const fetchWeather = async () => {
            setLoading(true);
            try {
                // Try geolocation
                const pos = await new Promise((resolve, reject) =>
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                ).catch(() => null);

                const lat = pos?.coords?.latitude || 30.27; // Austin TX fallback
                const lon = pos?.coords?.longitude || -97.74;

                // Open-Meteo API URL
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;

                const res = await fetch(url);
                const data = await res.json();

                if (!data || !data.current || !data.daily) {
                    throw new Error('Invalid weather data');
                }

                // Process current weather
                const currentCondition = getWeatherConditionFromCode(data.current.weather_code);

                // Process forecast
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const processedForecast = data.daily.time.slice(0, 5).map((time, index) => {
                    const date = new Date(time + 'T12:00:00'); // Ensure noon to avoid timezone shift issues on day name
                    const condition = getWeatherConditionFromCode(data.daily.weather_code[index]);

                    return {
                        day: days[date.getDay()],
                        temp_high: Math.round(data.daily.temperature_2m_max[index]),
                        temp_low: Math.round(data.daily.temperature_2m_min[index]),
                        condition: condition,
                        icon: mapConditionToIcon(condition)
                    };
                });

                setWeather({
                    current: {
                        temp: Math.round(data.current.temperature_2m),
                        feels_like: Math.round(data.current.apparent_temperature),
                        humidity: data.current.relative_humidity_2m,
                        wind_speed: Math.round(data.current.wind_speed_10m),
                        condition: currentCondition,
                        icon: mapConditionToIcon(currentCondition) // Not strictly used by consumers but good for consistency
                    },
                    forecast: processedForecast
                });
            } catch (err) {
                console.error('Weather fetch failed:', err);
                // Fallback mock data could be set here if desired, 
                // but we will leave it null or maintain previous state to show error/loading state if we had one.
                // For now, let's set a safe fallback to avoid UI break
                setWeather({
                    current: { temp: '--', feels_like: '--', humidity: '--', wind_speed: '--', condition: 'Unavailable' },
                    forecast: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    // Click outside
    useEffect(() => {
        const handleClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    if (!weather) return null; // Or a loading spinner

    const current = weather.current;

    return (
        <div className="relative" ref={panelRef}>
            {/* Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.1, y: -1 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 text-secondary text-sm px-3 py-1.5 rounded-lg border transition-all cursor-pointer select-none relative
                    ${isOpen
                        ? 'bg-white/10 border-white/15 text-white'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                    }
                    ${showWeatherAlert ? 'border-amber-500/40' : ''}
                    ${loading ? 'opacity-50 cursor-wait' : ''}
                `}
            >
                {getWeatherIcon(current.condition, 16)}
                <span>{current.temp !== '--' ? `${current.temp}°F` : '--'}</span>

                {/* Weather alert indicator */}
                {showWeatherAlert && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-black" />
                    </span>
                )}
            </motion.button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute right-0 top-full mt-3 w-80 rounded-2xl overflow-hidden z-50"
                        style={{
                            background: 'rgba(15, 15, 20, 0.85)',
                            backdropFilter: 'blur(24px) saturate(180%)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)'
                        }}
                    >
                        {/* Header */}
                        <div className="p-4 pb-3 border-b border-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs uppercase tracking-wider text-secondary font-medium">Current Weather</span>
                                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-secondary hover:text-white transition-colors">
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Current Weather Card */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {getWeatherIcon(current.condition, 36)}
                                    <div>
                                        <div className="text-3xl font-bold text-white">{current.temp !== '--' ? `${current.temp}°F` : '--'}</div>
                                        <div className="text-xs text-secondary">{current.condition}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 text-xs text-secondary">
                                    <div className="flex items-center gap-1.5">
                                        <Droplets size={12} className="text-blue-400" />
                                        <span>{current.humidity !== '--' ? `${current.humidity}%` : '--'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Wind size={12} className="text-cyan-400" />
                                        <span>{current.wind_speed !== '--' ? `${current.wind_speed} mph` : '--'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Eye size={12} className="text-purple-400" />
                                        <span>Feels {current.feels_like !== '--' ? `${current.feels_like}°` : '--'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5-Day Forecast */}
                        <div className="p-4 pt-3">
                            <span className="text-[10px] uppercase tracking-wider text-secondary font-medium">5-Day Forecast</span>
                            <div className="flex items-center justify-between mt-2.5 gap-1">
                                {weather.forecast.map((day, i) => (
                                    <motion.div
                                        key={day.day + i} // added index to key just in case of duplicates
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        className="flex-1 flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl hover:bg-white/5 transition-colors"
                                    >
                                        <span className="text-[10px] text-secondary font-medium">{day.day}</span>
                                        {getWeatherIcon(day.condition, 18)}
                                        <div className="text-center">
                                            <span className="text-xs font-semibold text-white">{day.temp_high}°</span>
                                            <span className="text-[10px] text-secondary ml-0.5">{day.temp_low}°</span>
                                        </div>
                                    </motion.div>
                                ))}
                                {weather.forecast.length === 0 && (
                                    <div className="text-xs text-secondary py-4 text-center w-full">Forecast unavailable</div>
                                )}
                            </div>
                        </div>

                        {/* Outdoor Task Alert */}
                        {showWeatherAlert && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="px-4 pb-4"
                            >
                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-amber-300">Weather Alert</p>
                                        <p className="text-[11px] text-amber-200/70 mt-0.5">
                                            Rain expected — you have {outdoorTasks.length} outdoor task{outdoorTasks.length > 1 ? 's' : ''}:
                                            <span className="font-medium text-amber-200"> {outdoorTasks.map(t => t.title).join(', ')}</span>
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="px-4 pb-3">
                            <p className="text-[10px] text-secondary/30 text-center">Powered by Open-Meteo</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WeatherWidget;
