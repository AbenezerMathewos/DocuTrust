const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security Middleware
// 1. Set security headers
app.use(helmet());

// 2. Prevent NoSQL injection
app.use(mongoSanitize());

// 3. Prevent HTTP Param Pollution
app.use(hpp());

// 4. Rate Limiting (100 requests per 10 mins)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
  message: 'Too many requests from this IP, please try again in 10 minutes.'
});
app.use('/api', limiter);

// Basic Middleware
app.use(cors());
app.use(express.json());

// Route files
const auth = require('./routes/authRoutes');
const documents = require('./routes/documentRoutes');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/documents', documents);
// Routes
app.use('/api/institutions', require('./routes/institutionRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'DocuTrust API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
