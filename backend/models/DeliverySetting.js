const mongoose = require("mongoose");

const deliverySettingSchema = new mongoose.Schema(
  {
    minAmount: {
      type: Number,
      required: true,
    },

    maxAmount: {
      type: Number,
      required: true,
    },

    deliveryCharge: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "DeliverySetting",
  deliverySettingSchema
);