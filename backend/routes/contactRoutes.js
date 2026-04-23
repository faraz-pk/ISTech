const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");

router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    await sendEmail(name, email, subject, message);
    res.json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ message: "Error sending email", error: error.message });
  }
});

module.exports = router;