const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = (order) => {
  const invoiceDir = path.join(__dirname, "../invoices");

  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir);
  }

  const invoicePath = path.join(
    invoiceDir,
    `invoice-${order._id}.pdf`
  );

  const doc = new PDFDocument({
    margin: 50,
  });

  doc.pipe(fs.createWriteStream(invoicePath));

  doc
    .fontSize(22)
    .text("Sasikumar Electronics", { align: "center" });

  doc
    .fontSize(16)
    .text("Tax Invoice / Order Receipt", { align: "center" });

  doc.moveDown();

  doc.fontSize(12).text(`Order ID: ${order._id}`);
  doc.text(`Order Status: ${order.orderStatus}`);
  doc.text(`Payment Method: ${order.paymentMethod}`);
  doc.text(`Payment ID: ${order.paymentInfo?.razorpayPaymentId || "N/A"}`);
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleString()}`);

  doc.moveDown();

  doc.fontSize(14).text("Customer Details");
  doc.fontSize(12).text(`Name: ${order.shippingAddress.fullName}`);
  doc.text(`Phone: ${order.shippingAddress.phone}`);
  doc.text(
    `Address: ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`
  );
  doc.text(`Country: ${order.shippingAddress.country}`);

  doc.moveDown();

  doc.fontSize(14).text("Order Items");

  order.orderItems.forEach((item, index) => {
    doc.fontSize(12).text(
      `${index + 1}. Product ID: ${item.product} | Qty: ${item.quantity} | Price: ₹${item.price}`
    );
  });

  doc.moveDown();

  doc.fontSize(16).text(`Total Amount: ₹${order.totalPrice}`, {
    align: "right",
  });

  doc.moveDown();

  doc
    .fontSize(12)
    .text("Thank you for shopping with Sasikumar Electronics.", {
      align: "center",
    });

  doc.end();

  return invoicePath;
};

module.exports = generateInvoice;