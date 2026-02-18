import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudSun, Cloud, CloudRain, CloudSnow, Sun, CloudLightning, Wind, Droplets, Eye, X, AlertTriangle } from 'lucide-react';

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// Mock data fallback
const MOCK_WEATHER = {
    current: { temp: 72, feels_like: 70, humidity: 45, wind_speed: 8, condition: 'Partly Cloudy', icon: 'partly_cloudy' },
    forecast: [
        { day: 'Tue', temp_high: 74, temp_low: 58, condition: 'sunny', icon: 'sunny' },
        { day: 'Wed', temp_high: 68, temp_low: 52, condition: 'cloudy', icon: 'cloudy' },
        { day: 'Thu', temp_high: 65, temp_low: 50, condition: 'rain', icon: 'rain' },
        { day: 'Fri', temp_high: 70, temp_low: 55, condition: 'partly_cloudy', icon: 'partly_cloudy' },
        { day: 'Sat', temp_high: 75, temp_low: 60, condition: 'sunny', icon: 'sunny' },
    ]
};

const OUTDOOR_KEYWORDS = ['hiking', 'outdoor', 'park', 'run', 'walk', 'jog', 'bike', 'cycling', 'garden', 'picnic', 'meeting outside', 'soccer', 'football', 'tennis', 'swim', 'beach', 'camp'];

const getWeatherIcon = (condition, size = 20) => {
    const c = (condition || '').toLowerCase();
    if (c.includes('thunder') || c.includes('lightning')) return <CloudLightning size={size} className="text-yellow-400" />;
    if (c.includes('snow')) return <CloudSnow size={size} className="text-blue-200" />;
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain size={size} className="text-blue-400" />;
    if (c.includes('cloud') || c.includes('overcast')) return <Cloud size={size} className="text-gray-400" />;
    if (c.includes('partly') || c.includes('few')) return <CloudSun size={size} className="text-amber-400" />;
    if (c.includes('sun') || c.includes('clear')) return <Sun size={size} className="text-yellow-400" />;
    return <CloudSun size={size} className="text-amber-400" />;
};

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
            if (!WEATHER_API_KEY) {
                setWeather(MOCK_WEATHER);
                return;
            }

            setLoading(true);
            try {
                // Try geolocation
                const pos = await new Promise((resolve, reject) =>
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                ).catch(() => null);

                const lat = pos?.coords?.latitude || 30.27; // Austin TX fallback
                const lon = pos?.coords?.longitude || -97.74;

                const [currentRes, forecastRes] = await Promise.all([
                    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${WEATHER_API_KEY}`),
                    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${WEATHER_API_KEY}`)
                ]);

                const currentData = await currentRes.json();
                const forecastData = await forecastRes.json();

                // Process forecast: get one entry per day (noon)
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dailyMap = {};
                forecastData.list?.forEach(item => {
                    const date = new Date(item.dt * 1000);
                    const dayKey = date.toDateString();
                    if (!dailyMap[dayKey] || date.getHours() >= 12) {
                        dailyMap[dayKey] = {
                            day: days[date.getDay()],
                            temp_high: Math.round(item.main.temp_max),
                            temp_low: Math.round(item.main.temp_min),
                            condition: item.weather[0].main,
                            icon: item.weather[0].main
                        };
                    }
                });

                setWeather({
                    current: {
                        temp: Math.round(currentData.main.temp),
                        feels_like: Math.round(currentData.main.feels_like),
                        humidity: currentData.main.humidity,
                        wind_speed: Math.round(currentData.wind.speed),
                        condition: currentData.weather[0].main,
                        icon: currentData.weather[0].main
                    },
                    forecast: Object.values(dailyMap).slice(0, 5)
                });
            } catch (err) {
                console.error('Weather fetch failed, using mock:', err);
                setWeather(MOCK_WEATHER);
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

    const current = weather?.current || MOCK_WEATHER.current;

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
                `}
            >
                {getWeatherIcon(current.condition, 16)}
                <span>{current.temp}°F</span>

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
                                        <div className="text-3xl font-bold text-white">{current.temp}°F</div>
                                        <div className="text-xs text-secondary">{current.condition}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 text-xs text-secondary">
                                    <div className="flex items-center gap-1.5">
                                        <Droplets size={12} className="text-blue-400" />
                                        <span>{current.humidity}%</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Wind size={12} className="text-cyan-400" />
                                        <span>{current.wind_speed} mph</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Eye size={12} className="text-purple-400" />
                                        <span>Feels {current.feels_like}°</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5-Day Forecast */}
                        <div className="p-4 pt-3">
                            <span className="text-[10px] uppercase tracking-wider text-secondary font-medium">5-Day Forecast</span>
                            <div className="flex items-center justify-between mt-2.5 gap-1">
                                {(weather?.forecast || MOCK_WEATHER.forecast).map((day, i) => (
                                    <motion.div
                                        key={day.day}
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

                        {/* Footer */}
                        {!WEATHER_API_KEY && (
                            <div className="px-4 pb-3">
                                <p className="text-[10px] text-secondary/50 text-center">Demo data • Add VITE_WEATHER_API_KEY for live weather</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WeatherWidget;
