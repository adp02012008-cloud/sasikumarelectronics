const axios = require("axios");

const sendWhatsApp = async (data) => {
  try {
    if (!data.phone) {
      throw new Error("Phone number is required for WhatsApp message");
    }

    const phone = data.phone.toString().replace("+", "");

    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US",
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log(
      "WhatsApp Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

module.exports = sendWhatsApp;