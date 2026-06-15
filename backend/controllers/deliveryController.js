const DeliverySetting = require("../models/DeliverySetting");

exports.createDeliverySetting = async (req, res) => {
  try {
    const { minAmount, maxAmount, deliveryCharge } = req.body;

    const setting = await DeliverySetting.create({
      minAmount,
      maxAmount,
      deliveryCharge,
    });

    res.status(201).json({
      success: true,
      setting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDeliverySettings = async (req, res) => {
  try {
    const settings = await DeliverySetting.find().sort({
      minAmount: 1,
    });

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.calculateDeliveryCharge = async (req, res) => {
  try {
    const subtotal = Number(req.query.subtotal || 0);

    const setting = await DeliverySetting.findOne({
      minAmount: { $lte: subtotal },
      maxAmount: { $gte: subtotal },
    });

    res.json({
      success: true,
      deliveryCharge: setting ? setting.deliveryCharge : 0,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteDeliverySetting = async (req, res) => {
  try {
    await DeliverySetting.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Delivery setting deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};