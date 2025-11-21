const nodemailer = require("nodemailer");

const smtpPort = Number(process.env.SMTP_PORT);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,   // smtp.gmail.com
  port: smtpPort,               // 465 o 587
  secure: smtpPort === 465,     // true se 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // app password 16 caratteri
  },
});

module.exports = transporter;
