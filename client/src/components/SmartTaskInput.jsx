import React, { useState, useRef, useEffect } from 'react';
import * as chrono from 'chrono-node';
import { Calendar, Clock, Flag, Folder, Sparkles, Plus, X, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NeoInput from './ui/NeoInput';
import { PrimaryButton } from './ui/Buttons';
import GlassCard from './ui/GlassCard';
import PriorityIcon from './ui/PriorityIcon';

const SmartTaskInput = ({ onAddTask, getLocalDateString, tasks = [], projects = [], preSelectedProject = null }) => {
    const [inputValue, setInputValue] = useState('');
    const [priority, setPriority] = useState('medium');
    const [selectedDate, setSelectedDate] = useState(null); // Date object
    const [selectedProject, setSelectedProject] = useState(preSelectedProject);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showProjectMenu, setShowProjectMenu] = useState(false);

    // Update selectedProject if preSelectedProject changes
    useEffect(() => {
        if (preSelectedProject) {
            setSelectedProject(preSelectedProject);
        }
    }, [preSelectedProject]);

    // Parsed data to show as "chips" or live feedback
    const [parsedData, setParsedData] = useState(null);

    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const dateInputRef = useRef(null);

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
        let finalDate = selectedDate ? getLocalDateString(selectedDate) : null;
        let finalTime = selectedDate ? selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : null;
        let title = inputValue;

        // Final Parse (Fresh parse to avoid state race conditions)
        const results = chrono.parse(inputValue);
        const freshParsedData = results.length > 0 ? {
            date: results[0].start.date(),
            hasTime: results[0].start.knownValues.hour !== undefined,
            text: results[0].text
        } : null;

        if (freshParsedData && !selectedDate) {
            finalDate = getLocalDateString(freshParsedData.date);
            if (freshParsedData.hasTime) {
                finalTime = freshParsedData.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            }
            // Remove the parsed date/time text from the title
            title = title.replace(freshParsedData.text, '').trim();
            // Clean up any double spaces or trailing punctuation often left behind (like 'Meeting at')
            title = title.replace(/\s+at\s*$/, '').trim();
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
        if (!preSelectedProject) {
            setSelectedProject(null);
        }
        setParsedData(null);
        setIsExpanded(false);
    };

    // Click outside to collapse
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                if (!inputValue) setIsExpanded(false);
                setShowProjectMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [inputValue]);

    const handleDateChange = (e) => {
        if (e.target.value) {
            setSelectedDate(new Date(e.target.value));
        }
    };

    const priorities = ['low', 'medium', 'high', 'critical'];

    return (
        <div ref={containerRef} className="relative z-50 w-full max-w-4xl mx-auto">
            {/* Main Input Container */}
            <motion.div
                layout
                className={`
                    relative transition-all duration-300 rounded-2xl border
                    ${isExpanded
                        ? 'bg-black/80 border-primary/50 shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.2)]'
                        : 'bg-black/40 border-white/10 hover:border-white/20'
                    }
                    backdrop-blur-xl
                `}
            >
                <form onSubmit={handleSubmit} className="relative p-2">
                    <NeoInput
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                        placeholder={preSelectedProject ? `Add task to ${preSelectedProject.name}...` : "Add a new task... (e.g., 'Meeting tomorrow at 2pm')"}
                        icon={Plus}
                        className="w-full !bg-transparent !border-none !shadow-none text-lg placeholder:text-white/20"
                        autoFocus={false}
                    />

                    {/* Submit Button (Visible when typing) */}
                    <AnimatePresence>
                        {inputValue && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                                <PrimaryButton
                                    type="submit"
                                    className="!py-2 !px-4 !rounded-xl text-sm font-bold tracking-wide"
                                >
                                    ADD TASK
                                </PrimaryButton>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                {/* Expanded Controls */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden border-t border-white/5"
                        >
                            <div className="p-3 flex flex-wrap gap-4 items-center justify-between">

                                {/* Left: Actions */}
                                <div className="flex items-center gap-2">

                                    {/* Priority Picker */}
                                    <div className="flex bg-white/5 rounded-lg p-1 gap-1 border border-white/5">
                                        {priorities.map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPriority(p)}
                                                className={`
                                                    p-2 rounded-md transition-all relative group
                                                    ${priority === p ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}
                                                `}
                                                title={p}
                                            >
                                                <PriorityIcon priority={p} size={16} className="!bg-transparent !p-0" />
                                                {priority === p && (
                                                    <motion.div
                                                        layoutId="activePriority"
                                                        className="absolute inset-0 border border-white/20 rounded-md"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="w-px h-8 bg-white/10 mx-2" />

                                    {/* Date Picker */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => dateInputRef.current?.showPicker()}
                                            className={`
                                                flex items-center gap-2 px-3 py-2 rounded-lg transition-all border
                                                ${selectedDate
                                                    ? 'bg-primary/20 border-primary/50 text-primary'
                                                    : 'text-secondary hover:text-white hover:bg-white/10 border-transparent hover:border-white/10'
                                                }
                                            `}
                                        >
                                            <Calendar size={16} />
                                            <span className="text-sm font-medium">
                                                {selectedDate ? selectedDate.toLocaleDateString() : 'Set Date'}
                                            </span>
                                        </button>
                                        {/* Hidden Native Input */}
                                        <input
                                            type="date"
                                            ref={dateInputRef}
                                            onChange={handleDateChange}
                                            className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
                                        // Usage: pointer-events-none to avoid covering button, but showPicker works.
                                        // Actually to receive focus/click for accessibility it used to be tricky.
                                        // Modern browsers support showPicker() on input type="date".
                                        />
                                    </div>

                                    {/* Project Selector - Hide if preSelectedProject is set */}
                                    {!preSelectedProject && (
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowProjectMenu(!showProjectMenu)}
                                                className={`
                                                flex items-center gap-2 px-3 py-2 rounded-lg transition-all border
                                                ${selectedProject
                                                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                                        : 'text-secondary hover:text-white hover:bg-white/10 border-transparent hover:border-white/10'
                                                    }
                                            `}
                                            >
                                                <Folder size={16} />
                                                <span className="text-sm font-medium max-w-[100px] truncate">
                                                    {selectedProject ? selectedProject.name : 'Inbox'}
                                                </span>
                                                <ChevronDown size={12} className={`transition-transform ${showProjectMenu ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {showProjectMenu && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        className="absolute top-full left-0 mt-2 w-48 bg-black/90 border border-white/10 rounded-xl shadow-xl backdrop-blur-xl z-50 overflow-hidden"
                                                    >
                                                        <div className="p-1">
                                                            <button
                                                                onClick={() => { setSelectedProject(null); setShowProjectMenu(false); }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                                            >
                                                                <Folder size={14} /> Inbox
                                                                {!selectedProject && <Check size={14} className="ml-auto text-primary" />}
                                                            </button>
                                                            {projects.map(proj => (
                                                                <button
                                                                    key={proj._id}
                                                                    onClick={() => { setSelectedProject(proj); setShowProjectMenu(false); }}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                                                >
                                                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                                    {proj.name}
                                                                    {selectedProject?._id === proj._id && <Check size={14} className="ml-auto text-primary" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>

                                {/* Right: NLP Analysis Feedback */}
                                {parsedData && !selectedDate && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"
                                    >
                                        <Sparkles size={12} />
                                        <span>
                                            Detected: {parsedData.date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                            {parsedData.hasTime && ` @ ${parsedData.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                        </span>
                                    </motion.div>
                                )}

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default SmartTaskInput;
