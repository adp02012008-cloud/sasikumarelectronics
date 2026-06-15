const Order = require("../models/Order");
const Product = require("../models/Product");
const sendEmail = require("../utils/emailService");
const generateInvoice = require("../utils/invoiceGenerator");
const fs = require("fs");
const path = require("path");

const statusFlow = {
  Processing: ["Packed", "Cancelled"],
  Packed: ["Shipped", "Cancelled"],
  Shipped: ["Out For Delivery"],
  "Out For Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

const formatItems = (order) => {
  return order.orderItems
    .map(
      (item) =>
        `<li>${item.product?.name || "Product"} × ${item.quantity} - ₹${item.price}</li>`
    )
    .join("");
};

const safeSendEmail = async (options) => {
  try {
    await sendEmail(options);
    return true;
  } catch (error) {
    console.log("Email Error:", error.message);
    return false;
  }
};

exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentInfo,
      totalPrice,
    } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete delivery address and phone number are required",
      });
    }

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items found",
      });
    }

    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product Not Found",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} only ${product.stock} left`,
        });
      }
    }

    let order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentInfo,
      totalPrice,
      paidAt: Date.now(),
      trackingTimeline: [
        {
          status: "Processing",
          message: "Order placed successfully",
        },
      ],
    });

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);

      product.stock = product.stock - item.quantity;
      product.demand = (product.demand || 0) + item.quantity;

      await product.save();
    }

    order = await Order.findById(order._id)
      .populate("user")
      .populate("orderItems.product");

    const invoicePath = generateInvoice(order);

    await safeSendEmail({
      to: order.user.email,
      subject: "Your Sasikumar Electronics Order Confirmed",
      html: `
        <h2>Order Confirmed</h2>
        <p>Hello ${order.shippingAddress.fullName},</p>
        <p>Your order has been placed successfully.</p>

        <p><b>Order ID:</b> ${order._id}</p>
        <p><b>Total:</b> ₹${order.totalPrice}</p>
        <p><b>Payment ID:</b> ${order.paymentInfo?.razorpayPaymentId || "N/A"}</p>

        <h3>Products</h3>
        <ul>${formatItems(order)}</ul>

        <p>Thank you for shopping with Sasikumar Electronics.</p>
      `,
    });

    await safeSendEmail({
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM,
      subject: "New Order Received - Sasikumar Electronics",
      html: `
        <h2>New Order Received</h2>
        <p><b>Customer:</b> ${order.shippingAddress.fullName}</p>
        <p><b>Email:</b> ${order.user.email}</p>
        <p><b>Phone:</b> ${order.shippingAddress.phone}</p>
        <p><b>Total:</b> ₹${order.totalPrice}</p>

        <h3>Products</h3>
        <ul>${formatItems(order)}</ul>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      invoicePath,
      order,
    });
  } catch (error) {
    console.log("Create Order Error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user")
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user")
      .populate("orderItems.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to view this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user")
      .populate("orderItems.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to download this invoice",
      });
    }

    const invoicePath = path.join(
      __dirname,
      "../invoices",
      `invoice-${req.params.id}.pdf`
    );

    if (!fs.existsSync(invoicePath)) {
      generateInvoice(order);
    }

    res.download(invoicePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const newStatus = req.body.status;

    const existingOrder = await Order.findById(req.params.id)
      .populate("user")
      .populate("orderItems.product");

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    if (existingOrder.orderStatus === newStatus) {
      return res.status(400).json({
        success: false,
        message: `Order is already ${newStatus}`,
      });
    }

    const allowedNext = statusFlow[existingOrder.orderStatus] || [];

    if (!allowedNext.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change from ${existingOrder.orderStatus} to ${newStatus}`,
      });
    }

    if (newStatus === "Cancelled") {
      for (const item of existingOrder.orderItems) {
        const product = await Product.findById(
          item.product?._id || item.product
        );

        if (product) {
          product.stock = product.stock + item.quantity;
          await product.save();
        }
      }
    }

    const updateData = {
      orderStatus: newStatus,
    };

    if (newStatus === "Delivered") {
      updateData.deliveredAt = Date.now();
    }

    let order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateData,
        $push: {
          trackingTimeline: {
            status: newStatus,
            message:
              req.body.message ||
              `Order status updated to ${newStatus}`,
            date: new Date(),
          },
        },
      },
      {
        returnDocument: "after",
        runValidators: false,
      }
    )
      .populate("user")
      .populate("orderItems.product");

    generateInvoice(order);

    await safeSendEmail({
      to: order.user.email,
      subject: `Order Status Updated - ${order.orderStatus}`,
      html: `
        <h2>Order Status Updated</h2>
        <p>Hello ${order.shippingAddress?.fullName || order.user?.name},</p>
        <p>Your order is now <b>${order.orderStatus}</b>.</p>
        <p><b>Order ID:</b> ${order._id}</p>

        <h3>Products</h3>
        <ul>${formatItems(order)}</ul>
      `,
    });

    await safeSendEmail({
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM,
      subject: `Order Updated - ${order.orderStatus}`,
      html: `
        <h2>Order Status Updated</h2>
        <p><b>Order ID:</b> ${order._id}</p>
        <p><b>Status:</b> ${order.orderStatus}</p>
        <p><b>Customer:</b> ${order.shippingAddress?.fullName}</p>
        <p><b>Total:</b> ₹${order.totalPrice}</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.log("Update Status Error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};