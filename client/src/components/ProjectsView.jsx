import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import ProjectIcon, { getCategoryColors } from './ui/ProjectIcons';
import TaskAccordion from './TaskAccordion';
import NeoInput from './ui/NeoInput';
import { PrimaryButton } from './ui/Buttons';
import IconPicker from './ui/IconPicker';
import SmartTaskInput from './SmartTaskInput'; // Import implemented

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
    const getProjectTasks = (projectId) => tasks.filter(t => {
        if (!t.project) return false;
        // Check if project is populated object or just ID string
        const tProjectId = t.project._id || t.project;
        return tProjectId === projectId;
    });

    // Calculate progress
    const getProgress = (projectId) => {
        const pTasks = getProjectTasks(projectId);
        if (pTasks.length === 0) return 0;
        const completed = pTasks.filter(t => t.isCompleted).length;
        return Math.round((completed / pTasks.length) * 100);
    };

    // Color config now comes from the centralized static COLORS map
    // via getCategoryColors() from ProjectIcons.jsx

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
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Your Projects</h2>
                            <p className="text-secondary text-sm">Manage your creative endeavors</p>
                        </div>
                        <PrimaryButton onClick={() => setIsCreating(true)} className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                            <Plus size={18} /> New Project
                        </PrimaryButton>
                    </div>

                    {/* Create Modal/Inline */}
                    <AnimatePresence>
                        {isCreating && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, scale: 0.98 }}
                                animate={{ height: 'auto', opacity: 1, scale: 1 }}
                                exit={{ height: 0, opacity: 0, scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
                                className="mb-12 overflow-hidden"
                            >
                                <div className="relative rounded-3xl overflow-hidden p-1 border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />

                                    <div className="relative z-10 bg-[#0a0a0a] rounded-[1.3rem] p-8">
                                        <button
                                            onClick={() => setIsCreating(false)}
                                            className="absolute top-6 right-6 p-2 text-secondary hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10"
                                        >
                                            <X size={20} />
                                        </button>

                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <span className="w-2 h-8 rounded-full bg-primary" />
                                            Create New Project
                                        </h3>

                                        <form onSubmit={handleCreate} className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-xs uppercase text-secondary mb-3 font-semibold tracking-wider">Project Name</label>
                                                        <NeoInput
                                                            value={newProjectName}
                                                            onChange={e => setNewProjectName(e.target.value)}
                                                            placeholder="e.g., Website Redesign"
                                                            autoFocus
                                                            className="text-lg py-3"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs uppercase text-secondary mb-3 font-semibold tracking-wider">Select Icon & Category</label>
                                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                            <IconPicker
                                                                selectedIcon={newProjectCategory}
                                                                onChange={setNewProjectCategory}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Live Preview */}
                                                <div>
                                                    <label className="block text-xs uppercase text-secondary mb-3 font-semibold tracking-wider">Preview</label>
                                                    {(() => {
                                                        const previewC = getCategoryColors(newProjectCategory);
                                                        return (
                                                            <div className="h-full flex flex-col justify-center items-center p-8 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
                                                                <div
                                                                    className="relative w-full aspect-video rounded-2xl overflow-hidden p-6 flex flex-col justify-between"
                                                                    style={{
                                                                        background: `linear-gradient(135deg, rgba(${previewC.rgb}, 0.12), transparent)`,
                                                                        border: `1px solid rgba(${previewC.rgb}, 0.15)`,
                                                                        boxShadow: `0 0 30px -10px rgba(${previewC.rgb}, 0.3)`,
                                                                    }}
                                                                >
                                                                    <div className="relative z-10 flex justify-between items-start">
                                                                        <ProjectIcon category={newProjectCategory} size={28} variant="glass" />
                                                                    </div>
                                                                    <div className="relative z-10">
                                                                        <div className="text-2xl font-bold text-white mb-1">{newProjectName || 'Project Name'}</div>
                                                                        <div className="text-sm capitalize" style={{ color: previewC.hex }}>{newProjectCategory} Project</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-4 border-t border-white/5">
                                                <PrimaryButton type="submit" disabled={!newProjectName.trim()} className="px-8 py-3 text-base">
                                                    Create Project
                                                </PrimaryButton>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {projects.map((project, i) => {
                                const progress = getProgress(project._id);
                                const pendingCount = getProjectTasks(project._id).filter(t => !t.isCompleted).length;
                                const pc = getCategoryColors(project.category);

                                return (
                                    <motion.div
                                        key={project._id}
                                        layout
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 28, delay: i * 0.06 }}
                                        onClick={() => setSelectedProject(project)}
                                        className="h-full"
                                    >
                                        <div className="h-full group relative cursor-pointer">
                                            {/* Hover Glow Ring */}
                                            <div
                                                className="absolute -inset-0.5 rounded-[2rem] opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500"
                                                style={{ background: `linear-gradient(135deg, rgba(${pc.rgb}, 0.4), rgba(${pc.rgb}, 0.05))` }}
                                            />

                                            <GlassCard className="h-full relative overflow-hidden flex flex-col p-7 !rounded-[1.8rem] !bg-[#0a0a0a] !border-white/5 hover:!border-white/10 transition-all duration-300">

                                                {/* Ambient Background Orb */}
                                                <div
                                                    className="absolute top-0 right-0 w-64 h-64 blur-[60px] rounded-full translate-x-1/3 -translate-y-1/3 transition-opacity duration-500 group-hover:opacity-100"
                                                    style={{ backgroundColor: `rgba(${pc.rgb}, 0.12)`, opacity: 0.7 }}
                                                />
                                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />

                                                <div className="flex justify-between items-start mb-8 relative z-10">
                                                    <ProjectIcon category={project.category} size={24} variant="card" />

                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onDeleteProject(project._id); }}
                                                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 text-secondary transition-all rounded-xl"
                                                        title="Delete Project"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>

                                                <div className="relative z-10 flex-1">
                                                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors">{project.name}</h3>
                                                    <p className="text-sm text-secondary/80 line-clamp-2 leading-relaxed">
                                                        {project.description || `Manage your ${project.category} tasks.`}
                                                    </p>
                                                </div>

                                                <div className="mt-8 relative z-10">
                                                    <div className="flex items-end justify-between mb-3 text-xs font-medium tracking-wide">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="px-2 py-0.5 rounded-md border"
                                                                style={{
                                                                    backgroundColor: `rgba(${pc.rgb}, 0.08)`,
                                                                    borderColor: `rgba(${pc.rgb}, 0.15)`,
                                                                    color: pc.hexLight,
                                                                }}
                                                            >
                                                                {pendingCount} Pending
                                                            </div>
                                                        </div>
                                                        <span style={{ color: pc.hex }}>{progress}%</span>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            transition={{ duration: 1, ease: 'easeOut' }}
                                                            className="h-full rounded-full"
                                                            style={{
                                                                background: `linear-gradient(90deg, ${pc.hex}, ${pc.hexLight})`,
                                                                boxShadow: `0 0 12px rgba(${pc.rgb}, 0.5)`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        </div>
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
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className="relative"
                    >
                        {/* ── HERO HEADER ── */}
                        <div className="relative mb-10 rounded-[2.5rem] overflow-hidden min-h-[320px] flex flex-col justify-between border border-white/10 group">

                            {/* Animated Background Mesh */}
                            <div className="absolute inset-0 bg-[#050505]" />
                            {(() => {
                                const heroC = getCategoryColors(selectedProject.category);
                                return (
                                    <>
                                        <div
                                            className="absolute top-0 right-0 w-[600px] h-[600px] mixed-blend-screen blur-[100px] rounded-full translate-x-1/3 -translate-y-1/2"
                                            style={{ backgroundColor: `rgba(${heroC.rgb}, 0.15)` }}
                                        />
                                        <div
                                            className="absolute bottom-0 left-0 w-[500px] h-[500px] mixed-blend-screen blur-[80px] rounded-full -translate-x-1/3 translate-y-1/2"
                                            style={{ backgroundColor: `rgba(${heroC.rgb}, 0.08)` }}
                                        />
                                    </>
                                );
                            })()}

                            {/* Grid Pattern Overlay */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />

                            {/* Top Bar */}
                            <div className="relative z-10 flex justify-between items-start p-8">
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="flex items-center gap-2 group/back px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 backdrop-blur-md transition-all"
                                >
                                    <X size={16} className="text-secondary group-hover/back:text-white transition-colors" />
                                    <span className="text-xs font-medium text-secondary group-hover/back:text-white uppercase tracking-wider">Back</span>
                                </button>

                                {(() => {
                                    const badgeC = getCategoryColors(selectedProject.category);
                                    return (
                                        <div className="flex gap-2">
                                            <div
                                                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                                                style={{
                                                    color: badgeC.hex,
                                                    backgroundColor: `rgba(${badgeC.rgb}, 0.1)`,
                                                    border: `1px solid rgba(${badgeC.rgb}, 0.3)`,
                                                    boxShadow: `0 0 12px -4px rgba(${badgeC.rgb}, 0.5)`,
                                                }}
                                            >
                                                {selectedProject.category}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Main Content */}
                            <div className="relative z-10 px-10 pb-10 flex flex-col md:flex-row items-end justify-between gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-6 mb-4">
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.05 }}
                                            className="p-1 rounded-3xl"
                                        >
                                            <ProjectIcon category={selectedProject.category} size={36} variant="glass" />
                                        </motion.div>
                                        <div>
                                            <motion.h1
                                                initial={{ y: 12, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.1 }}
                                                className="text-5xl md:text-6xl font-display font-bold text-white mb-2 tracking-tight drop-shadow-lg"
                                            >
                                                {selectedProject.name}
                                            </motion.h1>
                                            <motion.p
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.15 }}
                                                className="text-lg text-secondary/80 max-w-xl font-light"
                                            >
                                                {selectedProject.description || "Shape your ideas into reality."}
                                            </motion.p>
                                        </div>
                                    </div>
                                </div>

                                {/* Integrated Stats Bar */}
                                <div className="flex items-center gap-px bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
                                    <div className="px-6 py-3 flex flex-col items-center justify-center min-w-[100px] hover:bg-white/5 transition-colors">
                                        <span className="text-2xl font-bold text-white">{getProgress(selectedProject._id)}<span className="text-sm font-normal text-secondary/50">%</span></span>
                                        <span className="text-[10px] uppercase tracking-widest text-secondary font-medium">Complete</span>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div className="px-6 py-3 flex flex-col items-center justify-center min-w-[100px] hover:bg-white/5 transition-colors">
                                        <span className="text-2xl font-bold text-white">{getProjectTasks(selectedProject._id).filter(t => !t.isCompleted).length}</span>
                                        <span className="text-[10px] uppercase tracking-widest text-secondary font-medium">Pending</span>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div className="px-6 py-3 flex flex-col items-center justify-center min-w-[100px] hover:bg-white/5 transition-colors">
                                        <span className="text-2xl font-bold text-white">{getProjectTasks(selectedProject._id).length}</span>
                                        <span className="text-[10px] uppercase tracking-widest text-secondary font-medium">Total</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── INPUT SECTION ── */}
                        <div className="mb-10 max-w-4xl mx-auto">
                            <SmartTaskInput
                                onAddTask={onAddTask}
                                getLocalDateString={getLocalDateString}
                                tasks={tasks}
                                projects={projects}
                                preSelectedProject={selectedProject}
                            />
                        </div>

                        {/* ── TASK LISTS ── */}
                        <div className="grid gap-8 max-w-5xl mx-auto">
                            {/* ACTIVE TASKS */}
                            <div>
                                <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                                    Active Tasks
                                </h3>
                                <div className="space-y-3">
                                    {getProjectTasks(selectedProject._id).filter(t => !t.isCompleted).length === 0 ? (
                                        <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                                            <p className="text-secondary">No active tasks. Add one above!</p>
                                        </div>
                                    ) : (
                                        getProjectTasks(selectedProject._id)
                                            .filter(t => !t.isCompleted)
                                            .map((task, i) => (
                                                <motion.div
                                                    key={task._id}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ type: 'spring', stiffness: 400, damping: 30, delay: i * 0.04 }}
                                                >
                                                    <TaskAccordion
                                                        task={task}
                                                        onUpdate={onUpdateTask}
                                                        onDelete={onDeleteTask}
                                                        headers={getHeaders().headers}
                                                        isExpanded={expandedTaskId === task._id}
                                                        onToggle={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)}
                                                        variant="project"
                                                        color={getCategoryColors(selectedProject.category).hex}
                                                    />
                                                </motion.div>
                                            ))
                                    )}
                                </div>
                            </div>

                            {/* COMPLETED TASKS */}
                            {getProjectTasks(selectedProject._id).filter(t => t.isCompleted).length > 0 && (
                                <div className="mt-4 opacity-80">
                                    <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Completed
                                    </h3>
                                    <div className="space-y-2">
                                        {getProjectTasks(selectedProject._id)
                                            .filter(t => t.isCompleted)
                                            .map(task => (
                                                <TaskAccordion
                                                    key={task._id}
                                                    task={task}
                                                    onUpdate={onUpdateTask}
                                                    onDelete={onDeleteTask}
                                                    headers={getHeaders().headers}
                                                    isExpanded={expandedTaskId === task._id}
                                                    onToggle={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)}
                                                    variant="project"
                                                    color={getCategoryColors(selectedProject.category).hex}
                                                />
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default ProjectsView;
