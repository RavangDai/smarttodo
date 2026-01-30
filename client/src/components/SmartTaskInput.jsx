import React, { useState, useMemo } from 'react';
import * as chrono from 'chrono-node';
import { FaPlus, FaSlidersH, FaCalendarAlt, FaClock, FaTimes } from 'react-icons/fa';

const SmartTaskInput = ({ onAddTask, getLocalDateString }) => {
    const [inputValue, setInputValue] = useState('');
    const [showManualControls, setShowManualControls] = useState(false);
    const [manualPriority, setManualPriority] = useState('medium');
    const [manualDate, setManualDate] = useState('');
    const [manualTime, setManualTime] = useState('');

    // Parse natural language from input
    const parsedResult = useMemo(() => {
        if (!inputValue.trim()) return null;

        const results = chrono.parse(inputValue, new Date(), { forwardDate: true });
        if (results.length === 0) return null;

        const result = results[0];
        const parsedDate = result.start.date();

        // Extract the matched text positions
        return {
            date: parsedDate,
            matchedText: result.text,
            matchIndex: result.index,
            matchLength: result.text.length
        };
    }, [inputValue]);

    // Format detected date for display
    const getDetectedLabel = () => {
        if (!parsedResult) return null;

        const date = parsedResult.date;
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        if (isToday) return `Today, ${timeStr}`;
        if (isTomorrow) return `Tomorrow, ${timeStr}`;

        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    // Render input with highlighted detected text
    const renderHighlightedInput = () => {
        if (!parsedResult || !inputValue) return null;

        const { matchIndex, matchLength } = parsedResult;
        const before = inputValue.slice(0, matchIndex);
        const matched = inputValue.slice(matchIndex, matchIndex + matchLength);
        const after = inputValue.slice(matchIndex + matchLength);

        return (
            <div className="input-highlight-overlay">
                <span>{before}</span>
                <span className="highlight-detected">{matched}</span>
                <span>{after}</span>
            </div>
        );
    };

    // Handle task submission
    const handleSubmit = () => {
        if (!inputValue.trim()) return;

        let taskTitle = inputValue;
        let taskDate = null;
        let taskTime = null;

        // Use parsed NLP result if available
        if (parsedResult) {
            // Remove the detected date/time text from title
            taskTitle = inputValue.replace(parsedResult.matchedText, '').trim();
            // Clean up any leftover prepositions
            taskTitle = taskTitle.replace(/\s+(at|on|by|for|tomorrow|today)\s*$/i, '').trim();
            taskTitle = taskTitle.replace(/^\s*(at|on|by|for)\s+/i, '').trim();

            if (!taskTitle) taskTitle = inputValue; // Fallback if title becomes empty

            const d = parsedResult.date;
            taskDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            taskTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        } else if (manualDate) {
            // Fall back to manual controls
            taskDate = manualDate;
            taskTime = manualTime;
        }

        // Call parent's add task function
        onAddTask({
            title: taskTitle,
            priority: manualPriority,
            dueDate: taskDate,
            dueTime: taskTime
        });

        // Reset form
        setInputValue('');
        setManualDate('');
        setManualTime('');
        setManualPriority('medium');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    const today = getLocalDateString ? getLocalDateString(new Date()) : new Date().toISOString().split('T')[0];
    const tomorrow = getLocalDateString
        ? getLocalDateString(new Date(Date.now() + 86400000))
        : new Date(Date.now() + 86400000).toISOString().split('T')[0];

    return (
        <div className="smart-input-card">
            {/* Main Input Area */}
            <div className="smart-input-wrapper">
                <div className="smart-input-container">
                    <input
                        className="smart-main-input"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="What needs to be done? Try 'Gym tomorrow at 5pm'..."
                    />
                    {renderHighlightedInput()}
                </div>

                {/* Toggle for manual controls */}
                <button
                    className={`controls-toggle ${showManualControls ? 'active' : ''}`}
                    onClick={() => setShowManualControls(!showManualControls)}
                    title="Manual date/time controls"
                    type="button"
                >
                    <FaSlidersH />
                </button>
            </div>

            {/* Detected Badge + Add Button Row */}
            <div className="smart-input-actions">
                <div className="detected-area">
                    {parsedResult && (
                        <div className="detected-pill">
                            <FaCalendarAlt className="pill-icon" />
                            <span>Detected: <strong>{getDetectedLabel()}</strong></span>
                            <button
                                className="clear-detection"
                                onClick={() => setInputValue(inputValue.replace(parsedResult.matchedText, '').trim())}
                                title="Clear detected date"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    {/* Priority quick select */}
                    <div className="priority-pills">
                        {['low', 'medium', 'high'].map(p => (
                            <button
                                key={p}
                                className={`priority-pill ${manualPriority === p ? 'active' : ''} priority-${p}`}
                                onClick={() => setManualPriority(p)}
                                type="button"
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={handleSubmit} className="btn-add-task" type="button">
                    <FaPlus /> Add Task
                </button>
            </div>

            {/* Collapsible Manual Controls */}
            <div className={`manual-controls-drawer ${showManualControls ? 'open' : ''}`}>
                <div className="manual-controls-content">
                    <div className="control-group">
                        <label>Date</label>
                        <div className="date-shortcuts">
                            <button
                                type="button"
                                className={`shortcut-btn ${manualDate === today ? 'active' : ''}`}
                                onClick={() => setManualDate(today)}
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                className={`shortcut-btn ${manualDate === tomorrow ? 'active' : ''}`}
                                onClick={() => setManualDate(tomorrow)}
                            >
                                Tomorrow
                            </button>
                            <input
                                type="date"
                                className="date-input"
                                value={manualDate}
                                onChange={e => setManualDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="control-group">
                        <label>Time</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <FaClock style={{ position: 'absolute', left: '10px', pointerEvents: 'none', fontSize: '12px', color: 'var(--text-light)' }} />
                            <input
                                type="time"
                                className="time-input"
                                style={{ paddingLeft: '30px' }}
                                value={manualTime}
                                onChange={e => setManualTime(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartTaskInput;
