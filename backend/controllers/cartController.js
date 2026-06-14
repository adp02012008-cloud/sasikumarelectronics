const Cart =
require("../models/Cart");


/*
==========================
ADD TO CART
==========================
*/

exports.addToCart =
async (req,res)=>{

 try{

  const {
   userId,
   productId,
   quantity,
  } = req.body;

  let cart =
  await Cart.findOne({
   user:userId,
  });

  if(!cart){

   cart =
   await Cart.create({
    user:userId,
    items:[
     {
      product:productId,
      quantity:quantity || 1,
     },
    ],
   });

  }
  else{

   const item =
   cart.items.find(
    (i)=>
    i.product.toString() ===
    productId
   );

   if(item){

    item.quantity +=
    quantity || 1;

   }
   else{

    cart.items.push({
     product:productId,
     quantity:quantity || 1,
    });

   }

   await cart.save();

  }

  cart =
  await Cart.findOne({
   user:userId,
  }).populate(
   "items.product"
  );

  res.status(200).json({
   success:true,
   cart,
  });

 }
 catch(error){

  res.status(500).json({
   success:false,
   message:error.message,
  });

 }

};


/*
==========================
GET CART
==========================
*/

exports.getCart =
async (req,res)=>{

 try{

  let cart =
  await Cart.findOne({
   user:req.params.userId,
  }).populate(
   "items.product"
  );

  if(!cart){

   cart = {
    user:req.params.userId,
    items:[],
   };

  }

  res.status(200).json({
   success:true,
   cart,
  });

 }
 catch(error){

  res.status(500).json({
   success:false,
   message:error.message,
  });

 }

};


/*
==========================
REMOVE ITEM
==========================
*/

exports.removeItem =
async (req,res)=>{

 try{

  const cart =
  await Cart.findOne({
   user:req.params.userId,
  });

  if(!cart){

   return res.status(200).json({
    success:true,
    cart:{
     items:[],
    },
   });

  }

  cart.items =
  cart.items.filter(
   (item)=>
   item.product.toString() !==
   req.params.productId
  );

  await cart.save();

  res.status(200).json({
   success:true,
   cart,
  });

 }
 catch(error){

  res.status(500).json({
   success:false,
   message:error.message,
  });

 }

};


/*
==========================
CLEAR CART
==========================
*/

exports.clearCart =
async (req,res)=>{

 try{

  const cart =
  await Cart.findOne({
   user:req.params.userId,
  });

  if(!cart){

   return res.status(200).json({
    success:true,
    message:"Cart Already Empty",
   });

  }

  cart.items = [];

  await cart.save();

  res.status(200).json({
   success:true,
   message:"Cart Cleared",
  });

 }
 catch(error){

  res.status(500).json({
   success:false,
   message:error.message,
  });

 }

};