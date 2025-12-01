#!/usr/bin/env node

import MigrationManager, { migrations } from './MigrationManager';

async function runMigrationCLI() {
  const manager = new MigrationManager();
  const args = process.argv.slice(2);
  const command = args[0];

  // Add all migrations to the manager
  migrations.forEach(migration => manager.addMigration(migration));

  if (!command || args.includes('--help')) {
    console.log(`
🔄 Farm Management Database Migration CLI

Usage: npm run migrate <command>

Commands:
  up        Apply all pending migrations
  down      Rollback the last migration
  status    Show migration status
  --help    Show this help message

Examples:
  npm run migrate up       # Apply all pending migrations
  npm run migrate down     # Rollback last migration
  npm run migrate status   # Show current migration status
    `);
    process.exit(0);
  }

  try {
    await manager.connect();

    switch (command) {
      case 'up':
        await manager.migrate();
        break;

      case 'down':
        await manager.rollback();
        break;

      case 'status':
        await manager.getStatus();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Use --help to see available commands');
        process.exit(1);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error:', errorMessage);
    process.exit(1);
  } finally {
    await manager.disconnect();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️ Migration interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️ Migration terminated');
  process.exit(0);
});

// Run the CLI
runMigrationCLI();