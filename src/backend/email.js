import nodemailer from 'nodemailer';
import dotenv from 'dotenv'

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.VITE_API_EMAIL_USER,
    pass: process.env.VITE_API_EMAIL_PASSWORD
  }
});

export const sendPasswordResetEmail = (to, token) => {
  const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Password Reset Request',
    html: `<p>You requsted a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error sending email: ', err);
    }
    else {
      console.log('Email sent: ', info.response);
    }
  });
};