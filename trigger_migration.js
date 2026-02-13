// Simple script to trigger category migration via API
// Run this with: node trigger_migration.js

const axios = require('axios');

const API_URL = 'http://localhost:5000';

// Get token from your browser's localStorage or from the login response
// For testing, you'll need to replace this with your actual JWT token
const TOKEN = 'YOUR_JWT_TOKEN_HERE';

async function migratecategories() {
    try {
        console.log('🚀 Triggering category migration...\n');

        const response = await axios.post(
            `${API_URL}/api/migrate/migrate-categories`,
            {},
            {
                headers: {
                    'x-auth-token': TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Migration successful!');
        console.log('\nResults:', response.data.message);
        console.log('\nUpdated projects:');
        response.data.updates.forEach(update => console.log(`  - ${update}`));

        console.log('\n📊 Current projects:');
        response.data.projects.forEach(proj => {
            console.log(`  ${proj.name}: category="${proj.category}"`);
        });

    } catch (error) {
        console.error('❌ Migration failed:', error.response?.data || error.message);
        console.log('\n💡 TIP: Make sure to replace YOUR_JWT_TOKEN_HERE with your actual token');
        console.log('You can get it from browser DevTools → Application → localStorage → token');
    }
}

migrateCategories();
