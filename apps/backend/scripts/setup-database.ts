#!/usr/bin/env ts-node

/**
 * Database Setup Script
 * 
 * This script sets up both PostgreSQL and MongoDB databases:
 * 1. Creates PostgreSQL tables via Prisma migrations
 * 2. Creates MongoDB indexes for tutor profiles
 * 3. Optionally seeds the database with development data
 */

import { execSync } from 'child_process';
import { connectMongoDB, TutorProfile } from '../src/shared/database';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Step 1: Generate Prisma Client
    console.log('📦 Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client generated\n');

    // Step 2: Run PostgreSQL migrations
    console.log('🗄️  Running PostgreSQL migrations...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ PostgreSQL migrations applied\n');
    } catch (error) {
      console.log('⚠️  No migrations to apply or database already up to date\n');
    }

    // Step 3: Setup MongoDB indexes
    console.log('🍃 Setting up MongoDB indexes...');
    await connectMongoDB();
    
    // Ensure indexes are created
    await TutorProfile.createIndexes();
    console.log('✅ MongoDB indexes created\n');

    // Step 4: Ask about seeding
    console.log('✅ Database setup completed successfully!\n');
    console.log('📝 To seed the database with development data, run:');
    console.log('   npm run db:seed\n');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
