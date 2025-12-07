import bcrypt from 'bcryptjs';
import { User } from '../models/User';

/**
 * Creates a default admin user if one doesn't exist
 * Uses environment variables for credentials
 */
export async function createDefaultAdmin(): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@farm.com';
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'password123';

    console.log(`🔍 Checking for admin user: ${adminEmail}`);

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log(`✅ Admin user already exists: ${adminEmail}`);
      console.log(`   Role: ${existingAdmin.role}, Active: ${existingAdmin.isActive}`);
      return;
    }

    console.log(`📝 Creating new admin user: ${adminEmail}`);

    // Create new admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const admin = new User({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      phone: '+254700000000',
      isActive: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await admin.save();
    
    console.log(`✅ Default admin user created successfully!`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Role: admin`);
    console.log(`🔐 Password set from ADMIN_DEFAULT_PASSWORD environment variable`);
    
  } catch (error) {
    console.error('❌ ERROR creating default admin user:', error);
    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
      console.error(`   Error stack: ${error.stack}`);
    }
    // Don't throw - allow server to start even if admin creation fails
  }
}
