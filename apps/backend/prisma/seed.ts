import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Import TutorProfile model
import { TutorProfile } from '../src/shared/database/schemas/tutor-profile.schema';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tutorgo');
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.user.deleteMany();
  await TutorProfile.deleteMany({});

  // Hash password for all users
  // Password must be at least 8 characters with uppercase, lowercase, and number
  const hashedPassword = await bcrypt.hash('Password123', 10);

  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@tutorgo.com',
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      emailVerified: true,
    },
  });
  console.log('✅ Created admin user');

  // Create student users
  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.student@example.com',
        passwordHash: hashedPassword,
        name: 'John Student',
        role: 'student',
        phone: '+1234567890',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.learner@example.com',
        passwordHash: hashedPassword,
        name: 'Sarah Learner',
        role: 'student',
        phone: '+1234567891',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.jones@example.com',
        passwordHash: hashedPassword,
        name: 'Mike Jones',
        role: 'student',
        emailVerified: true,
      },
    }),
  ]);
  console.log(`✅ Created ${students.length} student users`);

  // Create tutor users
  const tutors = await Promise.all([
    prisma.user.create({
      data: {
        email: 'emma.math@example.com',
        passwordHash: hashedPassword,
        name: 'Emma Wilson',
        role: 'tutor',
        phone: '+1234567892',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'david.physics@example.com',
        passwordHash: hashedPassword,
        name: 'David Chen',
        role: 'tutor',
        phone: '+1234567893',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'lisa.english@example.com',
        passwordHash: hashedPassword,
        name: 'Lisa Anderson',
        role: 'tutor',
        phone: '+1234567894',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'james.chemistry@example.com',
        passwordHash: hashedPassword,
        name: 'James Rodriguez',
        role: 'tutor',
        phone: '+1234567895',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sophia.biology@example.com',
        passwordHash: hashedPassword,
        name: 'Sophia Kim',
        role: 'tutor',
        phone: '+1234567896',
        emailVerified: true,
      },
    }),
  ]);
  console.log(`✅ Created ${tutors.length} tutor users`);

  // Create tutor profiles in MongoDB
  const tutorProfiles = await TutorProfile.insertMany([
    {
      userId: tutors[0].id,
      bio: 'Experienced mathematics tutor with 10+ years of teaching experience. Specialized in algebra, calculus, and statistics.',
      qualifications: ['PhD in Mathematics', 'Certified Math Teacher', '10+ years experience'],
      subjects: [
        { name: 'Mathematics', proficiency: 'expert' },
        { name: 'Algebra', proficiency: 'expert' },
        { name: 'Calculus', proficiency: 'expert' },
        { name: 'Statistics', proficiency: 'expert' },
      ],
      hourlyRate: 50,
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749], // San Francisco
        address: '123 Market St, San Francisco, CA 94103',
      },
      demoVideos: ['https://example.com/videos/emma-math-intro.mp4'],
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '15:00' },
      ],
      rating: 4.8,
      totalReviews: 45,
    },
    {
      userId: tutors[1].id,
      bio: 'Physics enthusiast and educator. Making complex physics concepts simple and fun for students of all levels.',
      qualifications: ['MSc in Physics', 'High School Physics Teacher', '8 years experience'],
      subjects: [
        { name: 'Physics', proficiency: 'expert' },
        { name: 'Mathematics', proficiency: 'intermediate' },
        { name: 'Science', proficiency: 'expert' },
      ],
      hourlyRate: 45,
      location: {
        type: 'Point',
        coordinates: [-122.4083, 37.7833], // San Francisco
        address: '456 Mission St, San Francisco, CA 94105',
      },
      demoVideos: ['https://example.com/videos/david-physics-intro.mp4'],
      availability: [
        { dayOfWeek: 1, startTime: '14:00', endTime: '20:00' },
        { dayOfWeek: 2, startTime: '14:00', endTime: '20:00' },
        { dayOfWeek: 3, startTime: '14:00', endTime: '20:00' },
        { dayOfWeek: 5, startTime: '14:00', endTime: '20:00' },
        { dayOfWeek: 6, startTime: '10:00', endTime: '16:00' },
      ],
      rating: 4.9,
      totalReviews: 38,
    },
    {
      userId: tutors[2].id,
      bio: 'English language and literature expert. Helping students improve their writing, reading comprehension, and communication skills.',
      qualifications: ['MA in English Literature', 'TEFL Certified', '12 years experience'],
      subjects: [
        { name: 'English', proficiency: 'expert' },
        { name: 'Literature', proficiency: 'expert' },
        { name: 'Writing', proficiency: 'expert' },
        { name: 'ESL', proficiency: 'expert' },
      ],
      hourlyRate: 40,
      location: {
        type: 'Point',
        coordinates: [-122.3972, 37.7897], // San Francisco
        address: '789 Valencia St, San Francisco, CA 94110',
      },
      demoVideos: ['https://example.com/videos/lisa-english-intro.mp4'],
      availability: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
      ],
      rating: 4.7,
      totalReviews: 52,
    },
    {
      userId: tutors[3].id,
      bio: 'Chemistry tutor passionate about making science accessible. Specializing in organic chemistry and exam preparation.',
      qualifications: ['PhD in Chemistry', 'University Lecturer', '15 years experience'],
      subjects: [
        { name: 'Chemistry', proficiency: 'expert' },
        { name: 'Organic Chemistry', proficiency: 'expert' },
        { name: 'Science', proficiency: 'expert' },
      ],
      hourlyRate: 55,
      location: {
        type: 'Point',
        coordinates: [-118.2437, 34.0522], // Los Angeles
        address: '321 Wilshire Blvd, Los Angeles, CA 90010',
      },
      demoVideos: ['https://example.com/videos/james-chemistry-intro.mp4'],
      availability: [
        { dayOfWeek: 2, startTime: '13:00', endTime: '19:00' },
        { dayOfWeek: 3, startTime: '13:00', endTime: '19:00' },
        { dayOfWeek: 4, startTime: '13:00', endTime: '19:00' },
        { dayOfWeek: 5, startTime: '13:00', endTime: '19:00' },
      ],
      rating: 4.6,
      totalReviews: 29,
    },
    {
      userId: tutors[4].id,
      bio: 'Biology teacher with a focus on making life sciences engaging and understandable. Great with high school and college students.',
      qualifications: ['MSc in Biology', 'AP Biology Teacher', '7 years experience'],
      subjects: [
        { name: 'Biology', proficiency: 'expert' },
        { name: 'Science', proficiency: 'expert' },
        { name: 'Anatomy', proficiency: 'intermediate' },
      ],
      hourlyRate: 42,
      location: {
        type: 'Point',
        coordinates: [-118.2851, 34.0224], // Los Angeles
        address: '654 Broadway, Los Angeles, CA 90012',
      },
      demoVideos: ['https://example.com/videos/sophia-biology-intro.mp4'],
      availability: [
        { dayOfWeek: 1, startTime: '15:00', endTime: '21:00' },
        { dayOfWeek: 3, startTime: '15:00', endTime: '21:00' },
        { dayOfWeek: 4, startTime: '15:00', endTime: '21:00' },
        { dayOfWeek: 6, startTime: '11:00', endTime: '17:00' },
        { dayOfWeek: 0, startTime: '11:00', endTime: '17:00' },
      ],
      rating: 4.9,
      totalReviews: 41,
    },
  ]);
  console.log(`✅ Created ${tutorProfiles.length} tutor profiles in MongoDB`);

  // Create some bookings
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(10, 0, 0, 0);

  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastWeek.setHours(15, 0, 0, 0);

  const bookings = await Promise.all([
    // Confirmed booking
    prisma.booking.create({
      data: {
        tutorId: tutors[0].id,
        studentId: students[0].id,
        subject: 'Calculus',
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hour later
        status: 'confirmed',
        totalAmount: 50,
      },
    }),
    // Pending booking
    prisma.booking.create({
      data: {
        tutorId: tutors[1].id,
        studentId: students[1].id,
        subject: 'Physics',
        startTime: nextWeek,
        endTime: new Date(nextWeek.getTime() + 90 * 60 * 1000), // 1.5 hours later
        status: 'pending',
        totalAmount: 67.5,
      },
    }),
    // Completed booking
    prisma.booking.create({
      data: {
        tutorId: tutors[2].id,
        studentId: students[0].id,
        subject: 'English Literature',
        startTime: lastWeek,
        endTime: new Date(lastWeek.getTime() + 60 * 60 * 1000),
        status: 'completed',
        totalAmount: 40,
      },
    }),
  ]);
  console.log(`✅ Created ${bookings.length} bookings`);

  // Create payments for confirmed and completed bookings
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        bookingId: bookings[0].id,
        stripePaymentId: 'pi_test_confirmed_123',
        amount: 50,
        currency: 'USD',
        status: 'succeeded',
      },
    }),
    prisma.payment.create({
      data: {
        bookingId: bookings[2].id,
        stripePaymentId: 'pi_test_completed_456',
        amount: 40,
        currency: 'USD',
        status: 'succeeded',
      },
    }),
  ]);
  console.log(`✅ Created ${payments.length} payments`);

  // Update bookings with payment IDs
  await prisma.booking.update({
    where: { id: bookings[0].id },
    data: { paymentId: payments[0].id },
  });
  await prisma.booking.update({
    where: { id: bookings[2].id },
    data: { paymentId: payments[1].id },
  });

  // Create reviews for completed booking
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        tutorId: tutors[2].id,
        studentId: students[0].id,
        bookingId: bookings[2].id,
        rating: 5,
        comment: 'Excellent tutor! Very patient and knowledgeable. Helped me understand complex literature concepts easily.',
      },
    }),
  ]);
  console.log(`✅ Created ${reviews.length} reviews`);

  // Create some messages
  // Generate conversation IDs (using crypto for UUID v4)
  const crypto = require('crypto');
  const conversation1Id = crypto.randomUUID();
  const conversation2Id = crypto.randomUUID();

  const messages = await Promise.all([
    prisma.message.create({
      data: {
        conversationId: conversation1Id,
        senderId: students[0].id,
        receiverId: tutors[0].id,
        message: 'Hi Emma! Looking forward to our calculus session tomorrow.',
        read: true,
      },
    }),
    prisma.message.create({
      data: {
        conversationId: conversation1Id,
        senderId: tutors[0].id,
        receiverId: students[0].id,
        message: 'Hello John! Me too. Please bring your textbook and any specific questions you have.',
        read: true,
      },
    }),
    prisma.message.create({
      data: {
        conversationId: conversation2Id,
        senderId: students[1].id,
        receiverId: tutors[1].id,
        message: 'Can we focus on quantum mechanics in our next session?',
        read: false,
      },
    }),
  ]);
  console.log(`✅ Created ${messages.length} messages`);

  // Create notifications
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: students[0].id,
        type: 'booking',
        title: 'Booking Confirmed',
        message: 'Your calculus session with Emma Wilson has been confirmed for tomorrow at 2:00 PM.',
        read: true,
        metadata: { bookingId: bookings[0].id },
      },
    }),
    prisma.notification.create({
      data: {
        userId: tutors[0].id,
        type: 'booking',
        title: 'New Booking',
        message: 'John Student has booked a calculus session with you for tomorrow at 2:00 PM.',
        read: true,
        metadata: { bookingId: bookings[0].id },
      },
    }),
    prisma.notification.create({
      data: {
        userId: students[1].id,
        type: 'booking',
        title: 'Booking Pending',
        message: 'Your physics session booking is pending payment confirmation.',
        read: false,
        metadata: { bookingId: bookings[1].id },
      },
    }),
    prisma.notification.create({
      data: {
        userId: tutors[1].id,
        type: 'message',
        title: 'New Message',
        message: 'You have a new message from Sarah Learner.',
        read: false,
        metadata: { messageId: messages[2].id },
      },
    }),
  ]);
  console.log(`✅ Created ${notifications.length} notifications`);

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Admin users: 1`);
  console.log(`   - Student users: ${students.length}`);
  console.log(`   - Tutor users: ${tutors.length}`);
  console.log(`   - Tutor profiles: ${tutorProfiles.length}`);
  console.log(`   - Bookings: ${bookings.length}`);
  console.log(`   - Payments: ${payments.length}`);
  console.log(`   - Reviews: ${reviews.length}`);
  console.log(`   - Messages: ${messages.length}`);
  console.log(`   - Notifications: ${notifications.length}`);
  console.log('\n🔐 Test credentials:');
  console.log('   Email: admin@tutorgo.com | Password: Password123');
  console.log('   Email: john.student@example.com | Password: Password123');
  console.log('   Email: emma.math@example.com | Password: Password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await mongoose.disconnect();
  });
