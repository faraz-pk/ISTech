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
// SEND OTP ROUTE
// ============================================
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Valid email is required'
    });
  }

  try {
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

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Delete any existing OTP for this email
      await connection.query('DELETE FROM otps WHERE email = ?', [email.toLowerCase()]);

      // Insert new OTP (expires in 10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await connection.query(
        'INSERT INTO otps (email, otp, expiresAt) VALUES (?, ?, ?)',
        [email.toLowerCase(), otp, expiresAt]
      );

      // Send OTP email
      const sendEmail = require('../utils/sendEmail');
      await sendEmail(
        'ISTech Support',
        email,
        'Your OTP for Signup',
        `Your OTP for signup is: ${otp}. It expires in 10 minutes.`
      );

      return res.status(200).json({
        success: true,
        message: 'OTP sent to your email'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending OTP. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// VERIFY OTP ROUTE
// ============================================
router.post('/verify-otp', async (req, res) => {
  const { email, otp, firstName, lastName, password, phone, courseInterest, learningMode } = req.body;

  if (!email || !validateEmail(email) || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email and OTP are required'
    });
  }

  try {
    const connection = await pool.getConnection();

    try {
      // Get OTP from database
      const [otps] = await connection.query(
        'SELECT otp, expiresAt FROM otps WHERE email = ? AND expiresAt > NOW() ORDER BY createdAt DESC LIMIT 1',
        [email.toLowerCase()]
      );

      if (otps.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'OTP not found or expired'
        });
      }

      if (otps[0].otp !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP'
        });
      }

      // OTP verified, now create account
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

      if (!validatePassword(password)) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters'
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

      // Delete used OTP
      await connection.query('DELETE FROM otps WHERE email = ?', [email.toLowerCase()]);

      // Create JWT token
      const token = jwt.sign(
        { id: userId, email: email.toLowerCase() },
        process.env.JWT_SECRET || 'your_secret_key',
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
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
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying OTP. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// SIGNUP ROUTE (Now just sends OTP)
// ============================================
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, phone, courseInterest, learningMode } = req.body;

  try {
    // Basic validation
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

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Delete any existing OTP for this email
      await connection.query('DELETE FROM otps WHERE email = ?', [email.toLowerCase()]);

      // Insert new OTP (expires in 10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await connection.query(
        'INSERT INTO otps (email, otp, expiresAt) VALUES (?, ?, ?)',
        [email.toLowerCase(), otp, expiresAt]
      );

      // Send OTP email
      const sendEmail = require('../utils/sendEmail');
      await sendEmail(
        'ISTech Support',
        email,
        'Your OTP for Signup',
        `Your OTP for signup is: ${otp}. It expires in 10 minutes.`
      );

      return res.status(200).json({
        success: true,
        message: 'OTP sent to your email. Please verify to complete signup.',
        requiresOtp: true
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during signup. Please try again.',
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
// FORGOT PASSWORD ROUTE
// ============================================
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Valid email is required'
    });
  }

  try {
    const connection = await pool.getConnection();

    try {
      // Check if user exists
      const [users] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [email.toLowerCase()]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email'
        });
      }

      // Generate reset OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Delete any existing OTP for this email
      await connection.query('DELETE FROM otps WHERE email = ?', [email.toLowerCase()]);

      // Insert new OTP (expires in 10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await connection.query(
        'INSERT INTO otps (email, otp, expiresAt) VALUES (?, ?, ?)',
        [email.toLowerCase(), otp, expiresAt]
      );

      // Send reset OTP email
      const sendEmail = require('../utils/sendEmail');
      await sendEmail(
        'ISTech Support',
        email,
        'Password Reset OTP',
        `Your password reset OTP is: ${otp}. It expires in 10 minutes.`
      );

      return res.status(200).json({
        success: true,
        message: 'Password reset OTP sent to your email'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending reset OTP. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// LOGOUT ROUTE
// ============================================
router.post('/logout', (req, res) => {
  // Since JWT is stateless, logout is handled on client side
  // But we can blacklist the token if needed
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
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
