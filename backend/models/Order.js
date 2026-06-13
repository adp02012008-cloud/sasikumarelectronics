const mongoose =
require("mongoose");

const orderSchema =
new mongoose.Schema(
  {
    user: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [
      {
        product: {
          type:
            mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },

        quantity: {
          type: Number,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },
      },
    ],

    shippingAddress: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
      phone: String,
    },

    paymentMethod: {
      type: String,
      default: "Razorpay",
    },

    paymentInfo: {

      razorpayOrderId: String,

      razorpayPaymentId: String,

    },

    totalPrice: {
      type: Number,
      required: true,
    },

    orderStatus: {
      type: String,
      enum: [
        "Processing",
        "Packed",
        "Shipped",
        "Out For Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Processing",
    },

    trackingTimeline: [
      {
        status: {
          type: String,
        },

        message: {
          type: String,
        },

        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    paidAt: Date,

    deliveredAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports =
mongoose.model(
  "Order",
  orderSchema
);