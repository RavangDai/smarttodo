import React from 'react';

const Timeline = ({ tasks }) => {
    const today = new Date();
    const todayString = today.toLocaleDateString();

    const todaysTasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d.toLocaleDateString() === todayString;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    if (todaysTasks.length === 0) return null;

    // Calculate dynamic time range
    const currentHour = today.getHours();
    const taskHours = todaysTasks.map(t => new Date(t.dueDate).getHours());

    let startHour = Math.min(8, currentHour, ...taskHours);
    let endHour = Math.max(20, currentHour + 1, ...taskHours.map(h => h + 1));

    startHour = Math.max(0, startHour - 1);
    endHour = Math.min(24, endHour + 1);

    if (endHour - startHour < 6) {
        if (endHour <= 18) endHour = startHour + 6;
        else startHour = endHour - 6;
    }

    const totalHours = endHour - startHour;

    const getPosition = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const decimalTime = hours + minutes / 60;

        if (decimalTime < startHour) return 0;
        if (decimalTime > endHour) return 100;

        return ((decimalTime - startHour) / totalHours) * 100;
    };

    const currentTimePosition = getPosition(today);
    const tasksAhead = todaysTasks.filter(t => !t.isCompleted).length;
    const tasksDone = todaysTasks.filter(t => t.isCompleted).length;

    // Generate hour markers
    const step = totalHours > 12 ? 3 : 2;
    const markers = [];
    for (let h = Math.ceil(startHour / step) * step; h <= endHour; h += step) {
        if (h >= startHour && h <= endHour) {
            markers.push(h);
        }
    }

    return (
        <div className="timeline-container">
            <div className="timeline-header">
                <span className="timeline-title">TODAY'S TIMELINE</span>
                <span className="timeline-stats">
                    <span className="stat-ahead">{tasksAhead}</span> AHEAD ·
                    <span className="stat-done">{tasksDone}</span> DONE
                </span>
            </div>

            <div className="timeline-track">
                {/* Base Line */}
                <div className="timeline-line" />

                {/* Progress Fill */}
                <div
                    className="timeline-progress"
                    style={{ width: `${currentTimePosition}%` }}
                />

                {/* Current Time Marker */}
                {currentTimePosition >= 0 && currentTimePosition <= 100 && (
                    <div
                        className="timeline-now"
                        style={{ left: `${currentTimePosition}%` }}
                    >
                        <span className="now-label">NOW</span>
                        <div className="now-line" />
                    </div>
                )}

                {/* Hour Markers */}
                {markers.map(h => (
                    <div
                        key={h}
                        className="timeline-marker"
                        style={{ left: `${((h - startHour) / totalHours) * 100}%` }}
                    >
                        <span className="marker-time">{String(h).padStart(2, '0')}:00</span>
                    </div>
                ))}

                {/* Task Dots */}
                {todaysTasks.map((task, index) => (
                    <div
                        key={task._id}
                        className={`timeline-dot priority-${task.priority || 'medium'} ${task.isCompleted ? 'completed' : ''}`}
                        style={{
                            left: `${getPosition(task.dueDate)}%`,
                            animationDelay: `${index * 100}ms`
                        }}
                        title={task.title}
                    >
                        {task.isCompleted && <span className="dot-check">✓</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;
