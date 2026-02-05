import React, { useEffect, useState } from 'react';
import { FaMagic, FaCheck } from 'react-icons/fa';
import './VerticalTimeline.css';

const VerticalTimeline = ({ tasks, onAutoSchedule }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isPlanning, setIsPlanning] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // ─── ALGORITHM: AUTO-SCHEDULER ───
    const handlePlanMyDay = () => {
        setIsPlanning(true);

        // 1. Filter Tasks: Only active, unscheduled (no dueTime), or past overdue
        // For simple MVP: Take all active tasks that don't have a dueTime set for TODAY
        const unscheduledTasks = tasks.filter(t => {
            if (t.isCompleted) return false;
            // If it has a dueDate AND a dueTime, and it's today, it's ALREADY scheduled.
            if (t.dueDate && t.dueDate.includes('T')) return false;
            return true;
        });

        // 2. Sort by Priority
        const priorityScore = { high: 3, medium: 2, low: 1 };
        unscheduledTasks.sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);

        // 3. Find Slots (9 AM to 5 PM)
        // Basic Logic: Fill first available slot
        const startHour = 9;
        const endHour = 17;
        const updates = [];

        // Mock checking existing slots
        const existingSlots = new Set(
            tasks
                .filter(t => t.dueDate && t.dueDate.includes('T'))
                .map(t => new Date(t.dueDate).getHours())
        );

        let currentHour = startHour;

        unscheduledTasks.forEach(task => {
            // Find next free hour
            while (existingSlots.has(currentHour) && currentHour < endHour) {
                currentHour++;
            }

            if (currentHour <= endHour) {
                // Construct new Date object for today with assigned hour
                const newDate = new Date();
                newDate.setHours(currentHour, 0, 0, 0);

                updates.push({
                    ...task,
                    dueTime: `${String(currentHour).padStart(2, '0')}:00`,
                    dueDate: newDate.toISOString() // Critical for rendering logic
                });
                existingSlots.add(currentHour);
            }
        });

        if (updates.length > 0) {
            setTimeout(() => {
                onAutoSchedule(updates);
                setIsPlanning(false);
            }, 800); // Fake "Analysis" delay
        } else {
            setIsPlanning(false);
        }
    };

    const todaysTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        // Check if date part matches or if it's just a time update on a text date (handling varies)
        // For now, assume ISO strings
        const d = new Date(t.dueDate);
        return d.toDateString() === new Date().toDateString();
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Generate static hour slots (e.g., 9 AM to 6 PM) for structure if no tasks
    const startHour = 8; // 8 AM
    const endHour = 18;  // 6 PM
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

    return (
        <div className="vertical-timeline">
            <div className="timeline-header">
                <div className="header-left">
                    <span className="timeline-title">Today's Schedule</span>
                    <span className="timeline-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>

                {onAutoSchedule && (
                    <button
                        className={`action-btn ai-plan-btn ${isPlanning ? 'planning' : ''}`}
                        onClick={handlePlanMyDay}
                        disabled={isPlanning}
                        title="Auto-Schedule Unplanned Tasks"
                    >
                        {isPlanning ? (
                            <span className="ai-loader"></span>
                        ) : (
                            <FaMagic size={12} />
                        )}
                        <span>{isPlanning ? 'AI Planning...' : 'Plan Day'}</span>
                    </button>
                )}
            </div>

            <div className="timeline-content">
                {hours.map(hour => {
                    // Check for tasks in this hour
                    const hourTasks = todaysTasks.filter(t => {
                        const h = new Date(t.dueDate).getHours();
                        return h === hour;
                    });

                    return (
                        <TimelineSlot
                            key={hour}
                            hour={hour}
                            tasks={hourTasks}
                            currentTime={currentTime}
                        />
                    );
                })}
            </div>
        </div>
    );
};

// Sub-component for Droppable Slot
import { useDroppable } from '@dnd-kit/core';

const TimelineSlot = ({ hour, tasks, currentTime }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `hour-${hour}`,
    });

    const formatHour = (h) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12} ${ampm}`;
    };

    const isPast = hour < currentTime.getHours();

    return (
        <div
            ref={setNodeRef}
            className={`timeline-slot ${isOver ? 'drag-over' : ''} ${isPast ? 'past' : ''}`}
        >
            <div className="slot-time">{formatHour(hour)}</div>
            <div className="slot-content">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <div key={task._id} className={`timeline-card ${task.isCompleted ? 'completed' : ''}`}>
                            <span className="timeline-task-title">{task.title}</span>
                            {task.isCompleted && <span className="check-icon">✓</span>}
                        </div>
                    ))
                ) : (
                    <div className="empty-slot-placeholder">
                        {isOver ? 'Drop to schedule' : ''}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerticalTimeline;
