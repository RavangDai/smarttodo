import React, { useState } from 'react';
import { FaPlus, FaArrowLeft, FaTrash, FaEdit } from 'react-icons/fa';
import TaskAccordion from './TaskAccordion';
import SmartTaskInput from './SmartTaskInput';
import './ProjectsView.css';

const PROJECT_COLORS = [
    '#ff6b00', '#3b82f6', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4',
];

const PROJECT_ICONS = ['📁', '🚀', '💡', '🎯', '📊', '🔧', '📱', '🎨', '📚', '🏠'];

const ProjectsView = ({
    projects,
    tasks,
    onCreateProject,
    onDeleteProject,
    onUpdateTask,
    onDeleteTask,
    onAddTask,
    getHeaders,
    getLocalDateString,
}) => {
    const [showCreate, setShowCreate] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newColor, setNewColor] = useState(PROJECT_COLORS[0]);
    const [newIcon, setNewIcon] = useState(PROJECT_ICONS[0]);

    const handleCreate = () => {
        if (!newName.trim()) return;
        onCreateProject({
            name: newName.trim(),
            description: newDesc.trim(),
            color: newColor,
            icon: newIcon,
        });
        setNewName('');
        setNewDesc('');
        setNewColor(PROJECT_COLORS[0]);
        setNewIcon(PROJECT_ICONS[0]);
        setShowCreate(false);
    };

    const handleAddTaskToProject = (taskData) => {
        onAddTask({ ...taskData, project: selectedProject._id });
    };

    // ─── DETAIL VIEW ───
    if (selectedProject) {
        const projectTasks = tasks.filter(t => t.project === selectedProject._id);
        const completedCount = projectTasks.filter(t => t.isCompleted).length;

        return (
            <div className="projects-view">
                <div className="project-detail-header">
                    <button className="btn-back" onClick={() => setSelectedProject(null)}>
                        <FaArrowLeft /> Back
                    </button>
                    <div className="project-detail-info">
                        <div className="project-icon" style={{ background: `${selectedProject.color}20` }}>
                            {selectedProject.icon}
                        </div>
                        <h2>{selectedProject.name}</h2>
                    </div>
                    <span className="projects-count">
                        {completedCount}/{projectTasks.length} done
                    </span>
                </div>

                {/* Task input scoped to project */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <SmartTaskInput
                        onAddTask={handleAddTaskToProject}
                        getLocalDateString={getLocalDateString}
                        tasks={projectTasks}
                    />
                </div>

                <div className="project-detail-tasks">
                    {projectTasks.length === 0 ? (
                        <div className="project-task-empty">
                            No tasks in this project yet. Add one above!
                        </div>
                    ) : (
                        projectTasks.map(task => (
                            <TaskAccordion
                                key={task._id}
                                task={task}
                                viewMode="focus"
                                onUpdate={onUpdateTask}
                                onDelete={onDeleteTask}
                                headers={getHeaders().headers}
                                isExpanded={false}
                                onToggle={() => { }}
                            />
                        ))
                    )}
                </div>
            </div>
        );
    }

    // ─── GRID VIEW ───
    return (
        <div className="projects-view">
            <div className="projects-header">
                <h2>
                    Projects
                    {projects.length > 0 && (
                        <span className="projects-count">{projects.length}</span>
                    )}
                </h2>
                <button className="btn-new-project" onClick={() => setShowCreate(!showCreate)}>
                    <FaPlus /> New Project
                </button>
            </div>

            {/* CREATE FORM */}
            {showCreate && (
                <div className="create-project-card">
                    <h3>Create a new project</h3>
                    <div className="create-field">
                        <label>Project Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Website Redesign"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            autoFocus
                        />
                    </div>
                    <div className="create-field">
                        <label>Description (optional)</label>
                        <textarea
                            placeholder="What's this project about?"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            rows={2}
                        />
                    </div>
                    <div className="color-icon-row">
                        <div className="create-field">
                            <label>Color</label>
                            <div className="color-picker-group">
                                {PROJECT_COLORS.map(c => (
                                    <div
                                        key={c}
                                        className={`color-swatch ${newColor === c ? 'selected' : ''}`}
                                        style={{ background: c }}
                                        onClick={() => setNewColor(c)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="create-field">
                            <label>Icon</label>
                            <div className="icon-picker-group">
                                {PROJECT_ICONS.map(ic => (
                                    <div
                                        key={ic}
                                        className={`icon-option ${newIcon === ic ? 'selected' : ''}`}
                                        onClick={() => setNewIcon(ic)}
                                    >
                                        {ic}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="create-actions">
                        <button className="btn-cancel" onClick={() => setShowCreate(false)}>Cancel</button>
                        <button className="btn-create" disabled={!newName.trim()} onClick={handleCreate}>
                            Create Project
                        </button>
                    </div>
                </div>
            )}

            {/* GRID OR EMPTY */}
            {projects.length === 0 && !showCreate ? (
                <div className="projects-empty">
                    <div className="projects-empty-icon">📂</div>
                    <h3>No projects yet</h3>
                    <p>Organize your tasks into projects to track progress & stay focused.</p>
                    <button className="btn-new-project" onClick={() => setShowCreate(true)}>
                        <FaPlus /> Create your first project
                    </button>
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map(project => {
                        const percent = project.totalTasks > 0
                            ? Math.round((project.completedTasks / project.totalTasks) * 100)
                            : 0;
                        return (
                            <div
                                key={project._id}
                                className="project-card"
                                style={{ '--project-color': project.color }}
                                onClick={() => setSelectedProject(project)}
                            >
                                <div className="project-card-header">
                                    <div className="project-icon-name">
                                        <div className="project-icon" style={{ background: `${project.color}15` }}>
                                            {project.icon}
                                        </div>
                                        <span className="project-name">{project.name}</span>
                                    </div>
                                    <div className="project-actions">
                                        <button
                                            className="project-action-btn delete"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm(`Delete "${project.name}"? Tasks will be preserved.`)) {
                                                    onDeleteProject(project._id);
                                                }
                                            }}
                                            title="Delete project"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                {project.description && (
                                    <p className="project-description">{project.description}</p>
                                )}

                                <div className="project-progress-section">
                                    <div className="project-progress-header">
                                        <span className="project-task-count">
                                            {project.completedTasks}/{project.totalTasks} tasks
                                        </span>
                                        <span className="project-percent">{percent}%</span>
                                    </div>
                                    <div className="project-progress-bar">
                                        <div
                                            className="project-progress-fill"
                                            style={{ width: `${percent}%`, background: project.color }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProjectsView;
