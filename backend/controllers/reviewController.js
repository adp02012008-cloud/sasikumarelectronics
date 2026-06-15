const Review = require("../models/Review");
const Product = require("../models/Product");

const updateProductRating = async (productId) => {
  const reviews = await Review.find({
    product: productId,
  });

  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((acc, item) => acc + item.rating, 0) /
        reviews.length;

  await Product.findByIdAndUpdate(productId, {
    ratings: Number(avg.toFixed(1)),
    numReviews: reviews.length,
  });
};

exports.addReview = async (req, res) => {
  try {
    const {
      product,
      rating,
      comment,
    } = req.body;

    const existingReview = await Review.findOne({
      user: req.user.id,
      product,
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();

      await updateProductRating(product);

      return res.status(200).json({
        success: true,
        message: "Review Updated",
        review: existingReview,
      });
    }

    const review = await Review.create({
      user: req.user.id,
      product,
      rating,
      comment,
    });

    await updateProductRating(product);

    res.status(201).json({
      success: true,
      message: "Review Added",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};