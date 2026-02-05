import React from 'react';
import { FaBell, FaCloudSun, FaBullseye } from 'react-icons/fa';
import './FocusBar.css';

const FocusBar = ({ user, taskCount, tasks = [], isFocusMode, onToggleFocus }) => {
    const [aiSuggestion, setAiSuggestion] = React.useState('');
    const [typewriterText, setTypewriterText] = React.useState('');

    React.useEffect(() => {
        // Simple AI Logic: Find first high priority task or just first task
        const urgentTask = tasks.find(t => t.priority === 'high' && !t.isCompleted);
        const nextTask = tasks.find(t => !t.isCompleted);

        let suggestion = "Review your schedule for the day.";
        if (urgentTask) {
            suggestion = `Tackle '${urgentTask.title}' first.`;
        } else if (nextTask) {
            suggestion = `Start with '${nextTask.title}'.`;
        } else if (tasks.length > 0 && tasks.every(t => t.isCompleted)) {
            suggestion = "Great job! You've completed everything.";
        }

        setAiSuggestion(suggestion);
        setTypewriterText('');
    }, [tasks]);

    // Typewriter effect
    React.useEffect(() => {
        if (!aiSuggestion) return;

        // Reset
        let i = 0;
        const speed = 40;
        setTypewriterText('');

        const interval = setInterval(() => {
            setTypewriterText(aiSuggestion.slice(0, i + 1));
            i++;
            if (i >= aiSuggestion.length) clearInterval(interval);
        }, speed);

        return () => clearInterval(interval);
    }, [aiSuggestion]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="focus-bar">
            <div className="focus-left">
                <h2 className="focus-greeting">{getGreeting()}, {user?.name || 'Bibek'}.</h2>
                <div className="focus-ai-row">
                    <span className="ai-label">AI SUGGESTS</span>
                    <span className="ai-suggestion-text">{typewriterText}<span className="cursor-blink">|</span></span>
                </div>
            </div>

            <div className="focus-right">
                <div className="weather-widget">
                    <FaCloudSun size={16} />
                    <span>72°F</span>
                </div>

                <div className="focus-actions">
                    <button
                        className={`icon-btn focus-toggle ${isFocusMode ? 'active' : ''}`}
                        onClick={onToggleFocus}
                        title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                        aria-label="Toggle Focus Mode"
                    >
                        <FaBullseye size={16} />
                    </button>

                    <button className="icon-btn" aria-label="Notifications">
                        <FaBell size={16} />
                    </button>

                    <div className="user-profile-mini">
                        {user?.name ? user.name[0].toUpperCase() : 'B'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FocusBar;
