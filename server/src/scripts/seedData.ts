import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Sample data for farm management system
const sampleData = {
  animals: [
    {
      name: 'Bessie',
      species: 'cattle',
      breed: 'Holstein Friesian',
      age: 3,
      weight: 650,
      healthStatus: 'healthy',
      lastCheckup: new Date('2025-11-10'),
      tag: 'COW-001',
    },
    {
      name: 'Daisy',
      species: 'cattle',
      breed: 'Jersey',
      age: 2,
      weight: 450,
      healthStatus: 'healthy',
      lastCheckup: new Date('2025-11-12'),
      tag: 'COW-002',
    },
    {
      name: 'Wilbur',
      species: 'pig',
      breed: 'Large White',
      age: 1,
      weight: 180,
      healthStatus: 'treatment',
      lastCheckup: new Date('2025-11-14'),
      tag: 'PIG-001',
    },
    {
      name: 'Charlotte',
      species: 'pig',
      breed: 'Duroc',
      age: 2,
      weight: 220,
      healthStatus: 'healthy',
      lastCheckup: new Date('2025-11-11'),
      tag: 'PIG-002',
    },
    {
      name: 'Billy',
      species: 'goat',
      breed: 'Boer',
      age: 1,
      weight: 75,
      healthStatus: 'healthy',
      lastCheckup: new Date('2025-11-13'),
      tag: 'GOAT-001',
    },
  ],
  crops: [
    {
      name: 'Maize Field',
      variety: 'Hybrid 513',
      area: 5.5,
      plantedDate: new Date('2025-09-01'),
      expectedHarvest: new Date('2026-01-15'),
      stage: 'vegetative',
      healthStatus: 'healthy',
      growthProgress: 45,
      yieldEstimate: 6.5,
      location: 'North Field A',
    },
    {
      name: 'Wheat Crop',
      variety: 'Kenya Mavuno',
      area: 3.2,
      plantedDate: new Date('2025-10-01'),
      expectedHarvest: new Date('2026-02-28'),
      stage: 'flowering',
      healthStatus: 'good',
      growthProgress: 60,
      yieldEstimate: 4.2,
      location: 'South Field B',
    },
    {
      name: 'Tomato Greenhouse',
      variety: 'Money Maker',
      area: 0.5,
      plantedDate: new Date('2025-10-15'),
      expectedHarvest: new Date('2026-01-10'),
      stage: 'fruiting',
      healthStatus: 'needs-attention',
      growthProgress: 75,
      yieldEstimate: 3.5,
      location: 'Greenhouse 1',
    },
    {
      name: 'Potato Field',
      variety: 'Dutch Robijn',
      area: 2.8,
      plantedDate: new Date('2025-09-20'),
      expectedHarvest: new Date('2025-12-25'),
      stage: 'maturation',
      healthStatus: 'at-risk',
      growthProgress: 85,
      yieldEstimate: 12.0,
      location: 'East Field C',
    },
  ],
  equipment: [
    {
      name: 'John Deere 6130M Tractor',
      type: 'tractor',
      status: 'operational',
      lastMaintenance: new Date('2025-10-20'),
      nextMaintenance: new Date('2025-12-20'),
      hoursUsed: 487,
      purchaseDate: new Date('2023-03-15'),
      cost: 45000,
    },
    {
      name: 'Irrigation Pump',
      type: 'irrigation',
      status: 'maintenance-due',
      lastMaintenance: new Date('2025-08-15'),
      nextMaintenance: new Date('2025-11-15'),
      hoursUsed: 1245,
      purchaseDate: new Date('2022-06-10'),
      cost: 8500,
    },
    {
      name: 'Combine Harvester',
      type: 'harvester',
      status: 'operational',
      lastMaintenance: new Date('2025-11-01'),
      nextMaintenance: new Date('2026-01-15'),
      hoursUsed: 234,
      purchaseDate: new Date('2024-01-20'),
      cost: 85000,
    },
  ],
  tasks: [
    {
      title: 'Morning cattle feeding',
      description: 'Feed all cattle in the barn with hay and supplements',
      assignedTo: 'John Kamau',
      priority: 'high',
      status: 'completed',
      dueDate: new Date('2025-11-16T06:00:00'),
      completedAt: new Date('2025-11-16T05:45:00'),
    },
    {
      title: 'Broiler vaccination',
      description: 'Administer Newcastle disease vaccine to all broilers',
      assignedTo: 'Mary Wanjiku',
      priority: 'critical',
      status: 'in-progress',
      dueDate: new Date('2025-11-16T08:00:00'),
    },
    {
      title: 'Maize field inspection',
      description: 'Check for pests and assess irrigation needs',
      assignedTo: 'Peter Mwangi',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date('2025-11-16T10:00:00'),
    },
    {
      title: 'Tractor maintenance',
      description: 'Oil change and general inspection',
      assignedTo: 'David Ochieng',
      priority: 'high',
      status: 'pending',
      dueDate: new Date('2025-11-18T09:00:00'),
    },
  ],
  alerts: [
    {
      type: 'critical',
      category: 'Equipment',
      title: 'Equipment Maintenance Overdue',
      message: 'Tractor maintenance is 2 weeks overdue. Immediate attention required',
      timestamp: new Date('2025-11-14T14:00:00'),
      status: 'active',
    },
    {
      type: 'critical',
      category: 'Irrigation',
      title: 'Irrigation System Failure',
      message: 'North field irrigation system has stopped working. Crops at risk.',
      timestamp: new Date('2025-11-16T05:00:00'),
      status: 'active',
    },
    {
      type: 'warning',
      category: 'Breeding',
      title: 'Breeding Alert',
      message: '3 sows expected to farrow in next 48 hours',
      timestamp: new Date('2025-11-16T08:00:00'),
      status: 'active',
    },
    {
      type: 'warning',
      category: 'Vaccination',
      title: 'Vaccination Due',
      message: 'Cattle vaccination due today - 50 animals',
      timestamp: new Date('2025-11-16T04:00:00'),
      status: 'active',
    },
  ],
  workers: [
    {
      name: 'John Kamau',
      email: 'john.kamau@farm.com',
      role: 'Senior Farmhand',
      phone: '+254 712 345 678',
      specialization: 'Livestock Management',
      hireDate: new Date('2020-03-15'),
      status: 'active',
      performance: 92,
    },
    {
      name: 'Mary Wanjiku',
      email: 'mary.wanjiku@farm.com',
      role: 'Animal Health Officer',
      phone: '+254 723 456 789',
      specialization: 'Veterinary Care',
      hireDate: new Date('2021-06-01'),
      status: 'active',
      performance: 95,
    },
    {
      name: 'Peter Mwangi',
      email: 'peter.mwangi@farm.com',
      role: 'Crop Specialist',
      phone: '+254 734 567 890',
      specialization: 'Agronomy',
      hireDate: new Date('2019-01-10'),
      status: 'active',
      performance: 88,
    },
    {
      name: 'David Ochieng',
      email: 'david.ochieng@farm.com',
      role: 'Equipment Operator',
      phone: '+254 745 678 901',
      specialization: 'Machinery',
      hireDate: new Date('2022-08-20'),
      status: 'active',
      performance: 85,
    },
  ],
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farm-management';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Import models (adjust paths as needed)
    const Animal = mongoose.model('Animal', new mongoose.Schema({
      name: String,
      species: String,
      breed: String,
      age: Number,
      weight: Number,
      healthStatus: String,
      lastCheckup: Date,
      tag: String,
    }));

    const Crop = mongoose.model('Crop', new mongoose.Schema({
      name: String,
      variety: String,
      area: Number,
      plantedDate: Date,
      expectedHarvest: Date,
      stage: String,
      healthStatus: String,
      growthProgress: Number,
      yieldEstimate: Number,
      location: String,
    }));

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Animal.deleteMany({});
    await Crop.deleteMany({});
    
    // Insert sample data
    console.log('📝 Inserting sample data...');
    await Animal.insertMany(sampleData.animals);
    await Crop.insertMany(sampleData.crops);
    
    console.log('✅ Database seeded successfully!');
    console.log(`   - ${sampleData.animals.length} animals added`);
    console.log(`   - ${sampleData.crops.length} crops added`);
    console.log(`   - ${sampleData.equipment.length} equipment items added`);
    console.log(`   - ${sampleData.tasks.length} tasks added`);
    console.log(`   - ${sampleData.workers.length} workers added`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
