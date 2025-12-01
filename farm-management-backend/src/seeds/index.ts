#!/usr/bin/env node

import DatabaseSeeder from './DatabaseSeeder';

async function runSeeder() {
  const seeder = new DatabaseSeeder();

  try {
    await seeder.connect();

    // Parse command line arguments
    const args = process.argv.slice(2);
    const dropDb = args.includes('--drop');
    const seedUsers = !args.includes('--no-users');
    const seedFarms = !args.includes('--no-farms');
    const seedAnimals = !args.includes('--no-animals');
    const seedFeed = !args.includes('--no-feed');
    const seedVeterinary = !args.includes('--no-veterinary');
    const seedBreeding = !args.includes('--no-breeding');

    if (args.includes('--help')) {
      console.log(`
📖 Farm Management Database Seeder

Usage: npm run seed [options]

Options:
  --drop            Drop the database before seeding
  --no-users        Skip user seeding
  --no-farms        Skip farm seeding
  --no-animals      Skip animal seeding
  --no-feed         Skip feed seeding
  --no-veterinary   Skip veterinary record seeding
  --no-breeding     Skip breeding record seeding
  --help            Show this help message

Examples:
  npm run seed                    # Seed all data
  npm run seed -- --drop          # Drop database and seed all data
  npm run seed -- --no-animals    # Seed everything except animals
      `);
      process.exit(0);
    }

    console.log('🚀 Starting database seeding with options:');
    console.log(`  Drop database: ${dropDb}`);
    console.log(`  Seed users: ${seedUsers}`);
    console.log(`  Seed farms: ${seedFarms}`);
    console.log(`  Seed animals: ${seedAnimals}`);
    console.log(`  Seed feed: ${seedFeed}`);
    console.log(`  Seed veterinary: ${seedVeterinary}`);
    console.log(`  Seed breeding: ${seedBreeding}`);
    console.log('');

    await seeder.seedAll({
      dropDatabase: dropDb,
      seedUsers,
      seedFarms,
      seedAnimals,
      seedFeed,
      seedVeterinary,
      seedBreeding,
    });

    console.log('');
    console.log('🎊 Database seeding completed successfully!');
    console.log('You can now start the server and test the application.');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await seeder.disconnect();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Seeding interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Seeding terminated');
  process.exit(0);
});

// Run the seeder
runSeeder();