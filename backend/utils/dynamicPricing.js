const Product =
require("../models/Product");


const updateDynamicPrices =
async()=>{


 try{


  const products =
  await Product.find({

    dynamicPricing:true

  });




  for(
    const product of products
  ){


    let newPrice =
    product.price;




    /*
    HIGH DEMAND
    PRICE INCREASE
    */


    if(
      product.demand > 10 ||
      product.stock < 5
    ){


      newPrice =
      product.price +
      product.price * 0.1;


    }



    /*
    LOW DEMAND
    PRICE DECREASE
    */


    if(
      product.demand < 3 &&
      product.stock > 20
    ){


      newPrice =
      product.price -
      product.price * 0.1;


    }





    if(
      newPrice >
      product.maxPrice
    ){

      newPrice =
      product.maxPrice;

    }



    if(
      newPrice <
      product.minPrice
    ){

      newPrice =
      product.minPrice;

    }




    product.price =
    Math.round(
      newPrice
    );



    await product.save();


  }



  console.log(
    "Dynamic Prices Updated"
  );



 }
 catch(error){


  console.log(
    error.message
  );


 }


};



module.exports =
updateDynamicPrices;