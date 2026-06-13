const Wishlist =
  require(
    "../models/Wishlist"
  );

exports.addWishlist =
  async (req, res) => {
    try {

      const {
        userId,
        productId,
      } = req.body;

      let wishlist =
        await Wishlist.findOne({
          user: userId,
        });

      if (!wishlist) {

        wishlist =
          await Wishlist.create({
            user: userId,
            products: [
              productId,
            ],
          });

      } else {

        if (
          !wishlist.products.includes(
            productId
          )
        ) {
          wishlist.products.push(
            productId
          );
        }

        await wishlist.save();
      }

      res.json({
        success: true,
        wishlist,
      });

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });

    }
  };

exports.getWishlist =
  async (req, res) => {
    try {

      const wishlist =
        await Wishlist.findOne({
          user:
            req.params.userId,
        }).populate(
          "products"
        );

      res.json({
        success: true,
        wishlist,
      });

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });

    }
  };

exports.removeWishlist =
  async (req, res) => {
    try {

      const wishlist =
        await Wishlist.findOne({
          user:
            req.params.userId,
        });

      if (!wishlist) {
        return res
          .status(404)
          .json({
            message:
              "Wishlist Not Found",
          });
      }

      wishlist.products =
        wishlist.products.filter(
          (id) =>
            id.toString() !==
            req.params.productId
        );

      await wishlist.save();

      res.json({
        success: true,
        wishlist,
      });

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });

    }
  };