const axios = require("axios");

const sendEmail = async (options) => {
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
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
    }
  );

  console.log("Email Sent:", response.data);
  return response.data;
};

module.exports = sendEmail;