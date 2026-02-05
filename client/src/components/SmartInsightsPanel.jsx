import React from 'react';

const SmartInsightsPanel = ({ tasks = [], completedCount = 0, totalCount = 0, onAutoSchedule }) => {
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const pendingCount = totalCount - completedCount;
    const highPriorityCount = tasks.filter(t => t.priority === 'high' && !t.isCompleted).length;

    // Get upcoming deadlines
    const getUpcomingDeadlines = () => {
        const now = new Date();
        const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        return tasks
            .filter(t => !t.isCompleted && t.dueDate)
            .filter(t => {
                const dueDate = new Date(t.dueDate);
                return dueDate >= now && dueDate <= weekAhead;
            })
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);
    };

    const formatDeadline = (dueDate) => {
        const date = new Date(dueDate);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'TODAY';
        if (diffDays === 1) return 'TOMORROW';
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
    };

    const upcomingDeadlines = getUpcomingDeadlines();

    return (
        <section className="insights-section">
            <h2 className="insights-title">Insights</h2>

            {/* Main Stats */}
            <div className="stat-grid">
                <div className="stat-block">
                    <span className="stat-value">{progress}%</span>
                    <span className="stat-label">COMPLETION RATE</span>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="stat-row">
                    <div className="stat-item">
                        <span className="stat-number">{pendingCount}</span>
                        <span className="stat-label">PENDING</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number urgent">{highPriorityCount}</span>
                        <span className="stat-label">URGENT</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{completedCount}</span>
                        <span className="stat-label">DONE</span>
                    </div>
                </div>
            </div>

            {/* Upcoming Deadlines */}
            {upcomingDeadlines.length > 0 && (
                <div className="deadlines-section">
                    <h3 className="section-title">UPCOMING DEADLINES</h3>
                    <div className="deadlines-list">
                        {upcomingDeadlines.map((task, i) => (
                            <div key={task._id || i} className="deadline-row">
                                <span className="deadline-title">{task.title}</span>
                                <span className="deadline-date">{formatDeadline(task.dueDate)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Tip / Proactive Scheduler */}
            {(() => {
                // Check if we have unscheduled tasks but no schedule for today
                const todaysSchedule = tasks.filter(t => {
                    if (!t.dueDate) return false;
                    const d = new Date(t.dueDate);
                    const now = new Date();
                    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
                });

                const hasUnscheduled = tasks.some(t => !t.isCompleted && (!t.dueDate || !t.dueDate.includes('T')));

                if (todaysSchedule.length === 0 && hasUnscheduled) {
                    return (
                        <div className="ai-insight slide-in" style={{ marginTop: 'var(--space-6)', border: '1px solid var(--color-ai)', background: 'rgba(255, 107, 0, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span className="ai-label">KaryaAI:</span>
                                    <span className="ai-message" style={{ display: 'block', marginTop: '4px' }}>
                                        Your execution timeline is empty, but you have tasks. Shall I build a schedule for you?
                                    </span>
                                </div>
                                <button
                                    className="ai-action-btn"
                                    onClick={onAutoSchedule}
                                    style={{
                                        background: 'var(--color-ai)', color: '#fff', border: 'none',
                                        padding: '6px 12px', borderRadius: '6px', fontSize: '11px',
                                        cursor: 'pointer', fontWeight: '600'
                                    }}
                                >
                                    PLAN DAY
                                </button>
                            </div>
                        </div>
                    );
                }

                // Fallback to urgent tip
                if (highPriorityCount > 0) {
                    return (
                        <div className="ai-insight slide-in" style={{ marginTop: 'var(--space-6)' }}>
                            <span className="ai-label">AI:</span>
                            <span className="ai-message">
                                Focus on {highPriorityCount} urgent task{highPriorityCount > 1 ? 's' : ''} first.
                            </span>
                        </div>
                    );
                }
                return null;
            })()}

            {/* Focus Time Recommendations */}
            {(() => {
                // Analyze completed task timestamps to find productive hours
                const completedTasks = tasks.filter(t => t.isCompleted && t.updatedAt);

                if (completedTasks.length < 3) return null;

                const hourCounts = {};
                completedTasks.forEach(t => {
                    const hour = new Date(t.updatedAt).getHours();
                    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
                });

                // Find peak hour
                const peakHour = Object.entries(hourCounts)
                    .sort(([, a], [, b]) => b - a)[0];

                if (!peakHour) return null;

                const formatHour = (h) => {
                    const hour = parseInt(h);
                    if (hour === 0) return '12 AM';
                    if (hour < 12) return `${hour} AM`;
                    if (hour === 12) return '12 PM';
                    return `${hour - 12} PM`;
                };

                const peakHourStr = formatHour(peakHour[0]);
                const nextHourStr = formatHour((parseInt(peakHour[0]) + 1) % 24);

                return (
                    <div className="focus-time-section" style={{ marginTop: 'var(--space-6)' }}>
                        <h3 className="section-title">PEAK PRODUCTIVITY</h3>
                        <div className="ai-insight slide-in">
                            <span className="ai-label">AI:</span>
                            <span className="ai-message">
                                You complete {Math.round((peakHour[1] / completedTasks.length) * 100)}% of tasks between {peakHourStr}-{nextHourStr}. Schedule important work then.
                            </span>
                        </div>
                    </div>
                );
            })()}
        </section>
    );
};

export default SmartInsightsPanel;
