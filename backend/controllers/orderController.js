const Order = require("../models/Order");
const Product = require("../models/Product");
const sendEmail = require("../utils/emailService");
const sendWhatsApp = require("../utils/whatsappService");
const generateInvoice = require("../utils/invoiceGenerator");
const fs = require("fs");
const path = require("path");

exports.createOrder = async (req, res) => {
  try {
    for (const item of req.body.orderItems) {
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

    const order = await Order.create({
      ...req.body,
      user: req.user.id,
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
      await product.save();
    }

    const invoicePath = generateInvoice(order);

    if (req.user && req.user.email) {
      await sendEmail({
        to: req.user.email,
        subject: "Order Confirmation",
        html: `
        <h2>Order Placed Successfully</h2>
        <p>Your order has been confirmed.</p>
        <h3>Order ID: ${order._id}</h3>
        <h3>Total Amount: ₹${order.totalPrice}</h3>
        <p>Invoice generated successfully.</p>
        `,
      });
    }

    if (order.shippingAddress && order.shippingAddress.phone) {
      await sendWhatsApp({
        phone: order.shippingAddress.phone,
        orderId: order._id,
        amount: order.totalPrice,
      });
    }

    res.status(201).json({
      success: true,
      message:
        "Order Created, Tracking Started, Stock Updated, Invoice, Email And WhatsApp Sent",
      invoicePath,
      order,
    });
  } catch (error) {
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
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    if (
      order.user.toString() !== req.user.id &&
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
      return res.status(404).json({
        success: false,
        message: "Invoice Not Found",
      });
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
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order Not Found",
      });
    }

    order.orderStatus = req.body.status;

    order.trackingTimeline.push({
      status: req.body.status,
      message:
        req.body.message ||
        `Order status updated to ${req.body.status}`,
    });

    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order Status Updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};