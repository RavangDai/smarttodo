import React, { useState, useMemo } from 'react';
import * as chrono from 'chrono-node';

const SmartTaskInput = ({ onAddTask, getLocalDateString, tasks = [] }) => {
    const [inputValue, setInputValue] = useState('');
    const [priority, setPriority] = useState('medium');

    // Smart scheduling: suggest optimal time based on workload
    const aiSuggestion = useMemo(() => {
        if (!inputValue.trim() || inputValue.length < 5) return null;

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Count tasks for today
        const todayStr = today.toISOString().split('T')[0];
        const tasksToday = tasks.filter(t => {
            if (t.isCompleted) return false;
            if (!t.dueDate) return false;
            return t.dueDate.split('T')[0] === todayStr;
        }).length;

        // If user has 3+ tasks today, suggest tomorrow at 10am
        if (tasksToday >= 3) {
            const suggestedTime = new Date(tomorrow);
            suggestedTime.setHours(10, 0, 0, 0);
            return {
                label: 'AI: Tomorrow 10 AM',
                date: suggestedTime,
                reason: `${tasksToday} tasks today`
            };
        }

        return null;
    }, [inputValue, tasks]);

    // Parse natural language dates
    const parsedResult = useMemo(() => {
        if (!inputValue.trim()) return null;
        const results = chrono.parse(inputValue, new Date(), { forwardDate: true });
        if (results.length === 0) return null;
        const result = results[0];
        return {
            date: result.start.date(),
            matchedText: result.text,
            matchIndex: result.index
        };
    }, [inputValue]);

    const getDateLabel = () => {
        if (!parsedResult) return null;
        const date = parsedResult.date;
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        if (isToday) return `TODAY ${time}`;
        if (isTomorrow) return `TOMORROW ${time}`;
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        let taskTitle = inputValue;
        let taskDate = null;
        let taskTime = null;

        if (parsedResult) {
            taskTitle = inputValue.replace(parsedResult.matchedText, '').trim();
            taskTitle = taskTitle.replace(/\s+(at|on|by|for)\s*$/i, '').trim();
            if (!taskTitle) taskTitle = inputValue;

            const d = parsedResult.date;
            taskDate = d.toISOString().split('T')[0];
            taskTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }

        onAddTask({
            title: taskTitle,
            priority,
            dueDate: taskDate,
            dueTime: taskTime
        });

        setInputValue('');
        setPriority('medium');
    };

    return (
        <form className="task-input-container" onSubmit={handleSubmit}>
            <div className="task-input-row">
                <input
                    type="text"
                    className="task-input"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Add a task... try 'Meeting tomorrow at 3pm'"
                    autoComplete="off"
                />
                <button type="submit" className="task-submit" aria-label="Add task">
                    +
                </button>
            </div>

            {inputValue && (
                <div className="task-input-meta">
                    {parsedResult && (
                        <span className="detected-date">
                            {getDateLabel()}
                        </span>
                    )}

                    {/* AI Scheduling Suggestion */}
                    {aiSuggestion && !parsedResult && (
                        <button
                            type="button"
                            className="ai-suggestion-badge"
                            onClick={() => {
                                const d = aiSuggestion.date;
                                const dateStr = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
                                setInputValue(prev => `${prev} tomorrow at 10am`);
                            }}
                            title={aiSuggestion.reason}
                        >
                            {aiSuggestion.label}
                        </button>
                    )}

                    <div className="priority-selector">
                        {['high', 'medium', 'low'].map(p => (
                            <button
                                key={p}
                                type="button"
                                className={`priority-option ${priority === p ? 'active' : ''} priority-${p}`}
                                onClick={() => setPriority(p)}
                            >
                                {p.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </form>
    );
};

export default SmartTaskInput;
