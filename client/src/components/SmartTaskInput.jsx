import React, { useState, useRef, useEffect } from 'react';
import * as chrono from 'chrono-node';
import { Calendar, Clock, Flag, Folder, Sparkles, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NeoInput from './ui/NeoInput';
import { PrimaryButton } from './ui/Buttons';
import GlassCard from './ui/GlassCard';
import PriorityIcon from './ui/PriorityIcon';

const SmartTaskInput = ({ onAddTask, getLocalDateString, tasks = [] }) => {
    const [inputValue, setInputValue] = useState('');
    const [priority, setPriority] = useState('medium');
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // Parsed data to show as "chips" or live feedback
    const [parsedData, setParsedData] = useState(null);

    const inputRef = useRef(null);
    const containerRef = useRef(null);

    // Natural Language Parsing
    useEffect(() => {
        if (!inputValue) {
            setParsedData(null);
            return;
        }

        const results = chrono.parse(inputValue);
        if (results.length > 0) {
            const date = results[0].start.date();
            const timeComponent = results[0].start.knownValues.hour !== undefined;

            setParsedData({
                date: date,
                hasTime: timeComponent,
                text: results[0].text
            });
        } else {
            setParsedData(null);
        }
    }, [inputValue]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Final Parse
        let finalDate = selectedDate;
        let finalTime = selectedTime;
        let title = inputValue;

        if (parsedData) {
            finalDate = getLocalDateString(parsedData.date);
            if (parsedData.hasTime) {
                finalTime = parsedData.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            }
            // Optional: Remove parsed date text from title? 
            // title = title.replace(parsedData.text, '').trim(); 
            // Users often prefer keeping it or having it auto-remove. Let's keep it simple for now or strictly use the parsed values.
        }

        onAddTask({
            title: title,
            priority,
            dueDate: finalDate,
            dueTime: finalTime,
            project: selectedProject
        });

        // Reset
        setInputValue('');
        setPriority('medium');
        setSelectedDate(null);
        setSelectedTime(null);
        setParsedData(null);
        setIsExpanded(false);
    };

    // Click outside to collapse
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                if (!inputValue) setIsExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [inputValue]);

    const priorities = ['low', 'medium', 'high', 'critical'];

    return (
        <div ref={containerRef} className="relative z-50 w-full max-w-3xl mx-auto">
            {/* Main Input Container */}
            <div
                className={`
                    relative transition-all duration-300
                    ${isExpanded ? 'scale-100' : 'scale-[0.99]'}
                `}
            >
                <form onSubmit={handleSubmit} className="relative">
                    <NeoInput
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                        placeholder="Add a new task... (e.g., 'Meeting tomorrow at 2pm')"
                        icon={Plus}
                        className="w-full shadow-2xl"
                        autoFocus={false} // Prevent auto-jump on load
                    />

                    {/* Submit Button (Visible when typing) */}
                    <AnimatePresence>
                        {inputValue && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute right-2 top-2"
                            >
                                <PrimaryButton
                                    type="submit"
                                    className="!py-1.5 !px-3 !rounded-lg text-sm"
                                >
                                    Add
                                </PrimaryButton>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                {/* Expanded Controls */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            className="overflow-hidden"
                        >
                            <GlassCard className="mt-2 p-3 !bg-black/40 !border-white/10 !backdrop-blur-xl flex flex-wrap gap-4 items-center justify-between">

                                {/* Left: Analyzed Data Feedback */}
                                <div className="flex items-center gap-3">
                                    {/* Date Parsed Feedback */}
                                    {parsedData && (
                                        <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                                            <Sparkles size={12} />
                                            <span>
                                                {parsedData.date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                                {parsedData.hasTime && ` • ${parsedData.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Manual Controls */}
                                <div className="flex items-center gap-2">
                                    {/* Priority Picker */}
                                    <div className="flex bg-white/5 rounded-lg p-1 gap-1">
                                        {priorities.map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPriority(p)}
                                                className={`
                                                    p-1.5 rounded-md transition-all
                                                    ${priority === p ? 'bg-white/10 shadow-sm' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}
                                                `}
                                                title={p}
                                            >
                                                <PriorityIcon priority={p} size={14} className="!bg-transparent !p-0" />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Manual Date Trigger (Placeholder for full picker) */}
                                    <button
                                        type="button"
                                        className="p-2 text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="Pick Date"
                                    >
                                        <Calendar size={18} />
                                    </button>

                                    <div className="w-px h-6 bg-white/10 mx-1" />

                                    {/* Project Selector (Placeholder) */}
                                    {tasks.length > 0 && ( // Just showing logic, usually projects list
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                                        >
                                            <Folder size={14} />
                                            <span>Inbox</span>
                                        </button>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SmartTaskInput;
