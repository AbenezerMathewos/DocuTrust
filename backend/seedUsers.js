const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/docutrust');
    
    console.log('Connected to MongoDB.');

    // Remove existing test users to prevent duplicate errors
    await User.deleteMany({ email: { $in: ['admin@insa.gov.et', 'aau@university.edu.et', 'student@gmail.com'] } });

    const users = [
      {
        name: 'INSA Root Admin',
        email: 'admin@insa.gov.et',
        password: 'password123',
        role: 'root_admin'
      },
      {
        name: 'Addis Ababa University',
        email: 'aau@university.edu.et',
        password: 'password123',
        role: 'issuer'
      },
      {
        name: 'Abebe Bikila',
        email: 'student@gmail.com',
        password: 'password123',
        role: 'holder',
        studentId: 'STU-12345'
      }
    ];

    await User.create(users);
    console.log('✅ 3 Test Users created successfully!');
    
    console.log('\n--- LOGIN CREDENTIALS ---');
    console.log('1. Admin Dashboard (INSA): admin@insa.gov.et / password123');
    console.log('2. Issuer Dashboard (University): aau@university.edu.et / password123');
    console.log('3. Mobile Wallet (Student): student@gmail.com / password123');
    console.log('-------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
