// Debug script to check project category field implementation
// Run this in the root directory: node debug_project.js

const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');
    runDebug();
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

async function runDebug() {
    try {
        const Project = require('./server/models/Project');

        console.log('\n📋 PROJECT MODEL SCHEMA:');
        console.log(Object.keys(Project.schema.paths));
        console.log('Has category field?', 'category' in Project.schema.paths);

        console.log('\n📊 EXISTING PROJECTS IN DATABASE:');
        const projects = await Project.find({}).limit(10);

        if (projects.length === 0) {
            console.log('No projects found in database.');
        } else {
            projects.forEach((proj, i) => {
                console.log(`\n${i + 1}. ${proj.name}`);
                console.log(`   ID: ${proj._id}`);
                console.log(`   Category: ${proj.category || 'undefined'}`);
                console.log(`   Color: ${proj.color}`);
                console.log(`   Icon: ${proj.icon}`);
            });
        }

        console.log('\n🔧 TESTING: Update existing projects with default category...');
        const result = await Project.updateMany(
            { category: { $exists: false } },
            { $set: { category: 'other' } }
        );
        console.log(`Updated ${result.modifiedCount} projects with category='other'`);

        console.log('\n✅ VERIFICATION: Check projects again...');
        const updatedProjects = await Project.find({}).limit(10);
        updatedProjects.forEach((proj, i) => {
            console.log(`${i + 1}. ${proj.name} → category: ${proj.category}`);
        });

        console.log('\n✅ Debug complete! All existing projects now have category field.');

    } catch (error) {
        console.error('❌ Error during debug:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}
