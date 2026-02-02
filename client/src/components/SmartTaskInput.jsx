import React, { useState, useMemo } from 'react';
import * as chrono from 'chrono-node';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

const SmartTaskInput = ({ onAddTask, getLocalDateString, tasks = [] }) => {
    const [inputValue, setInputValue] = useState('');
    const [priority, setPriority] = useState('medium');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [manualDate, setManualDate] = useState('');
    const [manualTime, setManualTime] = useState('');

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
        // Don't parse if manual date is set
        if (manualDate) return null;
        const results = chrono.parse(inputValue, new Date(), { forwardDate: true });
        if (results.length === 0) return null;
        const result = results[0];
        return {
            date: result.start.date(),
            matchedText: result.text,
            matchIndex: result.index
        };
    }, [inputValue, manualDate]);

    const getDateLabel = () => {
        // If manual date is set, show that
        if (manualDate) {
            const date = new Date(manualDate + (manualTime ? `T${manualTime}` : 'T00:00'));
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const isToday = date.toDateString() === today.toDateString();
            const isTomorrow = date.toDateString() === tomorrow.toDateString();
            const time = manualTime || '';

            if (isToday) return `TODAY ${time}`;
            if (isTomorrow) return `TOMORROW ${time}`;
            return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase() + (time ? ` ${time}` : '');
        }

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

    const [dateError, setDateError] = useState(false);

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        let taskTitle = inputValue;
        let taskDate = null;
        let taskTime = null;

        // Use manual date/time if set
        if (manualDate) {
            taskDate = manualDate;
            taskTime = manualTime || null;
        } else if (parsedResult) {
            taskTitle = inputValue.replace(parsedResult.matchedText, '').trim();
            taskTitle = taskTitle.replace(/\s+(at|on|by|for)\s*$/i, '').trim();
            if (!taskTitle) taskTitle = inputValue;

            const d = parsedResult.date;
            taskDate = d.toISOString().split('T')[0];
            taskTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }

        // Require date/time
        if (!taskDate) {
            setDateError(true);
            setShowDatePicker(true);
            setTimeout(() => setDateError(false), 1000);
            return;
        }

        onAddTask({
            title: taskTitle,
            priority,
            dueDate: taskDate,
            dueTime: taskTime
        });

        setInputValue('');
        setPriority('medium');
        setManualDate('');
        setManualTime('');
        setShowDatePicker(false);
    };

    const clearManualDateTime = () => {
        setManualDate('');
        setManualTime('');
        setShowDatePicker(false);
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

                {/* Date/Time Toggle Button */}
                <button
                    type="button"
                    className={`date-toggle-btn ${showDatePicker || manualDate ? 'active' : ''}`}
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    title="Set date & time"
                >
                    <FaCalendarAlt size={14} />
                </button>

                <button type="submit" className="task-submit" aria-label="Add task">
                    +
                </button>
            </div>

            {/* Manual Date/Time Picker */}
            {showDatePicker && (
                <div className={`datetime-picker-row ${dateError ? 'error' : ''}`}>
                    <div className="datetime-field">
                        <FaCalendarAlt size={12} />
                        <input
                            type="date"
                            className="datetime-input"
                            value={manualDate}
                            onChange={e => setManualDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className="datetime-field">
                        <FaClock size={12} />
                        <input
                            type="time"
                            className="datetime-input"
                            value={manualTime}
                            onChange={e => setManualTime(e.target.value)}
                        />
                    </div>
                    {(manualDate || manualTime) && (
                        <button
                            type="button"
                            className="datetime-clear"
                            onClick={clearManualDateTime}
                        >
                            Clear
                        </button>
                    )}
                </div>
            )}

            {inputValue && (
                <div className="task-input-meta">
                    {(parsedResult || manualDate) && (
                        <span className="detected-date">
                            {getDateLabel()}
                        </span>
                    )}

                    {/* AI Scheduling Suggestion */}
                    {aiSuggestion && !parsedResult && !manualDate && (
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
