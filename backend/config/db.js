const mongoose = require("mongoose");
const dns = require("dns");

// Fix querySrv ECONNREFUSED on local DNS / Windows networks
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      `MongoDB Connected: ${conn.connection.host}`
    );

  } catch (error) {

    console.log(error);

    process.exit(1);

  }
};

module.exports = connectDB;