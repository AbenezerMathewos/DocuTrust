const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/docutrust').then(async () => {
  // Fix 'Admin' -> 'admin' casing
  const result = await mongoose.connection.collection('users').updateMany(
    { role: 'Admin' },
    { $set: { role: 'admin' } }
  );
  console.log('Fixed role casing for', result.modifiedCount, 'user(s)');

  // Show all users
  const users = await mongoose.connection.collection('users').find({}, { projection: { name: 1, email: 1, role: 1 } }).toArray();
  console.log('All users:', JSON.stringify(users, null, 2));
  
  process.exit(0);
});
