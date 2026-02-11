import React from 'react';
import { Bell, CloudSun, Crosshair, Sparkles } from 'lucide-react';

const FocusBar = ({ user, taskCount, tasks = [], isFocusMode, onToggleFocus }) => {
    const [aiSuggestion, setAiSuggestion] = React.useState('');
    const [typewriterText, setTypewriterText] = React.useState('');

    React.useEffect(() => {
        // Simple AI Logic: Find first high priority task or just first task
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
    React.useEffect(() => {
        if (!aiSuggestion) return;

        // Reset
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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="w-full flex items-center justify-between px-6 py-4 bg-background/50 backdrop-blur-md border-b border-white/5 z-20">
            <div className="flex items-center gap-6">
                <div>
                    <h2 className="text-xl font-display font-semibold text-white tracking-tight">
                        {getGreeting()}, <span className="text-primary">{user?.name || 'Bibek'}</span>.
                    </h2>
                    <p className="text-secondary text-xs mt-0.5">
                        You have <span className="text-white font-medium">{taskCount} pending tasks</span> today.
                    </p>
                </div>

                {/* AI Suggestion Pill */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
                    <Sparkles size={14} className="text-purple-400 animate-pulse" />
                    <span className="text-xs font-medium text-purple-200/90 tracking-wide uppercase">AI Suggests</span>
                    <div className="h-4 w-px bg-purple-500/20 mx-1" />
                    <span className="text-sm text-purple-100 font-medium min-w-[200px]">
                        {typewriterText}
                        <span className="animate-pulse ml-0.5 opacity-70">|</span>
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-secondary text-sm bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <CloudSun size={16} />
                    <span>72°F</span>
                </div>

                <div className="h-6 w-px bg-white/10 mx-2" />

                <button
                    onClick={onToggleFocus}
                    className={`
                        p-2 rounded-xl transition-all duration-300
                        ${isFocusMode
                            ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,107,53,0.4)]'
                            : 'bg-white/5 text-secondary hover:text-white hover:bg-white/10'
                        }
                    `}
                    title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                >
                    <Crosshair size={18} className={isFocusMode ? 'animate-spin-slow' : ''} />
                </button>

                <button className="p-2 rounded-xl bg-white/5 text-secondary hover:text-white hover:bg-white/10 transition-colors relative">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-black shadow-sm" />
                </button>

                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-orange-400 p-0.5 ml-2 cursor-pointer hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center text-white font-bold text-sm backdrop-blur-sm">
                        {user?.name ? user.name[0].toUpperCase() : 'B'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FocusBar;
