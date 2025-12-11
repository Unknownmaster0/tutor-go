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

  // Create admin users (3)
  const admins = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@tutorgo.com',
        passwordHash: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'superadmin@tutorgo.com',
        passwordHash: hashedPassword,
        name: 'Super Admin',
        role: 'admin',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'ops@tutorgo.com',
        passwordHash: hashedPassword,
        name: 'Operations Admin',
        role: 'admin',
        emailVerified: true,
      },
    }),
  ]);
  console.log(`✅ Created ${admins.length} admin users`);

  // Create student users (10)
  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.student@example.com',
        passwordHash: hashedPassword,
        name: 'John Student',
        role: 'student',
        phone: '+919810000001',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.learner@example.com',
        passwordHash: hashedPassword,
        name: 'Sarah Learner',
        role: 'student',
        phone: '+919810000002',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.jones@example.com',
        passwordHash: hashedPassword,
        name: 'Mike Jones',
        role: 'student',
        phone: '+919810000003',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'anita.kumar@example.com',
        passwordHash: hashedPassword,
        name: 'Anita Kumar',
        role: 'student',
        phone: '+919810000004',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'rahul.verma@example.com',
        passwordHash: hashedPassword,
        name: 'Rahul Verma',
        role: 'student',
        phone: '+919810000005',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'meera.patel@example.com',
        passwordHash: hashedPassword,
        name: 'Meera Patel',
        role: 'student',
        phone: '+919810000006',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'arjun.singh@example.com',
        passwordHash: hashedPassword,
        name: 'Arjun Singh',
        role: 'student',
        phone: '+919810000007',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'preeti.sharma@example.com',
        passwordHash: hashedPassword,
        name: 'Preeti Sharma',
        role: 'student',
        phone: '+919810000008',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'vikas.gupta@example.com',
        passwordHash: hashedPassword,
        name: 'Vikas Gupta',
        role: 'student',
        phone: '+919810000009',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'isha.narayan@example.com',
        passwordHash: hashedPassword,
        name: 'Isha Narayan',
        role: 'student',
        phone: '+919810000010',
        emailVerified: true,
      },
    }),
  ]);
  console.log(`✅ Created ${students.length} student users`);

  // Create tutor users (30) - many located in India; 10 in different parts of Kolkata
  const tutors = await Promise.all([
    // 1-10: Kolkata region (various neighborhoods)
    prisma.user.create({
      data: {
        email: 'emma.kolkata1@example.com',
        passwordHash: hashedPassword,
        name: 'Emma Roy (Park Street)',
        role: 'tutor',
        phone: '+919820000011',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'ankit.kolkata2@example.com',
        passwordHash: hashedPassword,
        name: 'Ankit Banerjee (Salt Lake)',
        role: 'tutor',
        phone: '+919820000012',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'neha.kolkata3@example.com',
        passwordHash: hashedPassword,
        name: 'Neha Das (Lake Town)',
        role: 'tutor',
        phone: '+919820000013',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'arvind.kolkata4@example.com',
        passwordHash: hashedPassword,
        name: 'Arvind Mukherjee (Garia)',
        role: 'tutor',
        phone: '+919820000014',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'maya.kolkata5@example.com',
        passwordHash: hashedPassword,
        name: 'Maya Sen (New Alipore)',
        role: 'tutor',
        phone: '+919820000015',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'suman.kolkata6@example.com',
        passwordHash: hashedPassword,
        name: 'Suman Pal (Behala)',
        role: 'tutor',
        phone: '+919820000016',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'ritu.kolkata7@example.com',
        passwordHash: hashedPassword,
        name: 'Ritu Ghosh (Baranagar)',
        role: 'tutor',
        phone: '+919820000017',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sanjoy.kolkata8@example.com',
        passwordHash: hashedPassword,
        name: 'Sanjoy Chatterjee (Howrah)',
        role: 'tutor',
        phone: '+919820000018',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'priya.kolkata9@example.com',
        passwordHash: hashedPassword,
        name: 'Priya Nair (Dum Dum)',
        role: 'tutor',
        phone: '+919820000019',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'rajiv.kolkata10@example.com',
        passwordHash: hashedPassword,
        name: 'Rajiv Roy (Beliaghata)',
        role: 'tutor',
        phone: '+919820000020',
        emailVerified: true,
      },
    }),
    // 11-30: other Indian cities
    prisma.user.create({
      data: {
        email: 'david.delhi@example.com',
        passwordHash: hashedPassword,
        name: 'David Mehra (Delhi)',
        role: 'tutor',
        phone: '+919830000021',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'lisa.mumbai@example.com',
        passwordHash: hashedPassword,
        name: 'Lisa Fernandes (Mumbai)',
        role: 'tutor',
        phone: '+919830000022',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'james.bengaluru@example.com',
        passwordHash: hashedPassword,
        name: 'James R (Bengaluru)',
        role: 'tutor',
        phone: '+919830000023',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sophia.chennai@example.com',
        passwordHash: hashedPassword,
        name: 'Sophia K (Chennai)',
        role: 'tutor',
        phone: '+919830000024',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'rohit.hyderabad@example.com',
        passwordHash: hashedPassword,
        name: 'Rohit Sharma (Hyderabad)',
        role: 'tutor',
        phone: '+919830000025',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'anita.pune@example.com',
        passwordHash: hashedPassword,
        name: 'Anita Deshmukh (Pune)',
        role: 'tutor',
        phone: '+919830000026',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'vikram.ahmedabad@example.com',
        passwordHash: hashedPassword,
        name: 'Vikram Patel (Ahmedabad)',
        role: 'tutor',
        phone: '+919830000027',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jaya.jaipur@example.com',
        passwordHash: hashedPassword,
        name: 'Jaya Mehra (Jaipur)',
        role: 'tutor',
        phone: '+919830000028',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sameer.lucknow@example.com',
        passwordHash: hashedPassword,
        name: 'Sameer Khan (Lucknow)',
        role: 'tutor',
        phone: '+919830000029',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'neel.bhopal@example.com',
        passwordHash: hashedPassword,
        name: 'Neel Verma (Bhopal)',
        role: 'tutor',
        phone: '+919830000030',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'tara.indore@example.com',
        passwordHash: hashedPassword,
        name: 'Tara Singh (Indore)',
        role: 'tutor',
        phone: '+919830000031',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'kumar.trivandrum@example.com',
        passwordHash: hashedPassword,
        name: 'Kumar (Thiruvananthapuram)',
        role: 'tutor',
        phone: '+919830000032',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'ritu.coimbatore@example.com',
        passwordHash: hashedPassword,
        name: 'Ritu (Coimbatore)',
        role: 'tutor',
        phone: '+919830000033',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'manish.nagpur@example.com',
        passwordHash: hashedPassword,
        name: 'Manish (Nagpur)',
        role: 'tutor',
        phone: '+919830000034',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'pooja.varanasi@example.com',
        passwordHash: hashedPassword,
        name: 'Pooja (Varanasi)',
        role: 'tutor',
        phone: '+919830000035',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'arun.surat@example.com',
        passwordHash: hashedPassword,
        name: 'Arun (Surat)',
        role: 'tutor',
        phone: '+919830000036',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'divya.guwahati@example.com',
        passwordHash: hashedPassword,
        name: 'Divya (Guwahati)',
        role: 'tutor',
        phone: '+919830000037',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'kiran.rajkot@example.com',
        passwordHash: hashedPassword,
        name: 'Kiran (Rajkot)',
        role: 'tutor',
        phone: '+919830000038',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sana.patna@example.com',
        passwordHash: hashedPassword,
        name: 'Sana (Patna)',
        role: 'tutor',
        phone: '+919830000039',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'anuj.rajkot@example.com',
        passwordHash: hashedPassword,
        name: 'Anuj (Rajkot)',
        role: 'tutor',
        phone: '+919830000040',
        emailVerified: true,
      },
    }),
  ]);
  console.log(`✅ Created ${tutors.length} tutor users`);

  // Create tutor profiles in MongoDB (30 profiles)
  // Coordinates are GeoJSON [longitude, latitude]
  const tutorProfilesInput = [
    // Kolkata tutors (1-10)
    {
      userId: tutors[0].id,
      bio: 'Experienced Mathematics tutor focusing on Class 11-12 and JEE basics. Friendly and exam-focused.',
      qualifications: ['MSc Mathematics', '5 years experience'],
      subjects: [
        { name: 'Mathematics', proficiency: 'expert' },
        { name: 'Algebra', proficiency: 'expert' },
      ],
      hourlyRate: 700,
      location: {
        type: 'Point',
        coordinates: [88.362, 22.545], // Park Street approximate
        address: 'Park Street, Kolkata, West Bengal, India',
      },
      demoVideos: [],
      availability: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
      ],
      rating: 4.7,
      totalReviews: 32,
    },
    {
      userId: tutors[1].id,
      bio: 'Physics tutor with a knack for visual explanations. Great for board and competitive exam prep.',
      qualifications: ['BTech (Physics)', '8 years experience'],
      subjects: [
        { name: 'Physics', proficiency: 'expert' },
        { name: 'Mathematics', proficiency: 'intermediate' },
      ],
      hourlyRate: 650,
      location: {
        type: 'Point',
        coordinates: [88.4292, 22.5807], // Salt Lake approx
        address: 'Salt Lake, Kolkata, West Bengal, India',
      },
      demoVideos: [],
      availability: [
        { dayOfWeek: 2, startTime: '14:00', endTime: '20:00' },
        { dayOfWeek: 4, startTime: '14:00', endTime: '20:00' },
      ],
      rating: 4.8,
      totalReviews: 40,
    },
    {
      userId: tutors[2].id,
      bio: 'English language and communication coach. Focus on grammar, writing, and interview prep.',
      qualifications: ['MA English', 'TEFL'],
      subjects: [
        { name: 'English', proficiency: 'expert' },
        { name: 'Spoken English', proficiency: 'expert' },
      ],
      hourlyRate: 600,
      location: {
        type: 'Point',
        coordinates: [88.3935, 22.62], // Lake Town approximate
        address: 'Lake Town, Kolkata, West Bengal, India',
      },
      demoVideos: [],
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '13:00' },
        { dayOfWeek: 5, startTime: '16:00', endTime: '20:00' },
      ],
      rating: 4.6,
      totalReviews: 28,
    },
    {
      userId: tutors[3].id,
      bio: 'Chemistry expert (organic)—helps students with concepts and problem solving for boards and NEET.',
      qualifications: ['MSc Chemistry', '7 years experience'],
      subjects: [
        { name: 'Chemistry', proficiency: 'expert' },
        { name: 'Organic Chemistry', proficiency: 'expert' },
      ],
      hourlyRate: 800,
      location: {
        type: 'Point',
        coordinates: [88.3926, 22.4723], // Garia approximate
        address: 'Garia, Kolkata, West Bengal, India',
      },
      demoVideos: [],
      availability: [
        { dayOfWeek: 2, startTime: '13:00', endTime: '19:00' },
        { dayOfWeek: 4, startTime: '13:00', endTime: '19:00' },
      ],
      rating: 4.9,
      totalReviews: 55,
    },
    {
      userId: tutors[4].id,
      bio: 'Biology teacher with strong experience in NEET and CBSE boards.',
      qualifications: ['MSc Biology', 'NEET Trainer'],
      subjects: [
        { name: 'Biology', proficiency: 'expert' },
        { name: 'Anatomy', proficiency: 'intermediate' },
      ],
      hourlyRate: 750,
      location: {
        type: 'Point',
        coordinates: [88.3426, 22.5162], // New Alipore approximate
        address: 'New Alipore, Kolkata, West Bengal, India',
      },
      demoVideos: [],
      availability: [
        { dayOfWeek: 1, startTime: '15:00', endTime: '21:00' },
        { dayOfWeek: 3, startTime: '15:00', endTime: '21:00' },
      ],
      rating: 4.8,
      totalReviews: 44,
    },
    {
      userId: tutors[5].id,
      bio: 'Maths tutor for middle/high school with interactive sessions and worksheets.',
      qualifications: ['BSc Math', 'Teaching Certificate'],
      subjects: [
        { name: 'Mathematics', proficiency: 'expert' },
        { name: 'Trigonometry', proficiency: 'expert' },
      ],
      hourlyRate: 550,
      location: {
        type: 'Point',
        coordinates: [88.2952, 22.4988], // Behala approximate
        address: 'Behala, Kolkata, West Bengal, India',
      },
      demoVideos: [],
      availability: [
        { dayOfWeek: 2, startTime: '10:00', endTime: '14:00' },
        { dayOfWeek: 6, startTime: '10:00', endTime: '14:00' },
      ],
      rating: 4.5,
      totalReviews: 19,
    },
    {
      userId: tutors[6].id,
      bio: 'Experienced tutor for humanities and language arts.',
      qualifications: ['MA History', '10 years experience'],
      subjects: [
        { name: 'History', proficiency: 'expert' },
        { name: 'Social Science', proficiency: 'expert' },
      ],
      hourlyRate: 500,
      location: {
        type: 'Point',
        coordinates: [88.3665, 22.651], // Baranagar approximate
        address: 'Baranagar, Kolkata, West Bengal, India',
      },
      demoVideos: [],
      availability: [
        { dayOfWeek: 1, startTime: '11:00', endTime: '17:00' },
        { dayOfWeek: 5, startTime: '11:00', endTime: '17:00' },
      ],
      rating: 4.6,
      totalReviews: 22,
    },
    {
      userId: tutors[7].id,
      bio: 'Physics and maths tutor specialising in concept clarity and problem solving.',
      qualifications: ['MSc Physics'],
      subjects: [
        { name: 'Physics', proficiency: 'expert' },
        { name: 'Mathematics', proficiency: 'expert' },
      ],
      hourlyRate: 700,
      location: {
        type: 'Point',
        coordinates: [88.2636, 22.5958], // Howrah approximate
        address: 'Howrah, West Bengal, India',
      },
      demoVideos: [],
      availability: [
        { dayOfWeek: 3, startTime: '14:00', endTime: '20:00' },
        { dayOfWeek: 6, startTime: '10:00', endTime: '14:00' },
      ],
      rating: 4.7,
      totalReviews: 30,
    },
    {
      userId: tutors[8].id,
      bio: 'English grammar and writing skills specialist for school and college levels.',
      qualifications: ['MA English', 'TEFL'],
      subjects: [
        { name: 'English', proficiency: 'expert' },
        { name: 'Writing', proficiency: 'expert' },
      ],
      hourlyRate: 600,
      location: {
        type: 'Point',
        coordinates: [88.4121, 22.59], // Dum Dum approximate
        address: 'Dum Dum, Kolkata, West Bengal, India',
      },
      demoVideos: [],
      availability: [
        { dayOfWeek: 2, startTime: '09:00', endTime: '13:00' },
        { dayOfWeek: 4, startTime: '16:00', endTime: '20:00' },
      ],
      rating: 4.6,
      totalReviews: 27,
    },
    {
      userId: tutors[9].id,
      bio: 'Competitive exam tutor—quick tricks for boards and entrance tests.',
      qualifications: ['BEd', '8 years experience'],
      subjects: [
        { name: 'Mathematics', proficiency: 'expert' },
        { name: 'Reasoning', proficiency: 'expert' },
      ],
      hourlyRate: 650,
      location: {
        type: 'Point',
        coordinates: [88.3768, 22.56], // Beliaghata approximate
        address: 'Beliaghata, Kolkata, West Bengal, India',
      },
      demoVideos: [],
      availability: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' },
      ],
      rating: 4.5,
      totalReviews: 18,
    },

    // Other Indian cities (11-30)
    {
      userId: tutors[10].id,
      bio: 'Mathematics tutor in Delhi focusing on School + JEE foundation.',
      qualifications: ['MSc Math', '6 years experience'],
      subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
      hourlyRate: 850,
      location: {
        type: 'Point',
        coordinates: [77.1025, 28.7041],
        address: 'Connaught Place, New Delhi, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }],
      rating: 4.8,
      totalReviews: 60,
    },
    {
      userId: tutors[11].id,
      bio: 'Physics tutor in Mumbai with practical examples and exam techniques.',
      qualifications: ['BTech Physics', '7 years experience'],
      subjects: [{ name: 'Physics', proficiency: 'expert' }],
      hourlyRate: 900,
      location: {
        type: 'Point',
        coordinates: [72.8777, 19.076],
        address: 'Colaba, Mumbai, Maharashtra, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 4, startTime: '15:00', endTime: '20:00' }],
      rating: 4.7,
      totalReviews: 42,
    },
    {
      userId: tutors[12].id,
      bio: 'Computer Science tutor (programming) for school and college students.',
      qualifications: ['MTech CS', '10 years experience'],
      subjects: [
        { name: 'Computer Science', proficiency: 'expert' },
        { name: 'JavaScript', proficiency: 'expert' },
      ],
      hourlyRate: 1000,
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716],
        address: 'MG Road, Bengaluru, Karnataka, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 1, startTime: '10:00', endTime: '18:00' }],
      rating: 4.9,
      totalReviews: 120,
    },
    {
      userId: tutors[13].id,
      bio: 'English literature and writing coach based in Chennai.',
      qualifications: ['MA English', '12 years experience'],
      subjects: [
        { name: 'English', proficiency: 'expert' },
        { name: 'Literature', proficiency: 'expert' },
      ],
      hourlyRate: 700,
      location: {
        type: 'Point',
        coordinates: [80.2707, 13.0827],
        address: 'T. Nagar, Chennai, Tamil Nadu, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 3, startTime: '10:00', endTime: '18:00' }],
      rating: 4.6,
      totalReviews: 35,
    },
    {
      userId: tutors[14].id,
      bio: 'Biology and life sciences tutor (NEET-focused) in Hyderabad.',
      qualifications: ['MSc Biology', '5 years'],
      subjects: [{ name: 'Biology', proficiency: 'expert' }],
      hourlyRate: 850,
      location: {
        type: 'Point',
        coordinates: [78.4867, 17.385],
        address: 'Banjara Hills, Hyderabad, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 2, startTime: '14:00', endTime: '20:00' }],
      rating: 4.8,
      totalReviews: 48,
    },
    {
      userId: tutors[15].id,
      bio: 'Physics and Maths tutor in Pune with strong concept-first approach.',
      qualifications: ['BTech', '8 years experience'],
      subjects: [
        { name: 'Physics', proficiency: 'expert' },
        { name: 'Mathematics', proficiency: 'expert' },
      ],
      hourlyRate: 750,
      location: {
        type: 'Point',
        coordinates: [73.8567, 18.5204],
        address: 'Koregaon Park, Pune, Maharashtra, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 5, startTime: '10:00', endTime: '16:00' }],
      rating: 4.7,
      totalReviews: 31,
    },
    {
      userId: tutors[16].id,
      bio: 'Mathematics instructor in Ahmedabad with focus on problem solving.',
      qualifications: ['MSc Math'],
      subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
      hourlyRate: 650,
      location: {
        type: 'Point',
        coordinates: [72.5714, 23.0225],
        address: 'Satellite, Ahmedabad, Gujarat, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '15:00' }],
      rating: 4.5,
      totalReviews: 20,
    },
    {
      userId: tutors[17].id,
      bio: 'History and Civics tutor—works well with social science students.',
      qualifications: ['MA History'],
      subjects: [{ name: 'History', proficiency: 'expert' }],
      hourlyRate: 500,
      location: {
        type: 'Point',
        coordinates: [75.7873, 26.9124],
        address: 'C-Scheme, Jaipur, Rajasthan, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 3, startTime: '11:00', endTime: '17:00' }],
      rating: 4.4,
      totalReviews: 16,
    },
    {
      userId: tutors[18].id,
      bio: 'Chemistry tutor in Lucknow experienced with board exam strategies.',
      qualifications: ['MSc Chemistry'],
      subjects: [{ name: 'Chemistry', proficiency: 'expert' }],
      hourlyRate: 600,
      location: {
        type: 'Point',
        coordinates: [80.9462, 26.8467],
        address: 'Hazratganj, Lucknow, Uttar Pradesh, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 2, startTime: '14:00', endTime: '20:00' }],
      rating: 4.6,
      totalReviews: 25,
    },
    {
      userId: tutors[19].id,
      bio: 'General science tutor in Bhopal; approachable and patient teaching style.',
      qualifications: ['MSc Life Sciences'],
      subjects: [{ name: 'Science', proficiency: 'expert' }],
      hourlyRate: 500,
      location: {
        type: 'Point',
        coordinates: [77.4126, 23.2599],
        address: 'Madhya Pradesh, Bhopal, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 6, startTime: '09:00', endTime: '13:00' }],
      rating: 4.3,
      totalReviews: 12,
    },
    {
      userId: tutors[20].id,
      bio: 'Mathematics & Reasoning for competitive exams in Indore.',
      qualifications: ['BEd', '7 years experience'],
      subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
      hourlyRate: 550,
      location: {
        type: 'Point',
        coordinates: [75.8577, 22.7196],
        address: 'Indore, Madhya Pradesh, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 1, startTime: '10:00', endTime: '16:00' }],
      rating: 4.5,
      totalReviews: 15,
    },
    {
      userId: tutors[21].id,
      bio: 'Science tutor in Thiruvananthapuram with strong doubt clearing sessions.',
      qualifications: ['MSc Science'],
      subjects: [{ name: 'Science', proficiency: 'expert' }],
      hourlyRate: 450,
      location: {
        type: 'Point',
        coordinates: [76.9366, 8.5241],
        address: 'Thiruvananthapuram, Kerala, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 4, startTime: '10:00', endTime: '14:00' }],
      rating: 4.4,
      totalReviews: 11,
    },
    {
      userId: tutors[22].id,
      bio: 'Maths tutor in Coimbatore focusing on concept building.',
      qualifications: ['MSc Mathematics'],
      subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
      hourlyRate: 480,
      location: {
        type: 'Point',
        coordinates: [76.956, 11.0168],
        address: 'Coimbatore, Tamil Nadu, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 2, startTime: '09:00', endTime: '13:00' }],
      rating: 4.2,
      totalReviews: 9,
    },
    {
      userId: tutors[23].id,
      bio: 'Physics tutor in Nagpur with patient teaching style.',
      qualifications: ['MSc Physics'],
      subjects: [{ name: 'Physics', proficiency: 'expert' }],
      hourlyRate: 450,
      location: {
        type: 'Point',
        coordinates: [79.0882, 21.1458],
        address: 'Nagpur, Maharashtra, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 5, startTime: '15:00', endTime: '20:00' }],
      rating: 4.3,
      totalReviews: 10,
    },
    {
      userId: tutors[24].id,
      bio: 'Humanities tutor in Varanasi, good with spoken English and communication.',
      qualifications: ['MA English'],
      subjects: [{ name: 'English', proficiency: 'expert' }],
      hourlyRate: 400,
      location: {
        type: 'Point',
        coordinates: [82.9739, 25.3176],
        address: 'Varanasi, Uttar Pradesh, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 3, startTime: '10:00', endTime: '14:00' }],
      rating: 4.1,
      totalReviews: 8,
    },
    {
      userId: tutors[25].id,
      bio: 'Mathematics tutor in Surat, board and school exam specialist.',
      qualifications: ['BSc Math'],
      subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
      hourlyRate: 420,
      location: {
        type: 'Point',
        coordinates: [72.8311, 21.1702],
        address: 'Surat, Gujarat, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 1, startTime: '10:00', endTime: '15:00' }],
      rating: 4.2,
      totalReviews: 7,
    },
    {
      userId: tutors[26].id,
      bio: 'Science and maths tutor in Guwahati with flexible hours.',
      qualifications: ['MSc Science'],
      subjects: [{ name: 'Science', proficiency: 'expert' }],
      hourlyRate: 380,
      location: {
        type: 'Point',
        coordinates: [91.7362, 26.1445],
        address: 'Guwahati, Assam, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 6, startTime: '09:00', endTime: '13:00' }],
      rating: 4.0,
      totalReviews: 6,
    },
    {
      userId: tutors[27].id,
      bio: 'General tutor in Rajkot covering school subjects and basic programming.',
      qualifications: ['BEd'],
      subjects: [
        { name: 'Mathematics', proficiency: 'intermediate' },
        { name: 'Computer Science', proficiency: 'intermediate' },
      ],
      hourlyRate: 350,
      location: {
        type: 'Point',
        coordinates: [70.8022, 22.3039],
        address: 'Rajkot, Gujarat, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 2, startTime: '10:00', endTime: '14:00' }],
      rating: 4.0,
      totalReviews: 5,
    },
    {
      userId: tutors[28].id,
      bio: 'Mathematics tutor in Patna with strong foundation building.',
      qualifications: ['MSc Math'],
      subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
      hourlyRate: 370,
      location: {
        type: 'Point',
        coordinates: [85.1376, 25.5941],
        address: 'Patna, Bihar, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 4, startTime: '11:00', endTime: '17:00' }],
      rating: 4.1,
      totalReviews: 6,
    },
    {
      userId: tutors[29].id,
      bio: 'Focused tutor in Rajkot region with experience in school exams.',
      qualifications: ['BSc', '3 years experience'],
      subjects: [{ name: 'Science', proficiency: 'intermediate' }],
      hourlyRate: 340,
      location: {
        type: 'Point',
        coordinates: [70.8089, 22.3039],
        address: 'Rajkot outskirts, Gujarat, India',
      },
      demoVideos: [],
      availability: [{ dayOfWeek: 5, startTime: '09:00', endTime: '13:00' }],
      rating: 4.0,
      totalReviews: 4,
    },
  ];

  const tutorProfiles = await TutorProfile.insertMany(tutorProfilesInput);
  console.log(`✅ Created ${tutorProfiles.length} tutor profiles in MongoDB`);

  // Create some bookings (reusing earlier pattern, but referencing new users)
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
    // Confirmed booking between students[0] and tutors[0]
    prisma.booking.create({
      data: {
        tutorId: tutors[0].id,
        studentId: students[0].id,
        subject: 'Calculus',
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hour later
        status: 'confirmed',
        totalAmount: 700,
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
        totalAmount: 975,
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
        totalAmount: 600,
      },
    }),
  ]);
  console.log(`✅ Created ${bookings.length} bookings`);

  // Create payments for confirmed and completed bookings
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        bookingId: bookings[0].id,
        stripePaymentId: 'pi_india_confirmed_001',
        amount: 700,
        currency: 'INR',
        status: 'succeeded',
      },
    }),
    prisma.payment.create({
      data: {
        bookingId: bookings[2].id,
        stripePaymentId: 'pi_india_completed_002',
        amount: 600,
        currency: 'INR',
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
        comment:
          'Excellent tutor! Very patient and knowledgeable. Helped me understand complex literature concepts easily.',
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
        message:
          'Hello John! Me too. Please bring your textbook and any specific questions you have.',
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
        message:
          'Your calculus session with Emma Roy has been confirmed for tomorrow at 2:00 PM IST.',
        read: true,
        metadata: { bookingId: bookings[0].id },
      },
    }),
    prisma.notification.create({
      data: {
        userId: tutors[0].id,
        type: 'booking',
        title: 'New Booking',
        message: 'John Student has booked a calculus session with you for tomorrow at 2:00 PM IST.',
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
  console.log(`   - Admin users: ${admins.length}`);
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
  console.log('   Email: emma.kolkata1@example.com | Password: Password123');
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
