const Wishlist = require("../models/Wishlist");

exports.addWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    let wishlist = await Wishlist.findOne({
      user: userId,
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        products: [productId],
      });
    } else {
      const exists = wishlist.products.some(
        (id) => id.toString() === productId
      );

      if (!exists) {
        wishlist.products.push(productId);
      }

      await wishlist.save();
    }

    wishlist = await Wishlist.findOne({
      user: userId,
    }).populate("products");

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({
      user: userId,
    }).populate("products");

    res.status(200).json({
      success: true,
      wishlist: wishlist || {
        user: userId,
        products: [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.removeWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({
      user: userId,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist Not Found",
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== req.params.productId
    );

    await wishlist.save();

    const updatedWishlist = await Wishlist.findOne({
      user: userId,
    }).populate("products");

    res.status(200).json({
      success: true,
      wishlist: updatedWishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};