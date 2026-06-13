const PDFDocument =
require("pdfkit");

const fs =
require("fs");

const path =
require("path");

const generateInvoice =
(order) => {

  const invoiceDir =
  path.join(
    __dirname,
    "../invoices"
  );

  if(!fs.existsSync(invoiceDir)){

    fs.mkdirSync(invoiceDir);

  }

  const invoicePath =
  path.join(
    invoiceDir,
    `invoice-${order._id}.pdf`
  );

  const doc =
  new PDFDocument();

  doc.pipe(
    fs.createWriteStream(
      invoicePath
    )
  );

  doc.fontSize(22)
  .text(
    "Invoice",
    {
      align:"center"
    }
  );

  doc.moveDown();

  doc.fontSize(14)
  .text(
    `Order ID: ${order._id}`
  );

  doc.text(
    `Total Amount: ₹${order.totalPrice}`
  );

  doc.text(
    `Order Status: ${order.orderStatus}`
  );

  doc.text(
    `Payment Method: ${order.paymentMethod}`
  );

  doc.moveDown();

  doc.text(
    "Thank you for shopping with us."
  );

  doc.end();

  return invoicePath;

};

module.exports =
generateInvoice;