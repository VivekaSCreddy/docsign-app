const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: `"DocSign" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP',
    html: `
      <h2>Password Reset</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP expires in 10 minutes.</p>
    `
  });
};

module.exports = { sendOTP };