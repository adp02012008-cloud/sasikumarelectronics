const Review =
  require("../models/Review");

const Product =
  require("../models/Product");

exports.addReview =
  async (req, res) => {
    try {

      const {
        user,
        product,
        rating,
        comment,
      } = req.body;

      const review =
        await Review.create({
          user,
          product,
          rating,
          comment,
        });

      const reviews =
        await Review.find({
          product,
        });

      const avg =
        reviews.reduce(
          (acc, item) =>
            acc + item.rating,
          0
        ) / reviews.length;

      await Product.findByIdAndUpdate(
        product,
        {
          ratings: avg,
          numReviews:
            reviews.length,
        }
      );

      res.status(201).json({
        success: true,
        review,
      });

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });

    }
  };

exports.getReviews =
  async (req, res) => {
    try {

      const reviews =
        await Review.find({
          product:
            req.params.productId,
        }).populate(
          "user"
        );

      res.json({
        success: true,
        reviews,
      });

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });

    }
  };