const nodemailer = require("nodemailer");
const axios = require("axios");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  // If custom SMTP host is configured in .env
  if (process.env.EMAIL_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  } else {
    // Standard Gmail service with user + app password
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  return transporter;
};

const sendEmail = async (options) => {
  try {
    if (!options || !options.to) {
      console.log("Email skipped: No recipient address provided.");
      return { skipped: true, reason: "No recipient address" };
    }

    const recipient = String(options.to).trim();
    if (!recipient) {
      console.log("Email skipped: Empty recipient address.");
      return { skipped: true, reason: "Empty recipient address" };
    }

    const fromEmail =
      process.env.EMAIL_USER ||
      process.env.EMAIL_FROM ||
      "sdhivakar2901@gmail.com";
    const fromName = options.fromName || "Sasikumar Electronics";
    const mailFrom = `"${fromName}" <${fromEmail}>`;

    const mailTransporter = getTransporter();

    // 1. Primary: Send via Nodemailer (Gmail or custom SMTP)
    if (mailTransporter) {
      const mailOptions = {
        from: mailFrom,
        to: recipient,
        subject: options.subject || "Sasikumar Electronics Notification",
        html: options.html,
        text:
          options.text ||
          (options.html ? options.html.replace(/<[^>]*>/g, "") : ""),
        attachments: options.attachments || [],
      };

      const info = await mailTransporter.sendMail(mailOptions);
      console.log(
        `Email sent successfully to ${recipient} (Message ID: ${info.messageId})`
      );
      return {
        success: true,
        messageId: info.messageId,
        provider: "nodemailer",
      };
    }

    // 2. Secondary fallback: Brevo API if BREVO_API_KEY is configured
    if (process.env.BREVO_API_KEY) {
      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            name: fromName,
            email: fromEmail,
          },
          to: [{ email: recipient }],
          subject: options.subject,
          htmlContent: options.html,
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`Brevo email sent successfully to ${recipient}`);
      return { success: true, data: response.data, provider: "brevo" };
    }

    console.warn(
      "Email service warning: No credentials configured (EMAIL_USER/EMAIL_PASS or BREVO_API_KEY). Email was skipped."
    );
    return { skipped: true, reason: "No credentials configured" };
  } catch (error) {
    console.error(
      "EMAIL SERVICE ERROR:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = sendEmail;