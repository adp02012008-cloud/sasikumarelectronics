const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const formatCurrency = (amount) => {
  return `Rs. ${Number(amount || 0).toFixed(2)}`;
};

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
    margin: 45,
    size: "A4",
  });

  doc.pipe(fs.createWriteStream(invoicePath));

  doc.rect(0, 0, 595, 95).fill("#111827");

  doc
    .fillColor("#ffffff")
    .fontSize(24)
    .text("Sasikumar Electronics", 45, 28);

  doc
    .fontSize(11)
    .fillColor("#d1d5db")
    .text("Industrial, Automobile & Electrical Products", 45, 58);

  doc
    .fontSize(18)
    .fillColor("#ffffff")
    .text("INVOICE", 450, 32);

  doc.fillColor("#111827");

  let y = 125;

  doc.fontSize(11).text(`Invoice No: INV-${order._id}`, 45, y);
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleString()}`, 45, y + 18);
  doc.text(`Order Status: ${order.orderStatus}`, 45, y + 36);
  doc.text(`Payment Method: ${order.paymentMethod}`, 45, y + 54);
  doc.text(`Payment ID: ${order.paymentInfo?.razorpayPaymentId || "N/A"}`, 45, y + 72);

  doc
    .fontSize(13)
    .fillColor("#2563eb")
    .text("Bill To", 350, y);

  doc.fillColor("#111827").fontSize(11);
  doc.text(order.shippingAddress?.fullName || "Customer", 350, y + 20);
  doc.text(`Phone: ${order.shippingAddress?.phone || "N/A"}`, 350, y + 38);
  doc.text(
    `${order.shippingAddress?.address || ""}, ${order.shippingAddress?.city || ""}`,
    350,
    y + 56,
    {
      width: 190,
    }
  );
  doc.text(
    `${order.shippingAddress?.state || ""} - ${order.shippingAddress?.pincode || ""}`,
    350,
    y + 88
  );

  y = 250;

  doc
    .rect(45, y, 505, 30)
    .fill("#2563eb");

  doc.fillColor("#ffffff").fontSize(11);
  doc.text("No", 55, y + 10);
  doc.text("Product Name", 95, y + 10);
  doc.text("Qty", 355, y + 10);
  doc.text("Unit Price", 400, y + 10);
  doc.text("Total", 490, y + 10);

  y += 30;

  let grandTotal = 0;

  order.orderItems.forEach((item, index) => {
    const productName =
      item.product?.name ||
      item.productName ||
      "Product";

    const qty = item.quantity || 1;
    const price = item.price || 0;
    const total = qty * price;

    grandTotal += total;

    doc
      .rect(45, y, 505, 32)
      .fill(index % 2 === 0 ? "#f8fafc" : "#ffffff");

    doc.fillColor("#111827").fontSize(10);
    doc.text(index + 1, 55, y + 10);
    doc.text(productName, 95, y + 10, {
      width: 240,
    });
    doc.text(qty, 360, y + 10);
    doc.text(formatCurrency(price), 400, y + 10);
    doc.text(formatCurrency(total), 490, y + 10);

    y += 32;
  });

  y += 20;

  doc
    .rect(355, y, 195, 42)
    .fill("#f97316");

  doc
    .fillColor("#ffffff")
    .fontSize(14)
    .text(`Grand Total: ${formatCurrency(grandTotal || order.totalPrice)}`, 370, y + 14);

  y += 80;

  doc
    .fillColor("#374151")
    .fontSize(11)
    .text("Thank you for shopping with Sasikumar Electronics.", 45, y);

  doc
    .fontSize(10)
    .fillColor("#6b7280")
    .text("This is a system generated invoice.", 45, y + 20);

  doc.end();

  return invoicePath;
};

module.exports = generateInvoice;