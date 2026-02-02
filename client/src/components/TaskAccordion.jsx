import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaChevronDown, FaTrash, FaGripVertical, FaTerminal } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

const TaskAccordion = ({ task, viewMode = 'focus', onUpdate, onDelete, headers, onDragStart, onDragOver, onDrop, isDragging, isDragOver }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localNotes, setLocalNotes] = useState(task.notes || '');
    const [localSubtasks, setLocalSubtasks] = useState(task.subtasks || []);
    const [newSubtask, setNewSubtask] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [nlpCommand, setNlpCommand] = useState('');
    const [nlpMessage, setNlpMessage] = useState('');
    const [isNlpLoading, setIsNlpLoading] = useState(false);
    const [showNlpInput, setShowNlpInput] = useState(false);

    useEffect(() => {
        setLocalSubtasks(task.subtasks || []);
    }, [task.subtasks]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (localNotes !== task.notes) {
                saveChanges({ notes: localNotes });
            }
        }, 1000);
        return () => clearTimeout(timeout);
    }, [localNotes]);

    const saveChanges = (updates) => {
        axios.put(`http://localhost:5000/api/tasks/${task._id}`, updates, { headers })
            .then(res => onUpdate(res.data))
            .catch(err => console.error('Error saving task:', err));
    };

    const toggleComplete = (e) => {
        e.stopPropagation();
        saveChanges({ isCompleted: !task.isCompleted });
    };

    const toggleSubtask = (index) => {
        const updated = localSubtasks.map((st, i) =>
            i === index ? { ...st, isCompleted: !st.isCompleted } : st
        );
        setLocalSubtasks(updated);
        saveChanges({ subtasks: updated });
    };

    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        const updated = [...localSubtasks, { title: newSubtask, isCompleted: false }];
        setLocalSubtasks(updated);
        setNewSubtask('');
        saveChanges({ subtasks: updated });
    };

    // AI Breakdown
    const handleAIBreakdown = async (e) => {
        e.stopPropagation();
        if (isGenerating) return;

        setIsGenerating(true);
        setIsExpanded(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/ai/breakdown/${task._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token }
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.done) {
                                const res = await axios.get('http://localhost:5000/api/tasks', { headers });
                                const refreshed = res.data.find(t => t._id === task._id);
                                if (refreshed) onUpdate(refreshed);
                                setIsGenerating(false);
                            }
                        } catch (e) { }
                    }
                }
            }
        } catch (err) {
            console.error('AI Error:', err);
            setIsGenerating(false);
        }
    };

    // Natural Language Command Handler
    const [isFadingOut, setIsFadingOut] = useState(false);

    const handleNlpCommand = async (e) => {
        e.preventDefault();
        if (!nlpCommand.trim() || isNlpLoading) return;

        setIsNlpLoading(true);
        setNlpMessage('');
        setIsFadingOut(false);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/ai/nlp',
                { taskId: task._id, command: nlpCommand },
                { headers: { 'x-auth-token': token } }
            );

            if (response.data.success) {
                setNlpMessage(response.data.message);
                onUpdate(response.data.task);
                setNlpCommand('');

                // Keep message visible for 3 seconds, then fade out
                setTimeout(() => {
                    setIsFadingOut(true);
                }, 3000);

                // After fade animation, hide and close
                setTimeout(() => {
                    setNlpMessage('');
                    setShowNlpInput(false);
                    setIsFadingOut(false);
                }, 3500);
            }
        } catch (err) {
            setNlpMessage('Failed to process command');
            console.error('NLP Error:', err);
        } finally {
            setIsNlpLoading(false);
        }
    };

    const formatDueDate = (dueDate) => {
        if (!dueDate) return null;
        const date = new Date(dueDate);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase();
    };

    const isOverdue = !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date();
    const completedSubtasks = localSubtasks.filter(st => st.isCompleted).length;

    return (
        <div
            className={`task-row ${task.isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            {/* Main Row */}
            <div className="task-row-main" onClick={() => setIsExpanded(!isExpanded)}>
                {/* Drag Handle */}
                <div className="drag-handle" onMouseDown={e => e.stopPropagation()}>
                    <FaGripVertical />
                </div>

                {/* Checkbox */}
                <button
                    className={`task-checkbox ${task.isCompleted ? 'checked' : ''}`}
                    onClick={toggleComplete}
                    aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                >
                    {task.isCompleted && <FaCheck size={10} />}
                </button>

                {/* Title */}
                <span className={`task-title ${task.isCompleted ? 'done' : ''}`}>
                    {task.title}
                </span>

                {/* Meta */}
                <div className="task-meta">
                    {localSubtasks.length > 0 && (
                        <span className="meta-subtasks">
                            {completedSubtasks}/{localSubtasks.length}
                        </span>
                    )}

                    {task.dueDate && (
                        <span className={`meta-due ${isOverdue ? 'overdue' : ''}`}>
                            {formatDueDate(task.dueDate)}
                        </span>
                    )}

                    <span className={`meta-priority priority-${task.priority}`}>
                        {task.priority.toUpperCase()}
                    </span>
                </div>

                {/* Actions */}
                <div className="task-actions">
                    {/* NLP Command Button */}
                    <button
                        className={`action-btn nlp ${showNlpInput ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setShowNlpInput(!showNlpInput); }}
                        title="AI Command (e.g., 'move to tomorrow')"
                    >
                        <FaTerminal size={12} />
                    </button>

                    {!task.isCompleted && (
                        <button
                            className={`action-btn ai ${isGenerating ? 'loading' : ''}`}
                            onClick={handleAIBreakdown}
                            disabled={isGenerating}
                            title="AI Breakdown"
                        >
                            <HiSparkles size={14} />
                        </button>
                    )}

                    <button
                        className="action-btn expand"
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    >
                        <FaChevronDown size={12} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
                    </button>

                    <button
                        className="action-btn delete"
                        onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
                    >
                        <FaTrash size={12} />
                    </button>
                </div>
            </div>

            {/* NLP Command Input */}
            {showNlpInput && (
                <form className="nlp-input-row fade-in" onSubmit={handleNlpCommand}>
                    <input
                        type="text"
                        className="nlp-input"
                        placeholder="Try: 'move to tomorrow', 'high priority', 'add subtask...'"
                        value={nlpCommand}
                        onChange={(e) => setNlpCommand(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="nlp-submit" disabled={isNlpLoading}>
                        {isNlpLoading ? '...' : 'Go'}
                    </button>
                    {nlpMessage && <span className={`nlp-message ${isFadingOut ? 'fading-out' : ''}`}>{nlpMessage}</span>}
                </form>
            )}

            {/* Expanded Content */}
            {isExpanded && (
                <div className="task-expanded fade-in">
                    {/* Subtasks */}
                    <div className="subtasks-section">
                        <span className="section-label">SUBTASKS</span>
                        {localSubtasks.map((st, i) => (
                            <div key={i} className="subtask-row">
                                <button
                                    className={`subtask-check ${st.isCompleted ? 'checked' : ''}`}
                                    onClick={() => toggleSubtask(i)}
                                >
                                    {st.isCompleted && <FaCheck size={8} />}
                                </button>
                                <span className={st.isCompleted ? 'done' : ''}>{st.title}</span>
                            </div>
                        ))}

                        {isGenerating && (
                            <div className="generating-indicator">AI generating subtasks...</div>
                        )}

                        <input
                            type="text"
                            className="add-subtask-input"
                            placeholder="+ Add subtask"
                            value={newSubtask}
                            onChange={e => setNewSubtask(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addSubtask()}
                        />
                    </div>

                    {/* Notes */}
                    <div className="notes-section">
                        <span className="section-label">NOTES</span>
                        <textarea
                            className="notes-textarea"
                            placeholder="Add notes..."
                            value={localNotes}
                            onChange={e => setLocalNotes(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskAccordion;
