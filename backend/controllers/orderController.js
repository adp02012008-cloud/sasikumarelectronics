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

const ADMIN_EMAILS = [
  "adp02012008@gmail.com",
  "sdhivakar2901@gmail.com",
  process.env.ADMIN_EMAIL,
]
  .filter(Boolean)
  .map((e) => e.toLowerCase().trim());

const isUserAdmin = (user) => {
  if (!user) return false;
  const role = user.role;
  const email = (user.email || "").toLowerCase().trim();
  return role === "admin" || role === "superadmin" || ADMIN_EMAILS.includes(email);
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

    const customerEmail = (
      order.shippingAddress?.email ||
      order.user?.email ||
      ""
    ).trim();

    const customerAttachments = [];
    if (invoicePath && fs.existsSync(invoicePath)) {
      customerAttachments.push({
        filename: `Invoice_${order._id}.pdf`,
        path: invoicePath,
        contentType: "application/pdf",
      });
    }

    if (customerEmail) {
      await safeSendEmail({
        to: customerEmail,
        subject: `Your Sasikumar Electronics Order Confirmed (#${String(order._id).slice(-6).toUpperCase()})`,
        attachments: customerAttachments,
        html: `
          <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 14px; margin-bottom: 20px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Sasikumar Electronics</h1>
              <p style="color: #64748b; margin: 4px 0 0; font-size: 14px;">Order Confirmation</p>
            </div>

            <h2 style="color: #0f172a; margin-top: 0;">Order Confirmed!</h2>
            <p>Hello <b>${order.shippingAddress.fullName}</b>,</p>
            <p>Thank you for shopping with us! Your order has been placed successfully.</p>

            <div style="background: #f8fafc; border-radius: 8px; padding: 14px; margin: 16px 0;">
              <p style="margin: 4px 0;"><b>Order ID:</b> ${order._id}</p>
              <p style="margin: 4px 0;"><b>Order Date:</b> ${new Date().toLocaleDateString("en-IN")}</p>
              <p style="margin: 4px 0;"><b>Payment Method:</b> ${order.paymentMethod}</p>
              <p style="margin: 4px 0;"><b>Total Amount:</b> ₹${order.totalPrice}</p>
            </div>

            <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Items Ordered</h3>
            <ul style="padding-left: 20px; line-height: 1.8;">
              ${formatItems(order)}
            </ul>

            <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Delivery Address</h3>
            <p style="line-height: 1.5; color: #334155;">
              ${order.shippingAddress.fullName}<br />
              ${order.shippingAddress.address}<br />
              ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br />
              <b>Phone:</b> ${order.shippingAddress.phone}
              ${customerEmail ? `<br /><b>Email:</b> ${customerEmail}` : ""}
            </p>

            <p style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; text-align: center;">
              Your invoice is attached with this email. If you have any questions, feel free to reach out to us at <a href="mailto:${process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'sdhivakar2901@gmail.com'}">${process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'sdhivakar2901@gmail.com'}</a>.
            </p>
          </div>
        `,
      });
    }

    const adminRecipient =
      process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "sdhivakar2901@gmail.com";

    await safeSendEmail({
      to: adminRecipient,
      subject: `New Order Received (#${String(order._id).slice(-6).toUpperCase()}) - ₹${order.totalPrice}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-top: 0;">New Order Notification</h2>
          <p>A new order has been received on Sasikumar Electronics.</p>

          <div style="background: #f8fafc; border-radius: 8px; padding: 14px; margin: 16px 0;">
            <p style="margin: 4px 0;"><b>Order ID:</b> ${order._id}</p>
            <p style="margin: 4px 0;"><b>Customer:</b> ${order.shippingAddress.fullName}</p>
            <p style="margin: 4px 0;"><b>Phone:</b> ${order.shippingAddress.phone}</p>
            <p style="margin: 4px 0;"><b>Email:</b> ${customerEmail || "Not provided"}</p>
            <p style="margin: 4px 0;"><b>Total:</b> ₹${order.totalPrice}</p>
          </div>

          <h3>Products</h3>
          <ul style="padding-left: 20px; line-height: 1.8;">
            ${formatItems(order)}
          </ul>

          <h3>Delivery Address</h3>
          <p style="line-height: 1.5;">
            ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
          </p>
        </div>
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
      !isUserAdmin(req.user)
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
      !isUserAdmin(req.user)
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

    const customerEmail = (
      order.shippingAddress?.email ||
      order.user?.email ||
      ""
    ).trim();

    if (customerEmail) {
      await safeSendEmail({
        to: customerEmail,
        subject: `Order Status Update: ${order.orderStatus} - Sasikumar Electronics`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 14px; margin-bottom: 20px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Sasikumar Electronics</h1>
              <p style="color: #64748b; margin: 4px 0 0; font-size: 14px;">Order Status Update</p>
            </div>

            <h2 style="color: #0f172a; margin-top: 0;">Order Status: ${order.orderStatus}</h2>
            <p>Hello <b>${order.shippingAddress?.fullName || order.user?.name || "Customer"}</b>,</p>
            <p>Your order status has been updated to: <span style="background: #dbeafe; color: #1d4ed8; padding: 4px 10px; border-radius: 6px; font-weight: bold;">${order.orderStatus}</span></p>

            <div style="background: #f8fafc; border-radius: 8px; padding: 14px; margin: 16px 0;">
              <p style="margin: 4px 0;"><b>Order ID:</b> ${order._id}</p>
              <p style="margin: 4px 0;"><b>Total Amount:</b> ₹${order.totalPrice}</p>
            </div>

            <h3 style="border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Items</h3>
            <ul style="padding-left: 20px; line-height: 1.8;">
              ${formatItems(order)}
            </ul>

            <p style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; text-align: center;">
              Thank you for choosing Sasikumar Electronics!
            </p>
          </div>
        `,
      });
    }

    const adminRecipient =
      process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "sdhivakar2901@gmail.com";

    await safeSendEmail({
      to: adminRecipient,
      subject: `Order Status Changed to ${order.orderStatus} (#${String(order._id).slice(-6).toUpperCase()})`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-top: 0;">Order Status Updated</h2>
          <p><b>Order ID:</b> ${order._id}</p>
          <p><b>New Status:</b> ${order.orderStatus}</p>
          <p><b>Customer:</b> ${order.shippingAddress?.fullName || "Customer"}</p>
          <p><b>Phone:</b> ${order.shippingAddress?.phone || "N/A"}</p>
          <p><b>Email:</b> ${customerEmail || "Not provided"}</p>
          <p><b>Total:</b> ₹${order.totalPrice}</p>
        </div>
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