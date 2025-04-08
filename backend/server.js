require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { syncDatabase } = require('./models');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/authRoutes');
const timeEntryRoutes = require('./routes/timeEntryRoutes');
const userRoutes = require('./routes/userRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Simple CORS setup that will work properly
const corsOptions = {
  origin: ['https://schoonerapp.netlify.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

app.use(cors(corsOptions));

// Enable pre-flight for all routes
app.options('*', cors(corsOptions));

// Add security headers but disable CSP for now
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request origin:', req.headers.origin);
  next();
});

// Database Sync
syncDatabase();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP in the window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Trust proxies for rate limiting to work correctly
app.set('trust proxy', 1);

// Routes
// Test route for password reset
app.get('/test-reset', (req, res) => {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
  console.log('Test password reset link:', resetUrl);
  res.json({ message: 'Reset link generated and logged to console' });
});

// Apply rate limiter before the routes
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/time-entries', timeEntryRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/invitations', invitationRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Time Tracker Backend is Running' });
});

app.use(errorHandler);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Create the public directory if it doesn't exist
  const publicDir = path.join(__dirname, 'public');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Add a simple index.html file
  const indexPath = path.join(publicDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Time Tracker API</title>
      </head>
      <body>
        <h1>Time Tracker API Server</h1>
        <p>This is the backend API server for the Time Tracker application.</p>
      </body>
      </html>
    `);
  }
  
  // Set static folder
  app.use(express.static('public'));
  
  // Serve the React app for any other routes that aren't API routes
  app.get('*', (req, res) => {
    // Only serve the index.html for non-API routes
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
    } else {
      next();
    }
  });
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local network access: http://<your-computer-ip>:${PORT}`);
  console.log(`CORS allowed origins: ${corsOptions.origin.join(', ')}`);
});
