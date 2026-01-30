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

    // Calculate dynamic start and end hours
    const currentHour = today.getHours();
    const taskHours = todaysTasks.map(t => new Date(t.dueDate).getHours());

    // Default range or based on tasks/now
    let startHour = Math.min(8, currentHour, ...taskHours);
    let endHour = Math.max(20, currentHour + 1, ...taskHours.map(h => h + 1));

    // Add padding
    startHour = Math.max(0, startHour - 1);
    endHour = Math.min(24, endHour + 1);

    // Ensure a minimum range for visual balance
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

    // Calculate current time position
    const currentTimePosition = getPosition(today);

    const tasksAhead = todaysTasks.filter(t => !t.isCompleted).length;
    const tasksDone = todaysTasks.filter(t => t.isCompleted).length;

    // Calculate progress percentage for gradient
    const completedTasks = todaysTasks.filter(t => t.isCompleted);
    const progressPercentage = completedTasks.length > 0
        ? Math.max(...completedTasks.map(t => getPosition(t.dueDate)))
        : 0;

    // Generate hour markers dynamically (every 2-3 hours depending on range)
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
                <span className="timeline-title">Today's Focus</span>
                <span className="timeline-stats">
                    <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{tasksAhead}</span> ahead •
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}> {tasksDone}</span> done
                </span>
            </div>

            <div className="timeline-track">
                {/* Base Line with Gradient */}
                <div
                    className="timeline-line"
                    style={{
                        background: `linear-gradient(90deg, 
                            var(--primary) 0%, 
                            var(--primary) ${progressPercentage}%, 
                            var(--border-soft) ${progressPercentage}%, 
                            var(--border-soft) 100%)`
                    }}
                />

                {/* Current Time Indicator */}
                {currentTimePosition >= 0 && currentTimePosition <= 100 && (
                    <div
                        style={{
                            position: 'absolute',
                            left: `${currentTimePosition}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '2px',
                            height: '32px',
                            background: 'var(--danger)',
                            borderRadius: '1px',
                            zIndex: 5,
                            boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '10px',
                            fontWeight: '700',
                            color: 'var(--danger)',
                            whiteSpace: 'nowrap',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Now
                        </div>
                    </div>
                )}

                {/* Hour Markers */}
                {markers.map(h => (
                    <div
                        key={h}
                        className="time-marker"
                        style={{ left: `${((h - startHour) / totalHours) * 100}%` }}
                    >
                        <div className="marker-dot" />
                        <span className="marker-label">
                            {String(h).padStart(2, '0')}:00
                        </span>
                    </div>
                ))}

                {/* Tasks */}
                {todaysTasks.map((task, index) => (
                    <div
                        key={task._id}
                        className={`task-dot priority-${task.priority || 'medium'} ${task.isCompleted ? 'completed' : ''}`}
                        style={{
                            left: `${getPosition(task.dueDate)}%`,
                            animationDelay: `${index * 0.1}s`
                        }}
                        title={`${task.title} (${(() => {
                            const d = new Date(task.dueDate);
                            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                        })()}) - ${(task.priority || 'medium').toUpperCase()} priority`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Timeline;
