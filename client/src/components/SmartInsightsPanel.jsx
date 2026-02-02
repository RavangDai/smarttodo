import React from 'react';
import { FaClock, FaFire, FaBrain } from 'react-icons/fa';
import './SmartInsightsPanel.css';

const SmartInsightsPanel = ({ tasks = [], completedCount = 0, totalCount = 0 }) => {
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Get upcoming deadlines (next 7 days, not completed)
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
            .slice(0, 3);
    };

    const formatDeadline = (dueDate) => {
        const date = new Date(dueDate);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const upcomingDeadlines = getUpcomingDeadlines();
    const highPriorityCount = tasks.filter(t => t.priority === 'high' && !t.isCompleted).length;

    // Calculate stroke dasharray for progress ring
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <aside className="smart-insights-panel">
            {/* Smart Insights Header */}
            <div className="insights-header">
                <FaBrain className="insights-icon" />
                <h3>Smart Insights</h3>
            </div>

            {/* Progress Ring */}
            <div className="insights-progress">
                <div className="progress-ring-container">
                    <svg className="progress-ring" viewBox="0 0 100 100">
                        <circle
                            className="progress-ring-bg"
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            strokeWidth="8"
                        />
                        <circle
                            className="progress-ring-fill"
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="progress-ring-text">
                        <span className="progress-value">{progress}%</span>
                    </div>
                </div>
                <p className="progress-label">
                    Progress: {completedCount}/{totalCount} Tasks Completed
                </p>
            </div>

            {/* Upcoming Deadlines */}
            <div className="insights-section">
                <div className="section-header">
                    <FaClock className="section-icon" />
                    <h4>Upcoming Deadlines</h4>
                </div>
                {upcomingDeadlines.length > 0 ? (
                    <div className="deadlines-list">
                        {upcomingDeadlines.map((task, i) => (
                            <div key={task._id || i} className="deadline-item">
                                <span className="deadline-title">{task.title}</span>
                                <span className="deadline-date">{formatDeadline(task.dueDate)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-deadlines">No upcoming deadlines</p>
                )}
            </div>

            {/* Focus Stats */}
            <div className="insights-section">
                <div className="section-header">
                    <FaFire className="section-icon urgent" />
                    <h4>Focus Stats</h4>
                </div>
                <div className="focus-stats">
                    <div className="stat-item">
                        <span className="stat-number urgent">{highPriorityCount}</span>
                        <span className="stat-label">Urgent Tasks</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{tasks.filter(t => !t.isCompleted).length}</span>
                        <span className="stat-label">Remaining</span>
                    </div>
                </div>
            </div>

            {/* Focus Mode Toggle */}
            <div className="focus-mode-section">
                <span className="focus-label">Focus Mode</span>
                <div className="focus-toggle">
                    <div className="toggle-track">
                        <div className="toggle-thumb"></div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SmartInsightsPanel;
