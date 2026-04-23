const nodemailer = require("nodemailer");

const subjectLabels = {
  "course-enrollment": "Course Enrollment",
  "erp-project": "ERP Project Inquiry",
  "course-info": "Course Information",
  "career-guidance": "Career Guidance",
  other: "Other",
};

const sendEmail = async (name, email, subject, message) => {
  const readableSubject = subjectLabels[subject] || subject || "General Inquiry";
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `ISTech Contact Form <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: readableSubject,
    text: `Name: ${name}\nEmail: ${email}\nSubject: ${readableSubject}\nMessage: ${message}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;