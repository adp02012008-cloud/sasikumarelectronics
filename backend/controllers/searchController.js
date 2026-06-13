const SearchHistory =
require("../models/SearchHistory");

const Product =
require("../models/Product");

const UserActivity =
require("../models/UserActivity");


/*
==============================
SAVE SEARCH
==============================
*/

exports.saveSearch =
async(req,res)=>{

  try{

    const {
      keyword
    } = req.body;

    const search =
    await SearchHistory.create({

      user:
      req.user ? req.user.id : null,

      keyword

    });

    res.status(201).json({

      success:true,

      search

    });

  }
  catch(error){

    res.status(500).json({

      success:false,

      message:
      error.message

    });

  }

};


/*
==============================
TRENDING SEARCHES
==============================
*/

exports.trendingSearches =
async(req,res)=>{

  try{

    const searches =
    await SearchHistory.aggregate([
      {
        $group:{
          _id:"$keyword",
          count:{
            $sum:1
          }
        }
      },
      {
        $sort:{
          count:-1
        }
      },
      {
        $limit:10
      }
    ]);

    res.status(200).json({

      success:true,

      searches

    });

  }
  catch(error){

    res.status(500).json({

      success:false,

      message:
      error.message

    });

  }

};


/*
==============================
POPULAR PRODUCTS
==============================
*/

exports.popularProducts =
async(req,res)=>{

  try{

    const popular =
    await UserActivity.aggregate([
      {
        $group:{
          _id:"$product",
          views:{
            $sum:1
          }
        }
      },
      {
        $sort:{
          views:-1
        }
      },
      {
        $limit:10
      }
    ]);

    const productIds =
    popular.map(
      item=>item._id
    );

    const products =
    await Product.find({
      _id:{
        $in:productIds
      }
    });

    res.status(200).json({

      success:true,

      products,

      popular

    });

  }
  catch(error){

    res.status(500).json({

      success:false,

      message:
      error.message

    });

  }

};