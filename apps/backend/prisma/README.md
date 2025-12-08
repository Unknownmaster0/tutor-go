# Database Setup Guide

This directory contains the database schema and migration files for the TutorGo platform.

## Technologies

- **PostgreSQL**: Relational database for transactional data (users, bookings, payments, reviews, messages, notifications)
- **Prisma**: ORM and migration tool for PostgreSQL
- **MongoDB**: Document database for tutor profiles with geospatial data
- **Mongoose**: ODM for MongoDB

## Prerequisites

Make sure you have the following services running:

- PostgreSQL (default port: 5432)
- MongoDB (default port: 27017)

You can use Docker Compose to start these services:

```bash
docker-compose up -d postgres mongodb
```

## Environment Variables

Ensure your `.env` file contains:

```env
DATABASE_URL="postgresql://tutorgo:password@localhost:5432/tutorgo?schema=public"
MONGODB_URI=mongodb://localhost:27017/tutorgo
```

## Database Schema

### PostgreSQL Tables

1. **users** - User accounts (students, tutors, admins)
2. **bookings** - Tutoring session bookings
3. **payments** - Payment transactions
4. **reviews** - Tutor reviews and ratings
5. **messages** - Chat messages between users
6. **notifications** - User notifications

### MongoDB Collections

1. **tutorprofiles** - Tutor profile data with geospatial indexing

## Setup Instructions

### 1. Generate Prisma Client

```bash
npm run prisma:generate
```

### 2. Run Migrations

Create and apply database migrations:

```bash
npm run prisma:migrate
```

This will:

- Create all PostgreSQL tables
- Set up indexes
- Apply constraints

### 3. Seed Development Data

Populate the database with sample data:

```bash
npm run db:seed
```

This will create:

- 1 admin user
- 3 student users
- 5 tutor users with profiles
- Sample bookings, payments, reviews, messages, and notifications

### Test Credentials

After seeding, you can use these credentials:

**Admin:**

- Email: `admin@tutorgo.com`
- Password: `password123`

**Student:**

- Email: `john.student@example.com`
- Password: `password123`

**Tutor:**

- Email: `emma.math@example.com`
- Password: `password123`

## Common Commands

### View Database in Prisma Studio

```bash
npm run prisma:studio
```

### Create a New Migration

```bash
npx prisma migrate dev --name your_migration_name
```

### Reset Database (⚠️ Deletes all data)

```bash
npx prisma migrate reset
```

This will:

1. Drop the database
2. Create a new database
3. Apply all migrations
4. Run the seed script

### Format Prisma Schema

```bash
npx prisma format
```

## MongoDB Indexes

The TutorProfile schema includes the following indexes:

1. **Geospatial Index** (`location: 2dsphere`) - For location-based queries
2. **User ID Index** (`userId: 1`) - For quick profile lookups
3. **Subject Name Index** (`subjects.name: 1`) - For subject filtering
4. **Rating/Rate Index** (`rating: -1, hourlyRate: 1`) - For sorting and filtering

## Troubleshooting

### Connection Issues

If you can't connect to PostgreSQL:

1. Check if PostgreSQL is running: `docker ps` or `pg_isready`
2. Verify credentials in `.env`
3. Ensure the database exists: `createdb tutorgo`

If you can't connect to MongoDB:

1. Check if MongoDB is running: `docker ps`
2. Verify connection string in `.env`
3. Test connection: `mongosh mongodb://localhost:27017/tutorgo`

### Migration Errors

If migrations fail:

1. Check database connection
2. Review migration SQL in `prisma/migrations/`
3. Reset database if needed: `npx prisma migrate reset`

### Seed Script Errors

If seeding fails:

1. Ensure both PostgreSQL and MongoDB are running
2. Check that migrations have been applied
3. Verify environment variables are set correctly

## Schema Changes

When modifying the schema:

1. Update `schema.prisma` for PostgreSQL changes
2. Update `src/shared/database/schemas/` for MongoDB changes
3. Create a new migration: `npm run prisma:migrate`
4. Update seed script if needed
5. Test changes locally before committing
