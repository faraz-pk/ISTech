const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const app = express();

// Middleware
// DEPLOYMENT NOTE: Update CORS origin to allow your production domain
// For example: origin: "https://istech.com" or use environment variable
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // DEPLOYMENT NOTE: Replace localhost origins with your production domain
    // For example: if (origin === "https://istech.com") return callback(null, true);
    // Allow localhost and 127.0.0.1 on any port
    if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// DEPLOYMENT NOTE: Server will listen on PORT from environment or 5001
// In production, hosting providers usually set process.env.PORT automatically
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  // DEPLOYMENT NOTE: This console.log is for development - remove or modify for production
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
