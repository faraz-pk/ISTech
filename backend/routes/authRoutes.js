const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
require('dotenv').config();

// Validation helper
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password && password.length >= 8;
}

// ============================================
// SIGNUP ROUTE
// ============================================
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, phone, courseInterest, learningMode } = req.body;

  try {
    // Validation
    if (!firstName || !firstName.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'First name is required' 
      });
    }

    if (!lastName || !lastName.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Last name is required' 
      });
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid email is required' 
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 8 characters' 
      });
    }

    // Get database connection
    const connection = await pool.getConnection();

    try {
      // Check if user already exists
      const [existingUsers] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [email.toLowerCase()]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({ 
          success: false,
          message: 'Email already registered. Please log in or use a different email.' 
        });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const [result] = await connection.query(
        'INSERT INTO users (firstName, lastName, email, password_hash, phone, courseInterest, learningMode) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          firstName.trim(),
          lastName.trim(),
          email.toLowerCase(),
          passwordHash,
          phone || null,
          courseInterest || null,
          learningMode || null
        ]
      );

      const userId = result.insertId;

      // Create JWT token
      const token = jwt.sign(
        { id: userId, email: email.toLowerCase() },
        process.env.JWT_SECRET || 'your_secret_key',
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Signup successful! You can now log in.',
        token,
        user: {
          id: userId,
          firstName,
          lastName,
          email: email.toLowerCase()
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating account. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// LOGIN ROUTE
// ============================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Get database connection
    const connection = await pool.getConnection();

    try {
      // Find user by email
      const [users] = await connection.query(
        'SELECT id, firstName, lastName, email, password_hash FROM users WHERE email = ?',
        [email.toLowerCase()]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email. Please sign up first.'
        });
      }

      const user = users[0];

      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please try again.'
        });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'your_secret_key',
        { expiresIn: '7d' }
      );

      // Log login activity (optional)
      await connection.query(
        'UPDATE users SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// VERIFY TOKEN ROUTE (Optional but recommended)
// ============================================
router.post('/verify-token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is required'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_secret_key'
    );

    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: decoded
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// ============================================
// GET USER PROFILE (Protected Route Example)
// ============================================
router.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_secret_key'
    );

    const connection = await pool.getConnection();

    try {
      const [users] = await connection.query(
        'SELECT id, firstName, lastName, email, phone, courseInterest, learningMode, createdAt FROM users WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        user: users[0]
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;
