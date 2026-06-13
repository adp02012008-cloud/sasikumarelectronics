const Product =
require("../models/Product");


const getRecommendations =
async(product)=>{


 try{


  const products =
  await Product.find({


   _id:{

    $ne:
    product._id

   },


   $or:[


    {
     category:
     product.category
    },


    {
     brand:
     product.brand
    },


    {
     price:{

      $gte:
      product.price - 5000,


      $lte:
      product.price + 5000

     }

    }


   ]


  })
  .limit(
   10
  );



  return products;


 }
 catch(error){


  return [];


 }


};



module.exports =
getRecommendations;