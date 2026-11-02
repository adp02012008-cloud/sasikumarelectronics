const Product = require("../models/Product");
const getRecommendations = require("../utils/recommendationEngine");

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};

exports.createProduct = async (req, res) => {
  try {
    const images = req.files
      ? req.files.map((file) => ({
          url: file.path,
          public_id: file.filename,
        }))
      : [];

    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      brand: req.body.brand,
      price: toNumber(req.body.price),
      minPrice: toNumber(req.body.minPrice),
      maxPrice: toNumber(req.body.maxPrice),
      dynamicPricing:
        req.body.dynamicPricing === "true" ||
        req.body.dynamicPricing === true,
      demand: toNumber(req.body.demand),
      stock: toNumber(req.body.stock),
      images,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.keyword) {
      query.$or = [
        {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        },
        {
          category: {
            $regex: req.query.keyword,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: req.query.keyword,
            $options: "i",
          },
        },
        {
          description: {
            $regex: req.query.keyword,
            $options: "i",
          },
        },
      ];
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.brand) {
      query.brand = req.query.brand;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};

      if (req.query.minPrice) {
        query.price.$gte = Number(req.query.minPrice);
      }

      if (req.query.maxPrice) {
        query.price.$lte = Number(req.query.maxPrice);
      }
    }

    if (req.query.rating) {
      query.ratings = {
        $gte: Number(req.query.rating),
      };
    }

    const sortOption = {};

    if (req.query.sort === "priceLow") {
      sortOption.price = 1;
    }

    if (req.query.sort === "priceHigh") {
      sortOption.price = -1;
    }

    if (req.query.sort === "rating") {
      sortOption.ratings = -1;
    }

    if (req.query.sort === "newest") {
      sortOption.createdAt = -1;
    }

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      page,
      pages: Math.ceil(totalProducts / limit),
      totalProducts,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const products = await Product.find({
      $or: [
        {
          name: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          category: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    }).limit(20);

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.searchSuggestions = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    if (!keyword.trim()) {
      return res.status(200).json({
        success: true,
        suggestions: [],
      });
    }

    const products = await Product.find({
      $or: [
        {
          name: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          category: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    })
      .select("name category brand price images stock")
      .limit(8);

    res.status(200).json({
      success: true,
      suggestions: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.filterCategory = async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
    });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    const updateData = {};

    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.brand !== undefined) updateData.brand = req.body.brand;
    if (req.body.price !== undefined) updateData.price = toNumber(req.body.price, product.price);
    if (req.body.minPrice !== undefined) updateData.minPrice = toNumber(req.body.minPrice, product.minPrice);
    if (req.body.maxPrice !== undefined) updateData.maxPrice = toNumber(req.body.maxPrice, product.maxPrice);
    if (req.body.stock !== undefined) updateData.stock = toNumber(req.body.stock, product.stock);
    if (req.body.demand !== undefined) updateData.demand = toNumber(req.body.demand, product.demand);
    if (req.body.dynamicPricing !== undefined) {
      updateData.dynamicPricing =
        req.body.dynamicPricing === "true" || req.body.dynamicPricing === true;
    }

    // Determine final images list
    let updatedImages = null;

    if (req.body.existingImages !== undefined) {
      try {
        const parsed =
          typeof req.body.existingImages === "string"
            ? JSON.parse(req.body.existingImages)
            : req.body.existingImages;
        if (Array.isArray(parsed)) {
          updatedImages = parsed;
        }
      } catch (err) {
        console.error("Error parsing existingImages:", err);
      }
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
      if (updatedImages === null) {
        updatedImages = [...(product.images || []), ...newImages];
      } else {
        updatedImages = [...updatedImages, ...newImages];
      }
    } else if (req.body.images && Array.isArray(req.body.images)) {
      updatedImages = req.body.images;
    }

    if (updatedImages !== null) {
      updateData.images = updatedImages;
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Product Updated Successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.inventory = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    product.stock = req.body.stock;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Stock Updated",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.recommendProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    const recommendations = await getRecommendations(product);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      product,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};