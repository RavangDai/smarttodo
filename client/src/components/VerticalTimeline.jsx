import React, { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import './VerticalTimeline.css';

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
                            {task.isCompleted && <span className="check-icon"><FaCheck size={10} /></span>}
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

const VerticalTimeline = ({ tasks }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const todaysTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        // Check if date part matches or if it's just a time update on a text date (handling varies)
        // For now, assume ISO strings
        const d = new Date(t.dueDate);
        return d.toDateString() === new Date().toDateString();
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Generate static hour slots (e.g., 8 AM to 8 PM) for structure
    const startHour = 8; // 8 AM
    const endHour = 20;  // 8 PM
    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

    return (
        <div className="vertical-timeline">
            <div className="timeline-header">
                <div className="header-left">
                    <span className="timeline-title">TODAY'S SCHEDULE</span>
                    <span className="timeline-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>
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

export default VerticalTimeline;
