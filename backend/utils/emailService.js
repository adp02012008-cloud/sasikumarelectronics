const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "74.125.130.108",
  port: 587,
  secure: false,
  requireTLS: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  tls: {
    servername: "smtp.gmail.com",
    rejectUnauthorized: false,
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

const sendEmail = async (options) => {
  const info = await transporter.sendMail({
    from: `"Sasikumar Electronics" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  console.log("Email Sent:", info.messageId);
  return info;
};

module.exports = sendEmail;