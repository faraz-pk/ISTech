const nodemailer = require("nodemailer");

const subjectLabels = {
  "course-enrollment": "Course Enrollment",
  "erp-project": "ERP Project Inquiry",
  "course-info": "Course Information",
  "career-guidance": "Career Guidance",
  other: "Other",
};

const sendEmail = async (name, recipientEmail, subject, message, userEmail) => {
  const readableSubject = subjectLabels[subject] || subject || "General Inquiry";
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Use userEmail if provided, otherwise use recipientEmail as fallback
  const emailToDisplay = userEmail || recipientEmail;

  const mailOptions = {
    from: `ISTech <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: readableSubject,
    text: `Name: ${name}\nEmail: ${emailToDisplay}\nSubject: ${readableSubject}\nMessage: ${message}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;