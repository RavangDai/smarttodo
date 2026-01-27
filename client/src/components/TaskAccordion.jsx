import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaChevronDown, FaChevronRight, FaCheck, FaTrash, FaPlus } from 'react-icons/fa';

const TaskAccordion = ({ task, onUpdate, onDelete, headers }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localNotes, setLocalNotes] = useState(task.notes || "");
    const [localSubtasks, setLocalSubtasks] = useState(task.subtasks || []);
    const [newSubtask, setNewSubtask] = useState("");

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

    return (
        <div className={`accordion-card ${isExpanded ? 'expanded' : ''}`}>
            {/* Header Row */}
            <div className="accordion-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="accordion-left">
                    <button className="expand-icon">
                        {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                    </button>

                    <button
                        className={`check-circle ${task.isCompleted ? 'checked' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskCompletion(e);
                        }}
                        style={{ zIndex: 10, position: 'relative' }}
                    >
                        {task.isCompleted && <FaCheck size={10} />}
                    </button>

                    <span className={`task-title ${task.isCompleted ? 'completed' : ''}`}>
                        {task.title}
                    </span>
                </div>

                <div className="accordion-right">
                    {task.priority !== 'medium' && (
                        <span className={`meta-priority priority-${task.priority}`}>{task.priority}</span>
                    )}
                    <button className="delete-action" onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}>
                        <FaTrash size={12} />
                    </button>
                </div>
            </div>

            {/* Expanded Content */}
            <div className="accordion-content" style={{ maxHeight: isExpanded ? '500px' : '0' }}>
                <div className="accordion-inner">

                    {/* Subtasks */}
                    <div className="subtasks-section">
                        <div className="section-label">Subtasks</div>
                        {localSubtasks.map((st, i) => (
                            <div key={i} className="subtask-row">
                                <input
                                    type="checkbox"
                                    checked={st.isCompleted}
                                    onChange={() => toggleSubtask(i)}
                                    className="subtask-checkbox"
                                />
                                <span className={st.isCompleted ? 'completed' : ''}>{st.title}</span>
                            </div>
                        ))}
                        <div className="add-subtask-row">
                            <FaPlus size={10} className="plus-icon" />
                            <input
                                placeholder="Add a subtask..."
                                value={newSubtask}
                                onChange={e => setNewSubtask(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addSubtask()}
                            />
                        </div>
                    </div>

                    {/* Notes */}
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
