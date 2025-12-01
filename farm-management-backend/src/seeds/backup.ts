#!/usr/bin/env node

import DatabaseBackupManager from './DatabaseBackupManager';

async function runBackupCLI() {
  const manager = new DatabaseBackupManager();
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || args.includes('--help')) {
    console.log(`
🗄️ Farm Management Database Backup CLI

Usage: npm run backup <command> [options]

Commands:
  create [filename]     Create a new backup
  restore <filename>    Restore from backup file
  list [directory]      List available backup files
  validate <filename>   Validate backup file integrity
  stats                 Show current database statistics

Options:
  --drop               Drop database before restore (restore command only)
  --no-users           Skip users during restore
  --no-farms           Skip farms during restore
  --no-animals         Skip animals during restore
  --no-feed            Skip feed during restore
  --no-veterinary      Skip veterinary records during restore
  --no-breeding        Skip breeding records during restore
  --help               Show this help message

Examples:
  npm run backup create                    # Create backup with auto-generated name
  npm run backup create my-backup.json     # Create backup with custom name
  npm run backup restore backup.json       # Restore from backup
  npm run backup restore backup.json -- --drop  # Drop DB and restore
  npm run backup list                      # List all backup files
  npm run backup validate backup.json     # Validate backup file
  npm run backup stats                     # Show database statistics
    `);
    process.exit(0);
  }

  try {
    await manager.connect();

    switch (command) {
      case 'create': {
        const filename = args[1];
        const backupPath = await manager.createBackup(filename);
        console.log(`\n🎉 Backup created successfully: ${backupPath}`);
        break;
      }

      case 'restore': {
        const filename = args[1];
        if (!filename) {
          console.error('❌ Please provide a backup filename');
          process.exit(1);
        }

        const options = {
          dropDatabase: args.includes('--drop'),
          skipUsers: args.includes('--no-users'),
          skipFarms: args.includes('--no-farms'),
          skipAnimals: args.includes('--no-animals'),
          skipFeed: args.includes('--no-feed'),
          skipVeterinary: args.includes('--no-veterinary'),
          skipBreeding: args.includes('--no-breeding'),
        };

        console.log('🚀 Starting restore with options:');
        console.log(`  Drop database: ${options.dropDatabase}`);
        console.log(`  Skip users: ${options.skipUsers}`);
        console.log(`  Skip farms: ${options.skipFarms}`);
        console.log(`  Skip animals: ${options.skipAnimals}`);
        console.log(`  Skip feed: ${options.skipFeed}`);
        console.log(`  Skip veterinary: ${options.skipVeterinary}`);
        console.log(`  Skip breeding: ${options.skipBreeding}`);
        console.log('');

        await manager.restoreBackup(filename, options);
        break;
      }

      case 'list': {
        const directory = args[1] || './';
        await manager.listBackups(directory);
        break;
      }

      case 'validate': {
        const filename = args[1];
        if (!filename) {
          console.error('❌ Please provide a backup filename');
          process.exit(1);
        }

        const isValid = await manager.validateBackup(filename);
        if (isValid) {
          console.log('✅ Backup file is valid');
        } else {
          console.error('❌ Backup file is invalid');
          process.exit(1);
        }
        break;
      }

      case 'stats': {
        await manager.getDatabaseStats();
        break;
      }

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
  console.log('\n⚠️ Operation interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️ Operation terminated');
  process.exit(0);
});

// Run the CLI
runBackupCLI();