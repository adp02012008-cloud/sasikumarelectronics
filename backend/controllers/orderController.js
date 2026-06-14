const Order = require("../models/Order");
const Product = require("../models/Product");
const sendEmail = require("../utils/emailService");
const generateInvoice = require("../utils/invoiceGenerator");
const fs = require("fs");
const path = require("path");

const formatItems = (order) => {
  return order.orderItems
    .map(
      (item) =>
        `<li>${item.product?.name || "Product"} × ${item.quantity} - ₹${item.price}</li>`
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
    <p><b>Country:</b> ${address.country || "India"}</p>
  `;
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
      to: req.user.email,
      subject: "Your Sasikumar Electronics Order Confirmed",
      html: `
        <h2>Order Confirmed</h2>
        <p>Hello ${order.shippingAddress.fullName},</p>
        <p>Your order has been placed successfully.</p>

        <h3>Order Details</h3>
        <p><b>Order ID:</b> ${order._id}</p>
        <p><b>Total Amount:</b> ₹${order.totalPrice}</p>
        <p><b>Payment ID:</b> ${order.paymentInfo?.razorpayPaymentId || "N/A"}</p>

        <h3>Products</h3>
        <ul>${formatItems(order)}</ul>

        <h3>Delivery Address</h3>
        ${addressHtml(order.shippingAddress)}

        <p>Thank you for shopping with Sasikumar Electronics.</p>
      `,
    });

    await safeSendEmail({
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: "New Order Received - Sasikumar Electronics",
      html: `
        <h2>New Order Received</h2>

        <h3>Customer Details</h3>
        <p><b>Name:</b> ${order.shippingAddress.fullName}</p>
        <p><b>Email:</b> ${req.user.email}</p>
        <p><b>Phone:</b> ${order.shippingAddress.phone}</p>

        <h3>Order Details</h3>
        <p><b>Order ID:</b> ${order._id}</p>
        <p><b>Total Amount:</b> ₹${order.totalPrice}</p>
        <p><b>Payment Method:</b> ${order.paymentMethod}</p>
        <p><b>Payment ID:</b> ${order.paymentInfo?.razorpayPaymentId || "N/A"}</p>

        <h3>Products</h3>
        <ul>${formatItems(order)}</ul>

        <h3>Delivery Address</h3>
        ${addressHtml(order.shippingAddress)}
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

    if (order.orderStatus === req.body.status) {
      return res.status(200).json({
        success: true,
        message: "Order already has this status",
        order,
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

    order = await Order.findById(order._id)
      .populate("user")
      .populate("orderItems.product");

    await safeSendEmail({
      to: order.user.email,
      subject: `Order Status Updated - ${order.orderStatus}`,
      html: `
        <h2>Order Status Updated</h2>
        <p>Hello ${order.shippingAddress.fullName},</p>

        <p>Your Sasikumar Electronics order status has been updated.</p>

        <p><b>Order ID:</b> ${order._id}</p>
        <p><b>New Status:</b> ${order.orderStatus}</p>
        <p><b>Message:</b> ${
          req.body.message || `Order status updated to ${req.body.status}`
        }</p>

        <h3>Products</h3>
        <ul>${formatItems(order)}</ul>

        <p>Thank you for shopping with Sasikumar Electronics.</p>
      `,
    });

    if (req.body.status === "Delivered") {
      await safeSendEmail({
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: "Order Delivered - Sasikumar Electronics",
        html: `
          <h2>Order Delivered</h2>
          <p><b>Order ID:</b> ${order._id}</p>
          <p><b>Customer:</b> ${order.shippingAddress.fullName}</p>
          <p><b>Phone:</b> ${order.shippingAddress.phone}</p>
          <p><b>Total:</b> ₹${order.totalPrice}</p>
        `,
      });
    }

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