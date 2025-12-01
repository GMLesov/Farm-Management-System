// Minimal init script for MongoDB container
// Ensures database is created on first run
// You can add users/collections/indices here if needed.

// Switch to the target database (will create if not exists)
db = db.getSiblingDB('farm_management');

// Optionally create a simple collection to force initialization
db.createCollection('init_marker');

print('MongoDB init script executed: farm_management database ensured.');
