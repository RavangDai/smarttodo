import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronDown, FaChevronRight, FaCheck, FaTrash, FaPlus, FaClock, FaMagic, FaBell, FaInfoCircle, FaFlag } from 'react-icons/fa';

const TaskAccordion = ({ task, viewMode = 'focus', onUpdate, onDelete, headers }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localNotes, setLocalNotes] = useState(task.notes || "");
    const [localSubtasks, setLocalSubtasks] = useState(task.subtasks || []);
    const [newSubtask, setNewSubtask] = useState("");

    // AI Breakdown States
    const [isGenerating, setIsGenerating] = useState(false);
    const [streamingSubtasks, setStreamingSubtasks] = useState([]);

    // Sync subtasks when task prop changes
    useEffect(() => {
        setLocalSubtasks(task.subtasks || []);
    }, [task.subtasks]);

    // Debounce saving notes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (localNotes !== task.notes) {
                saveChanges({ notes: localNotes });
            }
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [localNotes]);

    const saveChanges = (updates) => {
        axios.put(`http://localhost:5000/api/tasks/${task._id}`, updates, { headers })
            .then(res => onUpdate(res.data))
            .catch(err => {
                console.error("Error saving task:", err);
                alert("Failed to update task. Please check connection.");
            });
    };

    const toggleTaskCompletion = (e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        saveChanges({ isCompleted: !task.isCompleted });
    };

    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        const updatedSubtasks = [...localSubtasks, { title: newSubtask, isCompleted: false }];
        setLocalSubtasks(updatedSubtasks);
        setNewSubtask("");
        saveChanges({ subtasks: updatedSubtasks });
    };

    const toggleSubtask = (index) => {
        const updatedSubtasks = localSubtasks.map((st, i) =>
            i === index ? { ...st, isCompleted: !st.isCompleted } : st
        );
        setLocalSubtasks(updatedSubtasks);
        saveChanges({ subtasks: updatedSubtasks });
    };

    // AI Task Breakdown with Streaming
    const handleAIBreakdown = async (e) => {
        e.stopPropagation();

        if (isGenerating) return;

        setIsGenerating(true);
        setStreamingSubtasks([]);
        setIsExpanded(true);

        try {
            const token = localStorage.getItem('token');
            const eventSource = new EventSource(
                `http://localhost:5000/api/ai/breakdown/${task._id}?token=${token}`
            );

            // Since EventSource doesn't support custom headers, we'll use fetch with streaming
            const response = await fetch(`http://localhost:5000/api/ai/breakdown/${task._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Parse SSE data
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.done) {
                                // Fetch updated task
                                const updatedTask = await axios.get(
                                    `http://localhost:5000/api/tasks`,
                                    { headers }
                                );
                                const refreshedTask = updatedTask.data.find(t => t._id === task._id);
                                if (refreshedTask) {
                                    onUpdate(refreshedTask);
                                }
                                setIsGenerating(false);
                                setStreamingSubtasks([]);
                            } else if (data.error) {
                                console.error('AI Error:', data.error);
                                alert(`AI Error: ${data.error}`);
                                setIsGenerating(false);
                            } else if (data.title) {
                                // Add new subtask with animation
                                setStreamingSubtasks(prev => [...prev, data]);
                            }
                        } catch (parseErr) {
                            console.log('Parse error, continuing...', parseErr);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('AI Breakdown Error:', err);
            alert('Failed to connect to AI service. Check your server.');
            setIsGenerating(false);
        }
    };

    // Priority colors
    const priorityStyles = {
        high: { borderColor: 'var(--priority-high)', indicatorBg: 'var(--priority-high)' },
        medium: { borderColor: 'var(--priority-medium)', indicatorBg: 'var(--priority-medium)' },
        low: { borderColor: 'var(--priority-low)', indicatorBg: 'var(--priority-low)' }
    };

    const style = priorityStyles[task.priority] || priorityStyles.medium;

    // Format due date
    const formatDueDate = (dueDate) => {
        if (!dueDate) return null;
        const date = new Date(dueDate);
        const today = new Date();
        const isToday = date.toLocaleDateString() === today.toLocaleDateString();

        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const completedSubtasks = localSubtasks.filter(st => st.isCompleted).length;
    const totalSubtasks = localSubtasks.length;

    const isOverdue = !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

    const getStatusIcon = () => {
        if (isOverdue) return <FaBell className="danger" />;
        if (task.priority === 'high') return <FaBell className="danger" />;
        if (task.priority === 'medium') return <FaFlag className="warning" />;
        if (task.priority === 'low') return <FaInfoCircle className="success" />;
        return <FaBell />;
    };

    // COMPACT VIEW
    if (viewMode === 'compact') {
        return (
            <div
                className={`accordion-card compact ${task.isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} priority-${task.priority}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="compact-row">
                    <button
                        className={`check-circle compact ${task.isCompleted ? 'checked' : ''}`}
                        onClick={toggleTaskCompletion}
                        aria-label={task.isCompleted ? "Mark as incomplete" : "Mark as complete"}
                    >
                        {task.isCompleted && <FaCheck size={8} />}
                    </button>

                    <span className={`task-title compact ${task.isCompleted ? 'completed' : ''}`}>
                        {task.title}
                    </span>

                    {task.dueDate && (
                        <span className="compact-due">
                            <FaClock size={10} />
                            {formatDueDate(task.dueDate)}
                        </span>
                    )}

                    {totalSubtasks > 0 && (
                        <span className="compact-subtasks">
                            {completedSubtasks}/{totalSubtasks}
                        </span>
                    )}

                    <span className={`compact-priority priority-${task.priority}`}>
                        {task.priority.charAt(0).toUpperCase()}
                    </span>

                    <button
                        className="delete-action compact"
                        onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
                        aria-label="Delete task"
                    >
                        <FaTrash size={10} />
                    </button>
                </div>
            </div>
        );
    }

    // FOCUS VIEW (Original)
    return (
        <div
            className={`accordion-card ${isExpanded ? 'expanded' : ''} ${isOverdue ? 'overdue' : ''} priority-${task.priority}`}
        >
            {/* Header Row */}
            <div className="accordion-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="accordion-left">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className={`task-status-icon ${isOverdue || task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'success'}`}>
                                {getStatusIcon()}
                            </div>
                            <span className={`task-title ${task.isCompleted ? 'completed' : ''}`}>
                                {task.title}
                            </span>
                            {isOverdue && <span className="meta-overdue">OVERDUE</span>}
                        </div>
                        {(task.dueDate || totalSubtasks > 0) && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: '11px',
                                color: 'var(--text-light)',
                                marginLeft: '32px'
                            }}>
                                {task.dueDate && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <FaClock size={10} />
                                        {formatDueDate(task.dueDate)}
                                    </span>
                                )}
                                {totalSubtasks > 0 && (
                                    <span style={{
                                        padding: '2px 6px',
                                        background: completedSubtasks === totalSubtasks ? 'var(--priority-low-bg)' : 'var(--bg-secondary)',
                                        borderRadius: '4px',
                                        fontWeight: 600,
                                        color: completedSubtasks === totalSubtasks ? 'var(--success)' : 'var(--text-muted)'
                                    }}>
                                        {completedSubtasks}/{totalSubtasks}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="accordion-right">
                    {/* Completion Toggle moved to right for cleaner left side */}
                    <button
                        className={`check-circle ${task.isCompleted ? 'checked' : ''}`}
                        onClick={toggleTaskCompletion}
                        aria-label={task.isCompleted ? "Mark as incomplete" : "Mark as complete"}
                    >
                        {task.isCompleted && <FaCheck size={10} />}
                    </button>

                    {/* AI Breakdown Button */}
                    {!task.isCompleted && localSubtasks.length === 0 && (
                        <button
                            className={`ai-breakdown-btn ${isGenerating ? 'generating' : ''}`}
                            onClick={handleAIBreakdown}
                            disabled={isGenerating}
                            title="Break down with AI"
                        >
                            <FaMagic size={12} />
                            <span>{isGenerating ? 'Generating...' : 'AI Breakdown'}</span>
                        </button>
                    )}

                    {/* Priority Badge */}
                    <span className={`meta-priority priority-${task.priority}`}>
                        {task.priority.toUpperCase()}
                    </span>

                    <button
                        className="expand-icon"
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                        aria-label="Expand task"
                    >
                        {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                    </button>

                    <button
                        className="delete-action"
                        onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
                        aria-label="Delete task"
                    >
                        <FaTrash size={12} />
                    </button>
                </div>
            </div>

            {/* Expanded Content */}
            <div className="accordion-content" style={{ maxHeight: isExpanded ? '600px' : '0' }}>
                <div className="accordion-inner">
                    {/* Subtasks Section */}
                    <div className="subtasks-section">
                        <div className="section-label">
                            Subtasks
                            {totalSubtasks > 0 && (
                                <span style={{
                                    marginLeft: '8px',
                                    color: completedSubtasks === totalSubtasks ? 'var(--success)' : 'var(--text-light)',
                                    fontWeight: 600
                                }}>
                                    ({completedSubtasks}/{totalSubtasks})
                                </span>
                            )}
                        </div>

                        {/* Streaming Subtasks (AI Generated - animated) */}
                        {streamingSubtasks.map((st, i) => (
                            <div
                                key={`streaming-${i}`}
                                className="subtask-row ai-generated"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className="ai-indicator" title="AI Generated">🤖</div>
                                <span className="subtask-text">{st.title}</span>
                                <span className="time-estimate">{st.estimatedTime}</span>
                            </div>
                        ))}

                        {/* Existing Subtasks */}
                        {localSubtasks.map((st, i) => (
                            <div key={i} className="subtask-row">
                                <input
                                    type="checkbox"
                                    checked={st.isCompleted}
                                    onChange={() => toggleSubtask(i)}
                                    className="subtask-checkbox"
                                    aria-label={`Toggle subtask: ${st.title}`}
                                />
                                <span className={st.isCompleted ? 'completed' : ''}>{st.title}</span>
                            </div>
                        ))}

                        {/* AI Generating Indicator */}
                        {isGenerating && (
                            <div className="ai-generating-indicator">
                                <div className="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span>AI is thinking...</span>
                            </div>
                        )}

                        {/* Add Subtask Row */}
                        {!isGenerating && (
                            <div className="add-subtask-row">
                                <FaPlus size={10} className="plus-icon" />
                                <input
                                    placeholder="Add a subtask..."
                                    value={newSubtask}
                                    onChange={e => setNewSubtask(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addSubtask()}
                                />
                            </div>
                        )}
                    </div>

                    {/* Notes Section */}
                    <div className="notes-section">
                        <div className="section-label">Notes</div>
                        <textarea
                            className="notes-input"
                            placeholder="Add details, links, or thoughts..."
                            value={localNotes}
                            onChange={e => setLocalNotes(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskAccordion;
