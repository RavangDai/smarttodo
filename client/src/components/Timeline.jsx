import React from 'react';

const Timeline = ({ tasks }) => {
    // Logic: Filter tasks for Today that have a time set
    const today = new Date();
    const todayString = today.toLocaleDateString();

    const todaysTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d.toLocaleDateString() === todayString;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    if (todaysTasks.length === 0) return null;

    // Time Range: 8am (8) to 8pm (20) -> 12 hours
    const startHour = 8;
    const endHour = 20;
    const totalHours = endHour - startHour;

    const getPosition = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const decimalTime = hours + minutes / 60;

        // Clamp between start/end
        if (decimalTime < startHour) return 0;
        if (decimalTime > endHour) return 100;

        return ((decimalTime - startHour) / totalHours) * 100;
    };

    const tasksAhead = todaysTasks.filter(t => !t.isCompleted).length;
    const tasksDone = todaysTasks.filter(t => t.isCompleted).length;

    return (
        <div className="timeline-container">
            <div className="timeline-header">
                <span className="timeline-title">Today's Focus</span>
                <span className="timeline-stats">{tasksAhead} ahead • {tasksDone} done</span>
            </div>

            <div className="timeline-track">
                {/* Base Line */}
                <div className="timeline-line"></div>

                {/* Hour Markers */}
                {[9, 12, 15, 18].map(h => (
                    <div
                        key={h}
                        className="time-marker"
                        style={{ left: `${((h - startHour) / totalHours) * 100}%` }}
                    >
                        <div className="marker-dot"></div>
                        <span className="marker-label">{h > 12 ? h - 12 + 'pm' : h + 'am'}</span>
                    </div>
                ))}

                {/* Tasks */}
                {todaysTasks.map(task => (
                    <div
                        key={task._id}
                        className={`task-dot ${task.isCompleted ? 'completed' : ''}`}
                        style={{ left: `${getPosition(task.dueDate)}%` }}
                        title={`${task.title} (${new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                    >
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;
