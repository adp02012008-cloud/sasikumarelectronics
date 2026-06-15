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

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

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