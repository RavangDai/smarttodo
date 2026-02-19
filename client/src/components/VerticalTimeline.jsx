import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import './VerticalTimeline.css';

// ── Timeline Slot ──
const TimelineSlot = ({ hour, tasks, currentTime, isCurrentHour }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `hour-${hour}`,
    });

    const formatHour = (h) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12} ${ampm}`;
    };

    const isPast = hour < currentTime.getHours();

    // Beam Logic: Calculate position within the current hour slot
    const getBeamPosition = () => {
        const minutes = currentTime.getMinutes();
        return `${(minutes / 60) * 100}%`;
    };

    return (
        <div
            ref={setNodeRef}
            className={`timeline-slot ${isOver ? 'drag-over' : ''} ${isPast ? 'past' : ''} ${isCurrentHour ? 'current-hour' : ''}`}
        >
            {/* Cinematic Beam (Scanner) */}
            {isCurrentHour && (
                <div className="cinematic-beam" style={{ top: getBeamPosition() }}>
                    {/* Left Dot - Aligned with vertical axis (77px offset) */}
                    <div className="absolute left-[77px] -top-[3px] w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#FF6B35] z-20" />

                    {/* Right 'NOW' Badge - follows the beam */}
                    <div className="absolute right-0 -top-[9px] bg-primary/20 backdrop-blur-md border border-primary/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-[0_0_10px_rgba(255,107,53,0.3)] flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        NOW
                    </div>
                </div>
            )}

            <div className="slot-time">
                {formatHour(hour)}
            </div>

            <div className="slot-content">
                <AnimatePresence>
                    {tasks.length > 0 ? (
                        tasks.map((task, i) => {
                            // Overdue Logic: Task is not completed AND time has passed
                            // We check equality of date in TodaysTasks filtering, so we just check time here.
                            // But cleaner to check full date object.
                            const taskDate = new Date(task.dueDate);
                            const isOverdue = !task.isCompleted && taskDate < currentTime;

                            return (
                                <motion.div
                                    key={task._id}
                                    layoutId={task._id}
                                    initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25, delay: i * 0.05 }}
                                    className={`timeline-card ${task.isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
                                >
                                    <span className="timeline-task-title">{task.title}</span>

                                    <div className="flex items-center gap-2">
                                        {isOverdue && (
                                            <span className="flex items-center gap-1 text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)] bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                                <AlertCircle size={10} />
                                                <span className="text-[9px] font-bold uppercase tracking-wider">Overdue</span>
                                            </span>
                                        )}
                                        {task.isCompleted && (
                                            <span className="check-icon">
                                                <Check size={10} />
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="empty-slot-placeholder">
                            {isOver ? 'DROP TO SCHEDULE' : ''}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// ── Main Timeline ──
const VerticalTimeline = ({ tasks }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const timelineRef = useRef(null);
    const nowRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    // Auto-scroll to "Now" on mount with slight delay for layout
    useEffect(() => {
        const timer = setTimeout(() => {
            if (nowRef.current) {
                nowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const todaysTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d.toDateString() === new Date().toDateString();
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const startHour = 6;   // 6 AM
    const endHour = 22;    // 10 PM
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
    const currentHour = currentTime.getHours();

    return (
        <div className="vertical-timeline" ref={timelineRef}>
            <div className="timeline-header">
                <div className="header-left">
                    <span className="timeline-title">TODAY'S SCHEDULE</span>
                    <span className="timeline-date">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                </div>
                {/* Live Clock in Header */}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="flex flex-col items-end">
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="timeline-content">
                {hours.map(hour => {
                    const hourTasks = todaysTasks.filter(t => {
                        const h = new Date(t.dueDate).getHours();
                        return h === hour;
                    });
                    const isCurrentHour = hour === currentHour;

                    return (
                        <div key={hour} ref={isCurrentHour ? nowRef : null}>
                            <TimelineSlot
                                hour={hour}
                                tasks={hourTasks}
                                currentTime={currentTime}
                                isCurrentHour={isCurrentHour}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Ambient Background Gradient Overlay */}
            <div className="pointer-events-none fixed inset-0 opacity-20" style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(255,107,53,0.05), transparent 70%)',
                zIndex: 0
            }} />
        </div>
    );
};

export default VerticalTimeline;
