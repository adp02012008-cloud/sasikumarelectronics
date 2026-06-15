const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const Review = require("../models/Review");

exports.analyticsOverview = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalReviews = await Review.countDocuments();

    const orders = await Order.find();

    const revenue = orders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    const lowStock = await Product.find({
      stock: {
        $lte: 5,
      },
    }).limit(10);

    const topProducts = await Order.aggregate([
      {
        $unwind: "$orderItems",
      },
      {
        $group: {
          _id: "$orderItems.product",
          totalSold: {
            $sum: "$orderItems.quantity",
          },
        },
      },
      {
        $sort: {
          totalSold: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    const monthlyRevenue = await Order.aggregate([
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
            year: {
              $year: "$createdAt",
            },
          },
          revenue: {
            $sum: "$totalPrice",
          },
          orders: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const categoryStock = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          stock: {
            $sum: "$stock",
          },
          products: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          stock: -1,
        },
      },
    ]);

    const recentReviews = await Review.find()
      .populate("user", "name")
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      totalProducts,
      totalOrders,
      totalUsers,
      totalReviews,
      revenue,
      lowStock,
      topProducts,
      monthlyRevenue,
      categoryStock,
      recentReviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};