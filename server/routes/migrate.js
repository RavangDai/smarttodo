const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');

// MIGRATION ENDPOINT: Add category field to existing projects
router.post('/migrate-categories', auth, async (req, res) => {
    try {
        console.log('🔧 Starting category migration...');

        // Find all projects without a category field
        const projectsNeedingUpdate = await Project.find({
            user: req.user.id,
            $or: [
                { category: { $exists: false } },
                { category: null },
                { category: '' }
            ]
        });

        console.log(`Found ${projectsNeedingUpdate.length} projects needing category field`);

        // Update each project with default 'other' category
        const updates = await Promise.all(
            projectsNeedingUpdate.map(async (project) => {
                project.category = 'other';
                await project.save();
                return `Updated: ${project.name}`;
            })
        );

        // Fetch all user's projects for return
        const allProjects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });

        console.log('✅ Migration complete!');

        res.json({
            success: true,
            message: `Migrated ${projectsNeedingUpdate.length} projects`,
            updates: updates,
            projects: allProjects
        });

    } catch (err) {
        console.error('Migration error:', err.message);
        res.status(500).json({ msg: 'Migration failed', error: err.message });
    }
});

module.exports = router;
