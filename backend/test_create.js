const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/docutrust').then(async () => {
  console.log('Connected. Testing User.create()...');
  try {
    const user = await User.create({
      name: 'Isolated Test',
      email: `isolated_${Date.now()}@test.com`,
      password: 'TestPass123!',
      role: 'admin',
    });
    console.log('User created successfully:', user.name, user.role);
  } catch (e) {
    console.log('Error:', e.message);
  }
  process.exit(0);
});
