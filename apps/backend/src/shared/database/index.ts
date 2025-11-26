// PostgreSQL (Prisma)
export { default as prisma } from './prisma.client';

// MongoDB (Mongoose)
export { connectMongoDB, disconnectMongoDB } from './mongodb.client';
export { TutorProfile } from './schemas/tutor-profile.schema';
export type { ITutorProfile, ISubject, ILocation, IAvailability } from './schemas/tutor-profile.schema';

// Types
export * from './types';
