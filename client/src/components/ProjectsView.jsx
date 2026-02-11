import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import ProjectIcon from './ui/ProjectIcons';
import TaskAccordion from './TaskAccordion';
import NeoInput from './ui/NeoInput';
import { PrimaryButton } from './ui/Buttons';
import IconPicker from './ui/IconPicker';

const ProjectsView = ({
    projects,
    tasks,
    onCreateProject,
    onDeleteProject,
    onUpdateTask,
    onDeleteTask,
    onAddTask,
    getHeaders,
    getLocalDateString
}) => {
    const [selectedProject, setSelectedProject] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectCategory, setNewProjectCategory] = useState('coding');
    const [expandedTaskId, setExpandedTaskId] = useState(null);

    // Get tasks for a specific project
    const getProjectTasks = (projectId) => tasks.filter(t => t.project && t.project._id === projectId);

    // Calculate progress
    const getProgress = (projectId) => {
        const pTasks = getProjectTasks(projectId);
        if (pTasks.length === 0) return 0;
        const completed = pTasks.filter(t => t.isCompleted).length;
        return Math.round((completed / pTasks.length) * 100);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;
        onCreateProject({
            name: newProjectName,
            category: newProjectCategory,
            description: `A ${newProjectCategory} project`
        });
        setNewProjectName('');
        setNewProjectCategory('coding'); // Reset
        setIsCreating(false);
    };

    return (
        <div className="p-6 pb-20 max-w-7xl mx-auto dark:text-white">
            {!selectedProject ? (
                /* ── PROJECT GRID ── */
                <>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-display font-bold text-gradient">Your Projects</h2>
                        <PrimaryButton onClick={() => setIsCreating(true)}>
                            <Plus size={18} /> New Project
                        </PrimaryButton>
                    </div>

                    {/* Create Modal/Inline */}
                    <AnimatePresence>
                        {isCreating && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mb-8 overflow-hidden"
                            >
                                <GlassCard className="mb-2 border-primary/30 relative">
                                    <button
                                        onClick={() => setIsCreating(false)}
                                        className="absolute top-4 right-4 p-2 text-secondary hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>

                                    <form onSubmit={handleCreate} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs uppercase text-secondary mb-2">Project Name</label>
                                                <NeoInput
                                                    value={newProjectName}
                                                    onChange={e => setNewProjectName(e.target.value)}
                                                    placeholder="e.g., Website Redesign"
                                                    autoFocus
                                                />
                                            </div>

                                            {/* Preview */}
                                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                                <ProjectIcon category={newProjectCategory} size={40} />
                                                <div>
                                                    <div className="text-lg font-bold text-white">{newProjectName || 'Project Name'}</div>
                                                    <div className="text-sm text-secondary capitalize">{newProjectCategory} Project</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase text-secondary mb-3">Select Icon / Category</label>
                                            <IconPicker
                                                selectedIcon={newProjectCategory}
                                                onChange={setNewProjectCategory}
                                            />
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <PrimaryButton type="submit" disabled={!newProjectName.trim()}>
                                                Create Project
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                </GlassCard>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {projects.map((project, i) => {
                                const progress = getProgress(project._id);
                                const taskCount = getProjectTasks(project._id).length;

                                return (
                                    <motion.div
                                        key={project._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => setSelectedProject(project)}
                                    >
                                        <GlassCard className="h-full hover:border-primary/40 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden">
                                            {/* Glow Background */}
                                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />

                                            <div className="flex justify-between items-start mb-6 relative">
                                                <ProjectIcon category={project.category} size={28} />

                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDeleteProject(project._id); }}
                                                    className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-400 text-secondary transition-all"
                                                    title="Delete Project"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                                            <p className="text-sm text-secondary mb-6 line-clamp-2">
                                                {project.description || `A ${project.category} project`}
                                            </p>

                                            <div className="mt-auto">
                                                <div className="flex justify-between text-xs text-secondary mb-2 uppercase tracking-wider font-mono">
                                                    <span>{taskCount} Tasks</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-500"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </>
            ) : (
                /* ── SINGLE PROJECT VIEW ── */
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <button
                            onClick={() => setSelectedProject(null)}
                            className="mb-6 flex items-center gap-2 text-secondary hover:text-white transition-colors"
                        >
                            <X size={16} /> Back to Projects
                        </button>

                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <ProjectIcon category={selectedProject.category} size={40} className="p-3 bg-white/5 rounded-2xl" />
                                <div>
                                    <h1 className="text-3xl font-bold text-white">{selectedProject.name}</h1>
                                    <p className="text-secondary opacity-70 capitalize">{selectedProject.category} • {getProgress(selectedProject._id)}% Complete</p>
                                </div>
                            </div>
                            <PrimaryButton onClick={() => setSelectedProject(null)}>
                                <Plus size={18} /> Add Task
                            </PrimaryButton>
                        </div>

                        {/* Task List for Project */}
                        <div className="space-y-4">
                            {getProjectTasks(selectedProject._id).length === 0 ? (
                                <div className="text-center py-20 text-secondary border border-dashed border-white/10 rounded-2xl">
                                    <p>No tasks yet.</p>
                                </div>
                            ) : (
                                getProjectTasks(selectedProject._id).map(task => (
                                    <TaskAccordion
                                        key={task._id}
                                        task={task}
                                        onUpdate={onUpdateTask}
                                        onDelete={onDeleteTask}
                                        headers={getHeaders().headers}
                                        isExpanded={expandedTaskId === task._id}
                                        onToggle={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default ProjectsView;
