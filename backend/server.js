const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Basic Middleware (Must be first for CORS)
app.use(cors());
app.use(express.json());

// Security headers via manual X-Content-Type-Options header (helmet incompatible with Express v5)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.removeHeader('X-Powered-By');
  next();
});

// 3. Rate Limiting (1000 requests per 10 mins in dev, 100 in prod)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again in 10 minutes.',
  skip: () => process.env.NODE_ENV !== 'production', // Skip in development
});
app.use('/api', limiter);

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
