const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");
const jwt = require('jsonwebtoken');

router.post("/", async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required to submit contact form" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const { name, email, subject, message } = req.body;

  try {
    await sendEmail(name, process.env.EMAIL_USER, subject, message, email);
    res.json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ message: "Error sending email", error: error.message });
  }
});

module.exports = router;