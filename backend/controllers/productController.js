const Product =
require("../models/Product");


const getRecommendations =
require(
 "../utils/recommendationEngine"
);



/*
====================================
CREATE PRODUCT
====================================
*/


exports.createProduct =
async(req,res)=>{


 try{


  const images =
  req.files
  ?
  req.files.map(
   (file)=>({

    url:
    file.path,


    public_id:
    file.filename


   })
  )
  :
  [];





  const product =
  await Product.create({



   name:
   req.body.name,



   description:
   req.body.description,



   category:
   req.body.category,



   brand:
   req.body.brand,



   price:
   req.body.price,



   minPrice:
   req.body.minPrice,



   maxPrice:
   req.body.maxPrice,



   dynamicPricing:
   req.body.dynamicPricing,



   demand:
   req.body.demand,



   stock:
   req.body.stock,



   images



  });






  res.status(201).json({


   success:true,


   product


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
====================================
GET ALL PRODUCTS
ADVANCED FILTER
SORT
PAGINATION
====================================
*/


exports.getProducts =
async(req,res)=>{


 try{



  const page =
  Number(
   req.query.page
  )
  ||
  1;




  const limit =
  Number(
   req.query.limit
  )
  ||
  10;




  const skip =
  (
   page - 1
  )
  *
  limit;





  let query = {};





  if(
   req.query.keyword
  ){


   query.name = {


    $regex:
    req.query.keyword,


    $options:
    "i"


   };


  }






  if(
   req.query.category
  ){


   query.category =
   req.query.category;


  }






  if(
   req.query.brand
  ){


   query.brand =
   req.query.brand;


  }






  if(
   req.query.minPrice ||
   req.query.maxPrice
  ){



   query.price ={};



   if(
    req.query.minPrice
   ){


    query.price.$gte =
    Number(
     req.query.minPrice
    );


   }




   if(
    req.query.maxPrice
   ){


    query.price.$lte =
    Number(
     req.query.maxPrice
    );


   }



  }






  if(
   req.query.rating
  ){


   query.ratings ={



    $gte:
    Number(
     req.query.rating
    )



   };


  }







  let sortOption ={};




  if(
   req.query.sort
   ===
   "priceLow"
  ){


   sortOption.price = 1;


  }




  if(
   req.query.sort
   ===
   "priceHigh"
  ){


   sortOption.price = -1;


  }







  const products =
  await Product.find(
   query
  )
  .sort(
   sortOption
  )
  .skip(
   skip
  )
  .limit(
   limit
  );





  const totalProducts =
  await Product.countDocuments(
   query
  );






  res.status(200).json({



   success:true,


   page,


   pages:
   Math.ceil(
    totalProducts /
    limit
   ),



   totalProducts,



   count:
   products.length,



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
====================================
GET SINGLE PRODUCT
====================================
*/


exports.getProduct =
async(req,res)=>{


 try{


  const product =
  await Product.findById(
   req.params.id
  );



  if(!product){


   return res.status(404)
   .json({


    success:false,


    message:
    "Product Not Found"


   });


  }




  res.status(200).json({


   success:true,


   product


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
====================================
SEARCH PRODUCTS
====================================
*/


exports.searchProducts =
async(req,res)=>{


 try{


  const keyword =
  req.query.keyword || "";



  const products =
  await Product.find({


   name:{


    $regex:
    keyword,


    $options:
    "i"


   }


  });




  res.status(200).json({



   success:true,


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
====================================
FILTER CATEGORY
====================================
*/


exports.filterCategory =
async(req,res)=>{


 try{


  const products =
  await Product.find({


   category:
   req.params.category


  });




  res.status(200).json({



   success:true,


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
====================================
UPDATE PRODUCT
====================================
*/


exports.updateProduct =
async(req,res)=>{


 try{


  let product =
  await Product.findById(
   req.params.id
  );




  if(!product){


   return res.status(404)
   .json({



    success:false,


    message:
    "Product Not Found"



   });


  }






  product =
  await Product.findByIdAndUpdate(



   req.params.id,


   req.body,


   {


    new:true,


    runValidators:true


   }



  );







  res.status(200).json({



   success:true,


   product



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
====================================
DELETE PRODUCT
====================================
*/


exports.deleteProduct =
async(req,res)=>{


 try{



  const product =
  await Product.findById(
   req.params.id
  );





  if(!product){


   return res.status(404)
   .json({



    success:false,


    message:
    "Product Not Found"



   });



  }







  await Product.findByIdAndDelete(
   req.params.id
  );







  res.status(200).json({




   success:true,


   message:
   "Product Deleted Successfully"




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
====================================
INVENTORY REPORT
====================================
*/


exports.inventory =
async(req,res)=>{



 try{



  const products =
  await Product.find();





  res.status(200).json({




   success:true,



   totalProducts:
   products.length,



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
====================================
UPDATE STOCK
====================================
*/


exports.updateStock =
async(req,res)=>{



 try{




  const product =
  await Product.findById(
   req.params.id
  );





  if(!product){



   return res.status(404)
   .json({




    success:false,



    message:
    "Product Not Found"




   });




  }







  product.stock =
  req.body.stock;





  await product.save();







  res.status(200).json({





   success:true,



   message:
   "Stock Updated",



   product





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
====================================
PRODUCT RECOMMENDATIONS
====================================
*/


exports.recommendProducts =
async(req,res)=>{



 try{




  const product =
  await Product.findById(
   req.params.id
  );







  if(!product){




   return res.status(404)
   .json({





    success:false,




    message:
    "Product Not Found"





   });





  }








  const recommendations =
  await getRecommendations(
   product
  );








  res.status(200).json({





   success:true,



   count:
   recommendations.length,



   product,



   recommendations





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