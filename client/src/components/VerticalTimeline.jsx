import React, { useEffect, useState } from 'react';
import './VerticalTimeline.css';

const VerticalTimeline = ({ tasks }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const todaysTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d.toDateString() === new Date().toDateString();
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    if (todaysTasks.length === 0) {
        return (
            <div className="vertical-timeline empty">
                <div className="timeline-header">
                    <span className="timeline-title">Timeline</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    No scheduled tasks for today.
                </p>
            </div>
        );
    }

    // Helper to check if task is current (within last hour and next hour window, or just simple check)
    const isCurrent = (task) => {
        if (task.isCompleted) return false;
        const taskTime = new Date(task.dueDate);
        const diff = Math.abs(currentTime - taskTime) / 36e5; // hours
        return diff < 1; // Highlight if within 1 hour radius
    };

    return (
        <div className="vertical-timeline">
            <div className="timeline-header">
                <span className="timeline-title">Today's Schedule</span>
            </div>

            <div className="timeline-content">
                {/* Visual Now Line - Simplified approximation */}
                {/* In a real drag-drop calendar, we'd calculate pixel offset. 
                    For this list, we'll just insert it naturally if we wanted, 
                    but for now, highlighting "current" tasks is enough. */}

                {todaysTasks.map(task => {
                    const date = new Date(task.dueDate);
                    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const active = isCurrent(task);

                    return (
                        <div key={task._id} className={`timeline-item ${task.isCompleted ? 'completed' : ''} ${active ? 'active' : ''}`}>
                            <div className="timeline-time">{timeStr}</div>
                            <div className="timeline-card">
                                <h4 className="timeline-task-title">{task.title}</h4>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VerticalTimeline;
