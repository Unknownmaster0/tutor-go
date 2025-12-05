import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import prisma from '../prisma.client';
import { connectMongoDB, disconnectMongoDB, TutorProfile } from '../index';
import mongoose from 'mongoose';

describe('Database Connection Tests', () => {
  describe('PostgreSQL (Prisma)', () => {
    afterAll(async () => {
      await prisma.$disconnect();
    });

    it('should connect to PostgreSQL', async () => {
      await expect(prisma.$connect()).resolves.not.toThrow();
    });

    it('should execute a simple query', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as value`;
      expect(result).toBeDefined();
    });
  });

  describe('MongoDB (Mongoose)', () => {
    beforeAll(async () => {
      if (mongoose.connection.readyState === 0) {
        await connectMongoDB();
      }
    });

    afterAll(async () => {
      await disconnectMongoDB();
    });

    it('should connect to MongoDB', () => {
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    });

    it('should have TutorProfile model registered', () => {
      expect(TutorProfile).toBeDefined();
      expect(TutorProfile.modelName).toBe('TutorProfile');
    });

    it('should have geospatial index on location', async () => {
      const indexes = await TutorProfile.collection.getIndexes();
      const hasGeoIndex = Object.values(indexes).some(
        (index: any) => index.location === '2dsphere'
      );
      expect(hasGeoIndex).toBe(true);
    });
  });
});

describe('Database Schema Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
    if (mongoose.connection.readyState === 0) {
      await connectMongoDB();
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await disconnectMongoDB();
  });

  describe('Prisma Models', () => {
    it('should have User model', () => {
      expect(prisma.user).toBeDefined();
    });

    it('should have Booking model', () => {
      expect(prisma.booking).toBeDefined();
    });

    it('should have Payment model', () => {
      expect(prisma.payment).toBeDefined();
    });

    it('should have Review model', () => {
      expect(prisma.review).toBeDefined();
    });

    it('should have Message model', () => {
      expect(prisma.message).toBeDefined();
    });

    it('should have Notification model', () => {
      expect(prisma.notification).toBeDefined();
    });
  });

  describe('Mongoose Models', () => {
    it('should validate TutorProfile schema', () => {
      const validProfile = new TutorProfile({
        userId: 'test-user-id',
        bio: 'Test bio',
        qualifications: ['Test qualification'],
        subjects: [{ name: 'Math', proficiency: 'expert' }],
        hourlyRate: 50,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'Test address',
        },
      });

      const error = validProfile.validateSync();
      expect(error).toBeUndefined();
    });

    it('should reject invalid coordinates', () => {
      const invalidProfile = new TutorProfile({
        userId: 'test-user-id',
        bio: 'Test bio',
        qualifications: ['Test qualification'],
        subjects: [{ name: 'Math', proficiency: 'expert' }],
        hourlyRate: 50,
        location: {
          type: 'Point',
          coordinates: [-122.4194], // Invalid: only one coordinate
          address: 'Test address',
        },
      });

      const error = invalidProfile.validateSync();
      expect(error).toBeDefined();
    });

    it('should require at least one subject', () => {
      const invalidProfile = new TutorProfile({
        userId: 'test-user-id',
        bio: 'Test bio',
        qualifications: ['Test qualification'],
        subjects: [], // Invalid: empty array
        hourlyRate: 50,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'Test address',
        },
      });

      const error = invalidProfile.validateSync();
      expect(error).toBeDefined();
    });
  });
});
