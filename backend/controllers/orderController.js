const Order = require("../models/Order");
const Product = require("../models/Product");
const sendEmail = require("../utils/emailService");
const sendWhatsApp = require("../utils/whatsappService");
const generateInvoice = require("../utils/invoiceGenerator");
const fs = require("fs");
const path = require("path");

const formatItems = (order) => {
  return order.orderItems
    .map(
      (item) =>
        `<li>${item.product?.name || item.product} × ${item.quantity} - ₹${item.price}</li>`
    )
    .join("");
};

const addressHtml = (address) => {
  return `
    <p><b>Name:</b> ${address.fullName}</p>
    <p><b>Phone:</b> ${address.phone}</p>
    <p><b>Address:</b> ${address.address}</p>
    <p><b>City:</b> ${address.city}</p>
    <p><b>State:</b> ${address.state}</p>
    <p><b>Pincode:</b> ${address.pincode}</p>
    <p><b>Country:</b> ${address.country}</p>
  `;
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

    const customerEmailHtml = `
      <h2>Order Confirmed 🎉</h2>
      <p>Hello ${shippingAddress.fullName},</p>
      <p>Your order has been placed successfully.</p>

      <h3>Order Details</h3>
      <p><b>Order ID:</b> ${order._id}</p>
      <p><b>Total Amount:</b> ₹${order.totalPrice}</p>
      <p><b>Payment ID:</b> ${order.paymentInfo?.razorpayPaymentId || "N/A"}</p>

      <h3>Products</h3>
      <ul>${formatItems(order)}</ul>

      <h3>Delivery Address</h3>
      ${addressHtml(order.shippingAddress)}

      <p>We will update you when your order is packed and shipped.</p>
      <p>Thank you for shopping with Sasikumar Electronics.</p>
    `;

    await sendEmail({
      to: req.user.email,
      subject: "Your Sasikumar Electronics Order Confirmed",
      html: customerEmailHtml,
    });

    const adminEmailHtml = `
      <h2>New Order Received 🚨</h2>

      <h3>Customer Details</h3>
      <p><b>Name:</b> ${shippingAddress.fullName}</p>
      <p><b>Email:</b> ${req.user.email}</p>
      <p><b>Phone:</b> ${shippingAddress.phone}</p>

      <h3>Order Details</h3>
      <p><b>Order ID:</b> ${order._id}</p>
      <p><b>Total Amount:</b> ₹${order.totalPrice}</p>
      <p><b>Payment Method:</b> ${order.paymentMethod}</p>
      <p><b>Payment ID:</b> ${order.paymentInfo?.razorpayPaymentId || "N/A"}</p>

      <h3>Products</h3>
      <ul>${formatItems(order)}</ul>

      <h3>Delivery Address</h3>
      ${addressHtml(order.shippingAddress)}
    `;

    await sendEmail({
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: "New Order Received - Sasikumar Electronics",
      html: adminEmailHtml,
    });

    await sendWhatsApp({
      phone: order.shippingAddress.phone,
      orderId: order._id,
      amount: order.totalPrice,
      status: "Processing",
    });

    if (process.env.ADMIN_PHONE) {
      await sendWhatsApp({
        phone: process.env.ADMIN_PHONE,
        orderId: order._id,
        amount: order.totalPrice,
        status: "New Order",
      });
    }

    res.status(201).json({
      success: true,
      message:
        "Order created successfully. Customer email, admin email and WhatsApp notifications sent.",
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
    let order = await Order.findById(req.params.id)
      .populate("user")
      .populate("orderItems.product");

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

    if (req.body.status === "Cancelled") {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product._id);

        if (product) {
          product.stock = product.stock + item.quantity;
          await product.save();
        }
      }
    }

    await order.save();

    const statusEmailHtml = `
      <h2>Order Status Updated</h2>
      <p>Hello ${order.shippingAddress.fullName},</p>
      <p>Your order status has been updated.</p>

      <p><b>Order ID:</b> ${order._id}</p>
      <p><b>New Status:</b> ${order.orderStatus}</p>
      <p><b>Message:</b> ${
        req.body.message || `Order status updated to ${req.body.status}`
      }</p>

      <h3>Products</h3>
      <ul>${formatItems(order)}</ul>

      <p>Thank you for shopping with Sasikumar Electronics.</p>
    `;

    await sendEmail({
      to: order.user.email,
      subject: `Order Status Updated - ${order.orderStatus}`,
      html: statusEmailHtml,
    });

    await sendWhatsApp({
      phone: order.shippingAddress.phone,
      orderId: order._id,
      amount: order.totalPrice,
      status: order.orderStatus,
    });

    res.status(200).json({
      success: true,
      message:
        "Order status updated. Customer email and WhatsApp sent.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};