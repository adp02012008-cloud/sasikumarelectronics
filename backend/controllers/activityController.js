const UserActivity =
require(
 "../models/UserActivity"
);


const Product =
require(
 "../models/Product"
);



/*
==============================
SAVE PRODUCT VIEW
==============================
*/


exports.saveActivity =
async(req,res)=>{


 try{


  const product =
  await Product.findById(
   req.body.productId
  );



  if(!product){


   return res.status(404)
   .json({


    success:false,


    message:
    "Product Not Found"


   });


  }




  const activity =
  await UserActivity.create({


   user:
   req.user.id,


   product:
   product._id,


   category:
   product.category,


   brand:
   product.brand


  });




  res.status(201).json({


   success:true,


   activity


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
PERSONAL RECOMMENDATION
==============================
*/


exports.personalRecommendation =
async(req,res)=>{


 try{


  const activities =
  await UserActivity.find({


   user:
   req.user.id


  });




  const categories =
  activities.map(

   item=>
   item.category

  );




  const brands =
  activities.map(

   item=>
   item.brand

  );






  const products =
  await Product.find({


   $or:[


    {

     category:{

      $in:
      categories

     }

    },



    {

     brand:{

      $in:
      brands

     }

    }


   ]


  })
  .limit(
   10
  );






  res.json({


   success:true,


   recommendations:
   products


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
RECENTLY VIEWED PRODUCTS
==============================
*/


exports.recentViews =
async(req,res)=>{


 try{


  const history =
  await UserActivity.find({

   user:
   req.user.id

  })
  .populate(
   "product"
  )
  .sort({

   createdAt:-1

  })
  .limit(
   10
  );




  res.status(200).json({


   success:true,


   history


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
FULL BROWSING HISTORY
==============================
*/


exports.history =
async(req,res)=>{


 try{


  const history =
  await UserActivity.find({

   user:
   req.user.id

  })
  .populate(
   "product"
  )
  .sort({

   createdAt:-1

  });




  res.status(200).json({


   success:true,


   count:
   history.length,


   history


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
CLEAR HISTORY
==============================
*/


exports.clearHistory =
async(req,res)=>{


 try{


  await UserActivity.deleteMany({

   user:
   req.user.id

  });




  res.status(200).json({


   success:true,


   message:
   "Browsing History Cleared"


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