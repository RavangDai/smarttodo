import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Clock, ArrowRight, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import axios from 'axios';

const NotificationPanel = ({ tasks = [], onUpdateTask, headers }) => {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);
    const [dismissedIds, setDismissedIds] = useState(new Set());

    // Build notifications from task data
    const notifications = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const items = [];

        tasks.forEach(task => {
            if (dismissedIds.has(task._id)) return;

            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            const dueDay = dueDate ? new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()) : null;

            if (task.isCompleted) {
                // Recently completed (within last 24h based on updatedAt or just show)
                items.push({
                    id: `done-${task._id}`,
                    taskId: task._id,
                    type: 'completed',
                    title: task.title,
                    message: 'Completed',
                    icon: <CheckCircle2 size={16} className="text-emerald-400" />,
                    task
                });
            } else if (dueDay && dueDay < today) {
                // Overdue
                const daysOverdue = Math.floor((today - dueDay) / (1000 * 60 * 60 * 24));
                items.push({
                    id: `overdue-${task._id}`,
                    taskId: task._id,
                    type: 'overdue',
                    title: task.title,
                    message: `Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`,
                    icon: <AlertCircle size={16} className="text-red-400" />,
                    task,
                    priority: 2
                });
            } else if (dueDay && dueDay.getTime() === today.getTime()) {
                // Due today
                items.push({
                    id: `today-${task._id}`,
                    taskId: task._id,
                    type: 'today',
                    title: task.title,
                    message: task.dueTime ? `Due at ${task.dueTime}` : 'Due today',
                    icon: <Clock size={16} className="text-amber-400" />,
                    task,
                    priority: 1
                });
            }
        });

        // Sort: overdue first, then today, then completed
        items.sort((a, b) => (b.priority || 0) - (a.priority || 0));

        // Limit completed items
        const active = items.filter(i => i.type !== 'completed');
        const completed = items.filter(i => i.type === 'completed').slice(0, 3);
        return [...active, ...completed];
    }, [tasks, dismissedIds]);

    const actionableCount = notifications.filter(n => n.type === 'overdue' || n.type === 'today').length;

    // Handle Mark Done
    const handleMarkDone = async (notification) => {
        try {
            const updated = { ...notification.task, isCompleted: true };
            onUpdateTask(updated);
            await axios.put(`/api/tasks/${notification.taskId}`, { isCompleted: true }, { headers });
            setDismissedIds(prev => new Set(prev).add(notification.taskId));
        } catch (err) {
            console.error('Failed to mark done:', err);
        }
    };

    // Handle Snooze
    const handleSnooze = async (notification, minutes) => {
        try {
            const newDate = new Date();
            newDate.setMinutes(newDate.getMinutes() + minutes);
            const timeStr = `${String(newDate.getHours()).padStart(2, '0')}:${String(newDate.getMinutes()).padStart(2, '0')}`;

            const updated = { ...notification.task, dueTime: timeStr };
            onUpdateTask(updated);
            await axios.put(`/api/tasks/${notification.taskId}`, { dueTime: timeStr }, { headers });
            setDismissedIds(prev => new Set(prev).add(notification.taskId));
        } catch (err) {
            console.error('Failed to snooze:', err);
        }
    };

    // Handle Tomorrow
    const handleTomorrow = async (notification) => {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const isoDate = tomorrow.toISOString();

            const updated = { ...notification.task, dueDate: isoDate };
            onUpdateTask(updated);
            await axios.put(`/api/tasks/${notification.taskId}`, { dueDate: isoDate }, { headers });
            setDismissedIds(prev => new Set(prev).add(notification.taskId));
        } catch (err) {
            console.error('Failed to reschedule:', err);
        }
    };

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

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Trigger */}
            <motion.button
                whileHover={{ scale: 1.12, rotate: [0, -12, 12, -8, 8, 0] }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    p-2 rounded-xl transition-colors relative
                    ${isOpen
                        ? 'bg-white/15 text-white'
                        : 'bg-white/5 text-secondary hover:text-white hover:bg-white/10'
                    }
                `}
            >
                <Bell size={18} />
                {/* Dynamic count badge */}
                {actionableCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 border border-black text-[9px] font-bold text-white">
                            {actionableCount}
                        </span>
                    </span>
                )}
            </motion.button>

            {/* Notification Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute right-0 top-full mt-3 w-96 rounded-2xl overflow-hidden z-50"
                        style={{
                            background: 'rgba(15, 15, 20, 0.9)',
                            backdropFilter: 'blur(24px) saturate(180%)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)'
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 pb-3 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">Notifications</span>
                                {actionableCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                                        {actionableCount}
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-secondary hover:text-white transition-colors">
                                <X size={14} />
                            </button>
                        </div>

                        {/* Notification List */}
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                /* Empty State */
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-10 px-6"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                                    >
                                        <CheckCircle2 size={40} className="text-emerald-400/50" />
                                    </motion.div>
                                    <p className="text-sm text-white mt-3 font-medium">All caught up!</p>
                                    <p className="text-xs text-secondary mt-1">No pending notifications right now.</p>
                                </motion.div>
                            ) : (
                                <div className="p-2">
                                    <AnimatePresence>
                                        {notifications.map((notif, i) => (
                                            <motion.div
                                                key={notif.id}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20, height: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className={`
                                                    p-3 rounded-xl mb-1.5 transition-colors
                                                    ${notif.type === 'overdue' ? 'bg-red-500/5 hover:bg-red-500/10 border border-red-500/10' : ''}
                                                    ${notif.type === 'today' ? 'bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10' : ''}
                                                    ${notif.type === 'completed' ? 'bg-white/[0.02] hover:bg-white/5 border border-transparent' : ''}
                                                `}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex-shrink-0">{notif.icon}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${notif.type === 'completed' ? 'text-secondary line-through' : 'text-white'}`}>
                                                            {notif.title}
                                                        </p>
                                                        <p className="text-[11px] text-secondary mt-0.5">{notif.message}</p>

                                                        {/* Quick Actions */}
                                                        {notif.type !== 'completed' && (
                                                            <div className="flex items-center gap-1.5 mt-2">
                                                                <button
                                                                    onClick={() => handleMarkDone(notif)}
                                                                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-medium transition-colors"
                                                                >
                                                                    <Check size={10} />
                                                                    Done
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSnooze(notif, 10)}
                                                                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-medium transition-colors"
                                                                >
                                                                    <Clock size={10} />
                                                                    Snooze 10m
                                                                </button>
                                                                <button
                                                                    onClick={() => handleTomorrow(notif)}
                                                                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[10px] font-medium transition-colors"
                                                                >
                                                                    <Calendar size={10} />
                                                                    Tomorrow
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationPanel;
