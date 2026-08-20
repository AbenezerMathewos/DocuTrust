const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    lowercase: true,   // auto-lowercase on save
  },
}, { timestamps: true });

// Encrypt password using bcrypt (Mongoose v9 async pre-save: do NOT call next())
userSchema.pre('save', async function () {
  console.log('[USER PRE-SAVE] Started. isModified(password)=', this.isModified('password'));
  if (!this.isModified('password')) return;
  console.log('[USER PRE-SAVE] Generating salt...');
  const salt = await bcrypt.genSalt(10);
  console.log('[USER PRE-SAVE] Hashing password...');
  this.password = await bcrypt.hash(this.password, salt);
  console.log('[USER PRE-SAVE] Finished hashing.');
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
