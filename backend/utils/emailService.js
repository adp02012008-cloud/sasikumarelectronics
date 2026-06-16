const axios = require("axios");

const sendEmail = async (options) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is missing in .env");
    }

    if (!process.env.EMAIL_FROM) {
      throw new Error("EMAIL_FROM is missing in .env");
    }

    if (!options.to) {
      throw new Error("Receiver email is missing");
    }

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Sasikumar Electronics",
          email: process.env.EMAIL_FROM,
        },

        to: [
          {
            email: options.to,
          },
        ],

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

    console.log("Brevo Email Sent Successfully");

    return response.data;
  } catch (error) {
    console.log(
      "BREVO EMAIL ERROR:",
      error.response?.data || error.message
    );

    throw error;
  }
};

module.exports = sendEmail;