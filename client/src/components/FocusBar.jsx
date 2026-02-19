import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Sparkles, Play, Pause, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import WeatherWidget from './ui/WeatherWidget';
import NotificationPanel from './ui/NotificationPanel';
import FlowMeter from './ui/FlowMeter';

const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

const FocusBar = ({ user, taskCount, tasks = [], isFocusMode, onToggleFocus, onUpdateTask, headers }) => {
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [typewriterText, setTypewriterText] = useState('');

    // Pomodoro state
    const [pomodoroActive, setPomodoroActive] = useState(false);
    const [pomodoroTime, setPomodoroTime] = useState(POMODORO_DURATION);
    const [pomodoroPaused, setPomodoroPaused] = useState(false);

    useEffect(() => {
        const urgentTask = tasks.find(t => t.priority === 'high' && !t.isCompleted);
        const nextTask = tasks.find(t => !t.isCompleted);

        let suggestion = "Review your schedule for the day.";
        if (urgentTask) {
            suggestion = `Tackle '${urgentTask.title}' first.`;
        } else if (nextTask) {
            suggestion = `Start with '${nextTask.title}'.`;
        } else if (tasks.length > 0 && tasks.every(t => t.isCompleted)) {
            suggestion = "Great job! You've completed everything.";
        }

        setAiSuggestion(suggestion);
        setTypewriterText('');
    }, [tasks]);

    // Typewriter effect
    useEffect(() => {
        if (!aiSuggestion) return;
        let i = 0;
        const speed = 40;
        setTypewriterText('');
        const interval = setInterval(() => {
            setTypewriterText(aiSuggestion.slice(0, i + 1));
            i++;
            if (i >= aiSuggestion.length) clearInterval(interval);
        }, speed);
        return () => clearInterval(interval);
    }, [aiSuggestion]);

    // ── POMODORO TIMER ──
    useEffect(() => {
        if (!pomodoroActive || pomodoroPaused) return;

        const interval = setInterval(() => {
            setPomodoroTime(prev => {
                if (prev <= 1) {
                    // Timer complete!
                    clearInterval(interval);
                    setPomodoroActive(false);
                    setPomodoroPaused(false);
                    setPomodoroTime(POMODORO_DURATION);
                    // Exit focus mode
                    if (isFocusMode) onToggleFocus();
                    // Celebration
                    confetti({ particleCount: 100, spread: 80, origin: { y: 0.3 }, colors: ['#FF6B35', '#4ade80', '#60a5fa', '#a78bfa'] });
                    return POMODORO_DURATION;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [pomodoroActive, pomodoroPaused, isFocusMode, onToggleFocus]);

    const startPomodoro = () => {
        setPomodoroActive(true);
        setPomodoroPaused(false);
        setPomodoroTime(POMODORO_DURATION);
        if (!isFocusMode) onToggleFocus(); // Auto-enter focus mode
    };

    const togglePomodoroPause = () => {
        setPomodoroPaused(prev => !prev);
    };

    const cancelPomodoro = () => {
        setPomodoroActive(false);
        setPomodoroPaused(false);
        setPomodoroTime(POMODORO_DURATION);
        if (isFocusMode) onToggleFocus(); // Exit focus mode
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const pomodoroProgress = pomodoroActive ? ((POMODORO_DURATION - pomodoroTime) / POMODORO_DURATION) * 100 : 0;

    // ── HELPERS ──
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const getDisplayName = () => {
        if (user?.name) return user.name;
        if (user?.email) {
            const local = user.email.split('@')[0];
            const name = local.split(/[._-]/)[0];
            return name.charAt(0).toUpperCase() + name.slice(1);
        }
        return 'there';
    };

    const getInitial = () => {
        const name = getDisplayName();
        return name ? name[0].toUpperCase() : '?';
    };

    // ── ANIMATION VARIANTS (Premium Ease) ──
    const toolbarVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: -5, scale: 0.96 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'tween',
                ease: [0.2, 0.8, 0.2, 1],
                duration: 0.6
            }
        }
    };

    // SVG circle math for progress ring
    const RING_SIZE = 36;
    const RING_STROKE = 3;
    const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
    const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

    return (
        <div className="w-full flex items-center justify-between px-6 py-4 bg-background/50 backdrop-blur-md border-b border-white/5 z-20">
            <div className="flex items-center gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                >
                    <h2 className="text-xl font-display font-semibold text-white tracking-tight">
                        {getGreeting()}, <span className="text-primary">{getDisplayName()}</span>.
                    </h2>
                    <p className="text-secondary text-xs mt-0.5">
                        You have <span className="text-white font-medium">{taskCount} pending tasks</span> today.
                    </p>
                </motion.div>

                {/* Flow Meter - Signature Moment */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="hidden lg:block"
                >
                    <FlowMeter tasks={tasks} />
                </motion.div>

                {/* AI Suggestion Pill - Smoother entrance, slower pulse */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, x: -8 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                    whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(168, 85, 247, 0.1)' }}
                    className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/5 to-indigo-500/5 border border-purple-500/15 cursor-default"
                >
                    <Sparkles size={14} className="text-purple-400 opacity-80" />
                    <span className="text-xs font-medium text-purple-200/80 tracking-wide uppercase">AI Suggests</span>
                    <div className="h-4 w-px bg-purple-500/10 mx-1" />
                    <span className="text-sm text-purple-100 font-medium min-w-[200px]">
                        {typewriterText}
                        <span className="animate-pulse ml-0.5 opacity-50">|</span>
                    </span>
                </motion.div>
            </div>

            <motion.div
                className="flex items-center gap-4"
                variants={toolbarVariants}
                initial="hidden"
                animate="visible"
            >
                {/* ── WEATHER WIDGET ── */}
                <motion.div variants={itemVariant}>
                    <WeatherWidget tasks={tasks} />
                </motion.div>

                <motion.div variants={itemVariant} className="h-6 w-px bg-white/5 mx-1" />

                {/* ── POMODORO / FOCUS BUTTON ── */}
                <motion.div variants={itemVariant} className="relative">
                    <AnimatePresence mode="wait">
                        {pomodoroActive ? (
                            /* Active Timer Display */
                            <motion.div
                                key="timer"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center gap-2"
                            >
                                {/* Circular Progress Ring */}
                                <div className="relative cursor-pointer" onClick={togglePomodoroPause} title={pomodoroPaused ? "Resume" : "Pause"}>
                                    <svg width={RING_SIZE} height={RING_SIZE} className="transform -rotate-90">
                                        {/* Background track */}
                                        <circle
                                            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
                                            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={RING_STROKE}
                                        />
                                        {/* Progress arc */}
                                        <motion.circle
                                            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
                                            fill="none"
                                            stroke={pomodoroPaused ? '#f59e0b' : '#FF6B35'}
                                            strokeWidth={RING_STROKE}
                                            strokeLinecap="round"
                                            strokeDasharray={RING_CIRCUMFERENCE}
                                            strokeDashoffset={RING_CIRCUMFERENCE - (pomodoroProgress / 100) * RING_CIRCUMFERENCE}
                                            style={{ filter: `drop-shadow(0 0 4px ${pomodoroPaused ? 'rgba(245,158,11,0.3)' : 'rgba(255,107,53,0.3)'})` }}
                                        />
                                    </svg>
                                    {/* Center icon */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {pomodoroPaused
                                            ? <Play size={12} className="text-amber-400 ml-0.5" />
                                            : <Pause size={12} className="text-primary" />
                                        }
                                    </div>
                                </div>

                                {/* Timer Text */}
                                <motion.span
                                    key={pomodoroTime}
                                    initial={{ y: -2, opacity: 0.5 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className={`text-sm font-mono font-bold tracking-wider ${pomodoroPaused ? 'text-amber-400 animate-pulse' : 'text-primary'}`}
                                >
                                    {formatTime(pomodoroTime)}
                                </motion.span>

                                {/* Cancel Button */}
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: -90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={cancelPomodoro}
                                    className="p-1 rounded-lg hover:bg-red-500/10 text-secondary hover:text-red-400 transition-colors"
                                    title="Cancel Timer"
                                >
                                    <RotateCcw size={14} />
                                </motion.button>
                            </motion.div>
                        ) : (
                            /* Start Timer Button */
                            <motion.button
                                key="start"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255,107,53,0.2)' }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
                                onClick={startPomodoro}
                                className={`
                                    p-2 rounded-xl transition-all duration-300
                                    ${isFocusMode
                                        ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,107,53,0.3)]'
                                        : 'bg-white/5 text-secondary hover:text-white hover:bg-white/10'
                                    }
                                `}
                                title="Start 25min Pomodoro"
                            >
                                <Crosshair size={18} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── NOTIFICATION BELL ── */}
                <motion.div variants={itemVariant}>
                    <NotificationPanel
                        tasks={tasks}
                        onUpdateTask={onUpdateTask}
                        headers={headers}
                    />
                </motion.div>

                {/* ── AVATAR ── */}
                <motion.div
                    variants={itemVariant}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255,107,53,0.2)' }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-orange-400 p-0.5 ml-2 cursor-pointer"
                >
                    <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center text-white font-bold text-sm backdrop-blur-sm">
                        {getInitial()}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default FocusBar;
