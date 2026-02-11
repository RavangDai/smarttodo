import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Edit2, Trash2, ChevronDown, ChevronUp, Plus, Sparkles, X, Check, FileText } from 'lucide-react';
import axios from 'axios';
import Checkbox from './ui/Checkbox';
import PriorityIcon from './ui/PriorityIcon';
import confetti from 'canvas-confetti';

const TaskAccordion = ({ task, onUpdate, onDelete, isExpanded, onToggle, headers }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task.title);

    // Subtasks State
    const [subtasks, setSubtasks] = useState(task.subtasks || []);
    const [newSubtask, setNewSubtask] = useState('');

    // Notes State
    const [notes, setNotes] = useState(task.notes || '');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    // AI State
    const [aiCommand, setAiCommand] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiStreaming, setAiStreaming] = useState(false);

    // Sync state with props when expanding (or just init)
    useEffect(() => {
        setSubtasks(task.subtasks || []);
        setNotes(task.notes || '');
        setEditedTitle(task.title);
    }, [task, isExpanded]);

    // ─── HELPERS ───
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    // ─── HANDLERS ───
    const handleSaveTitle = () => {
        if (editedTitle !== task.title) {
            onUpdate({ ...task, title: editedTitle });
        }
        setIsEditing(false);
    };

    const handleCheckboxChange = (checked) => {
        onUpdate({ ...task, isCompleted: checked });
    };

    const updateTaskFn = async (updates) => {
        // Optimistic local update via parent
        onUpdate({ ...task, ...updates });

        try {
            // FIX: Pass headers in the config object correctly
            await axios.put(`/api/tasks/${task._id}`, updates, { headers: headers });
        } catch (err) {
            console.error("Failed to update task", err);
        }
    };

    // ─── SUBTASKS ───
    const addSubtask = async (e) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;

        const newSubtasks = [...subtasks, { title: newSubtask, isCompleted: false }];
        setSubtasks(newSubtasks);
        setNewSubtask('');

        await updateTaskFn({ subtasks: newSubtasks });
    };

    const toggleSubtask = async (index) => {
        const newSubtasks = [...subtasks];
        newSubtasks[index].isCompleted = !newSubtasks[index].isCompleted;
        setSubtasks(newSubtasks);
        await updateTaskFn({ subtasks: newSubtasks });
    };

    const deleteSubtask = async (index) => {
        const newSubtasks = subtasks.filter((_, i) => i !== index);
        setSubtasks(newSubtasks);
        await updateTaskFn({ subtasks: newSubtasks });
    };

    const generateSubtasks = async () => {
        setIsAiLoading(true);
        setAiStreaming(true);
        try {
            // Using the streaming endpoint structure from ai.js
            const response = await fetch(`/api/ai/breakdown/${task._id}`, {
                method: 'POST',
                headers: headers || {}
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let accumulatedSubtasks = [...subtasks];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '{"done": true}') continue;
                        try {
                            const newSubtaskData = JSON.parse(dataStr);
                            if (newSubtaskData.error) throw new Error(newSubtaskData.error);

                            // Add strictly unique
                            if (!accumulatedSubtasks.find(s => s.title === newSubtaskData.title)) {
                                accumulatedSubtasks.push({
                                    title: newSubtaskData.title,
                                    isCompleted: false
                                });
                                // Update state incrementally for "streaming" effect
                                setSubtasks([...accumulatedSubtasks]);
                            }
                        } catch (e) {
                            // ignore json errors
                        }
                    }
                }
            }

            // Final sync
            await updateTaskFn({ subtasks: accumulatedSubtasks });

        } catch (err) {
            console.error(err);
        } finally {
            setIsAiLoading(false);
            setAiStreaming(false);
        }
    };

    // ─── NOTES ───
    const timeoutRef = useRef(null);
    const handleNotesChange = (e) => {
        const val = e.target.value;
        setNotes(val);
        setIsSavingNotes(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(async () => {
            await updateTaskFn({ notes: val });
            setIsSavingNotes(false);
        }, 1000);
    };

    // ─── AI COMMAND ───
    const handleAiCommand = async (e) => {
        e.preventDefault();
        if (!aiCommand.trim()) return;

        setIsAiLoading(true);
        try {
            // FIX: Pass headers in the config object
            const res = await axios.post('/api/ai/nlp', {
                taskId: task._id,
                command: aiCommand
            }, { headers: headers });

            const { action, subtask, updates, message } = res.data;

            if (action === 'update' && updates) {
                onUpdate({ ...task, ...updates }); // Local
                confetti({ cursor: { x: 0.5, y: 0.5 }, particleCount: 50, spread: 60 });
            } else if (action === 'add_subtask' && subtask) {
                const newSubtasks = [...subtasks, { title: subtask, isCompleted: false }];
                setSubtasks(newSubtasks);
            }

            setAiCommand('');
            // Optional: Add toast notification call here if available

        } catch (err) {
            console.error(err);
        } finally {
            setIsAiLoading(false);
        }
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className={`
                group relative mb-3 rounded-2xl border transition-all duration-300
                ${task.isCompleted
                    ? 'bg-transparent border-white/5 opacity-60'
                    : 'bg-white/5 border-white/10 hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                }
                ${isExpanded ? 'bg-white/10 border-primary/20 shadow-lg' : ''}
            `}
        >
            <div className="flex items-center gap-4 p-4 pr-5">
                {/* ── CHECKBOX ── */}
                <Checkbox
                    checked={task.isCompleted}
                    onChange={(checked) => {
                        handleCheckboxChange(checked);
                        updateTaskFn({ isCompleted: checked });
                    }}
                    priority={task.priority}
                />

                {/* ── TITLE ── */}
                <div className="flex-1 min-w-0" onClick={onToggle}>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onBlur={handleSaveTitle}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTitle();
                                if (e.key === 'Escape') setIsEditing(false);
                            }}
                            className="w-full bg-black/20 text-white rounded px-2 py-1 outline-none border border-primary/50"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <div className="flex flex-col gap-0.5 cursor-pointer">
                            <span className={`text-[15px] font-medium transition-all ${task.isCompleted ? 'line-through text-secondary' : 'text-white'}`}>
                                {task.title}
                            </span>
                            <div className="flex items-center gap-3 text-xs text-secondary">
                                {task.dueDate && (
                                    <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}>
                                        <Calendar size={10} />
                                        {formatDate(task.dueDate)}
                                    </span>
                                )}
                                {task.dueTime && (
                                    <span className="flex items-center gap-1">
                                        <Clock size={10} />
                                        {task.dueTime}
                                    </span>
                                )}
                                {subtasks.length > 0 && (
                                    <span className="flex items-center gap-1 text-primary/80">
                                        <Check size={10} />
                                        {subtasks.filter(s => s.isCompleted).length}/{subtasks.length}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── ACTIONS ── */}
                <div className="flex items-center gap-2">
                    <PriorityIcon priority={task.priority} />
                    <div className={`flex items-center gap-1 transition-opacity duration-200 ${isExpanded || 'group-hover:opacity-100 opacity-0'}`}>
                        <button onClick={() => setIsEditing(!isEditing)} className="p-1.5 rounded-lg hover:bg-white/10 text-secondary hover:text-primary transition-colors">
                            <Edit2 size={14} />
                        </button>
                        <button onClick={() => { onDelete(task._id); deleteSubtask(); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-secondary hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    <button onClick={onToggle} className="p-1 text-secondary hover:text-white transition-colors">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {/* ── EXPANDED CONTENT ── */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/5"
                    >
                        <div className="p-4 bg-black/20 rounded-b-2xl space-y-6">

                            {/* 1. NOTES SECTION */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs uppercase tracking-wider text-secondary flex items-center gap-2">
                                        <FileText size={12} /> Notes
                                    </label>
                                    {isSavingNotes && <span className="text-[10px] text-primary animate-pulse">Saving...</span>}
                                </div>
                                <textarea
                                    value={notes}
                                    onChange={handleNotesChange}
                                    placeholder="Add details, links, or thoughts here..."
                                    className="w-full bg-white/5 rounded-xl border border-white/10 p-3 text-sm text-white/90 focus:outline-none focus:border-primary/40 min-h-[80px] resize-none"
                                />
                            </div>

                            {/* 2. SUBTASKS SECTION */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs uppercase tracking-wider text-secondary flex items-center gap-2">
                                        <Check size={12} /> Subtasks
                                    </label>
                                    <button
                                        onClick={generateSubtasks}
                                        disabled={isAiLoading}
                                        className="text-[10px] flex items-center gap-1 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                                    >
                                        <Sparkles size={10} />
                                        {isAiLoading ? 'Generating...' : 'AI Breakdown'}
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                {subtasks.length > 0 && (
                                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(subtasks.filter(s => s.isCompleted).length / subtasks.length) * 100}%` }}
                                        />
                                    </div>
                                )}

                                {/* Subtask List - IMPROVED ANIMATION */}
                                <div className="space-y-2">
                                    <AnimatePresence mode="popLayout">
                                        {subtasks.map((sub, idx) => (
                                            <motion.div
                                                key={idx} // ideally use a unique ID if available, using idx is risky for reordering but okay for simple append/delete
                                                layout
                                                initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                                exit={{ opacity: 0, x: 20, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex items-center gap-3 group/sub"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={sub.isCompleted}
                                                    onChange={() => toggleSubtask(idx)}
                                                    className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-primary checked:border-primary transition-all cursor-pointer appearance-none border checked:after:content-['✓'] checked:after:text-white checked:after:text-[10px] checked:after:flex checked:after:justify-center"
                                                />
                                                <span className={`text-sm flex-1 transition-colors ${sub.isCompleted ? 'text-secondary line-through' : 'text-white/80'}`}>
                                                    {sub.title}
                                                </span>
                                                <button
                                                    onClick={() => deleteSubtask(idx)}
                                                    className="opacity-0 group-hover/sub:opacity-100 p-1 text-secondary hover:text-red-400 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Add Subtask Input */}
                                <form onSubmit={addSubtask} className="relative">
                                    <input
                                        type="text"
                                        value={newSubtask}
                                        onChange={(e) => setNewSubtask(e.target.value)}
                                        placeholder="Add a subtask..."
                                        className="w-full bg-transparent border-b border-white/10 py-2 pl-6 pr-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                    <Plus size={14} className="absolute left-0 top-2.5 text-secondary" />
                                </form>
                            </div>

                            {/* 3. AI COMMAND SECTION - IMPROVED ANIMATION */}
                            <div className="pt-2 border-t border-white/5">
                                <form onSubmit={handleAiCommand} className="relative overflow-hidden rounded-xl">
                                    <div className="absolute left-3 top-3 text-primary animate-pulse-slow z-10">
                                        <Sparkles size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        value={aiCommand}
                                        onChange={(e) => setAiCommand(e.target.value)}
                                        placeholder="Ask AI to edit this task... (e.g., 'Move to tomorrow')"
                                        className="w-full bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-primary/30 relative z-10 bg-transparent"
                                        disabled={isAiLoading}
                                    />

                                    {/* AI Processing Animation - Scanning Beam */}
                                    {isAiLoading && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent z-0"
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '100%' }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                        />
                                    )}

                                    {isAiLoading && (
                                        <div className="absolute right-3 top-3 z-10">
                                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </form>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TaskAccordion;
