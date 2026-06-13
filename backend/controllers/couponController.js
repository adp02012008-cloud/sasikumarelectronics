const Coupon =
require("../models/Coupon");

exports.createCoupon =
async(req,res)=>{

  try{

    const coupon =
    await Coupon.create(
      req.body
    );

    res.status(201).json({
      success:true,
      coupon
    });

  }
  catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }

};

exports.getCoupons =
async(req,res)=>{

  try{

    const coupons =
    await Coupon.find();

    res.status(200).json({
      success:true,
      count:coupons.length,
      coupons
    });

  }
  catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }

};

exports.applyCoupon =
async(req,res)=>{

  try{

    const {
      code,
      orderAmount
    } = req.body;

    const coupon =
    await Coupon.findOne({
      code:code.toUpperCase(),
      isActive:true
    });

    if(!coupon){

      return res.status(404).json({
        success:false,
        message:"Invalid Coupon"
      });

    }

    if(
      new Date(coupon.expiryDate) <
      new Date()
    ){

      return res.status(400).json({
        success:false,
        message:"Coupon Expired"
      });

    }

    if(
      orderAmount <
      coupon.minOrderAmount
    ){

      return res.status(400).json({
        success:false,
        message:"Minimum order amount not reached"
      });

    }

    let discount = 0;

    if(
      coupon.discountType ===
      "percentage"
    ){

      discount =
      orderAmount *
      coupon.discountValue /
      100;

    }
    else{

      discount =
      coupon.discountValue;

    }

    const finalAmount =
    orderAmount - discount;

    res.status(200).json({
      success:true,
      coupon,
      discount,
      finalAmount
    });

  }
  catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }

};