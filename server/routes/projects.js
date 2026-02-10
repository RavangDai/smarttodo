const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');

// GET all projects (with task counts)
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });

        // Attach task stats to each project
        const projectsWithStats = await Promise.all(
            projects.map(async (project) => {
                const totalTasks = await Task.countDocuments({ user: req.user.id, project: project._id });
                const completedTasks = await Task.countDocuments({ user: req.user.id, project: project._id, isCompleted: true });
                return {
                    ...project.toObject(),
                    totalTasks,
                    completedTasks
                };
            })
        );

        res.json(projectsWithStats);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// POST create project
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, color, icon } = req.body;

        if (!name) {
            return res.status(400).json({ msg: 'Project name is required' });
        }

        const newProject = new Project({
            name,
            description: description || '',
            color: color || '#ff6b00',
            icon: icon || '📁',
            user: req.user.id
        });

        const project = await newProject.save();
        res.json({ ...project.toObject(), totalTasks: 0, completedTasks: 0 });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// PUT update project
router.put('/:id', auth, async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        if (project.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        const { name, description, color, icon } = req.body;
        if (name) project.name = name;
        if (description !== undefined) project.description = description;
        if (color) project.color = color;
        if (icon) project.icon = icon;

        await project.save();
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// DELETE project (tasks are preserved — project ref is just unset)
router.delete('/:id', auth, async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        if (project.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        // Unset the project ref on all associated tasks (don't delete them)
        await Task.updateMany({ project: project._id }, { $unset: { project: 1 } });

        await project.deleteOne();
        res.json({ msg: 'Project removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
