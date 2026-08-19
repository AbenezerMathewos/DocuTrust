const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
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

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'DocuTrust API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
