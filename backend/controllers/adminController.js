const User =
require("../models/User");

const Product =
require("../models/Product");

const Order =
require("../models/Order");



/*
=========================
ADMIN DASHBOARD
=========================
*/

exports.dashboard =
async(req,res)=>{


 try{


  const users =
  await User.countDocuments();



  const products =
  await Product.countDocuments();



  const orders =
  await Order.countDocuments();



  const allOrders =
  await Order.find();




  const revenue =
  allOrders.reduce(

   (acc,item)=>
   acc + item.totalPrice,

   0

  );




  res.status(200).json({


   success:true,


   users,


   products,


   orders,


   revenue


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
=========================
GET ALL USERS
=========================
*/


exports.getUsers =
async(req,res)=>{


 try{


  const users =
  await User.find()
  .select(
   "-password"
  );





  res.status(200).json({


   success:true,


   count:
   users.length,


   users


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
=========================
DELETE USER
=========================
*/


exports.deleteUser =
async(req,res)=>{


 try{


  const user =
  await User.findById(
   req.params.id
  );




  if(!user){


   return res.status(404)
   .json({



    success:false,


    message:
    "User Not Found"



   });


  }






  await User.findByIdAndDelete(
   req.params.id
  );







  res.status(200).json({



   success:true,


   message:
   "User Deleted"



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
=========================
LOW STOCK PRODUCTS
=========================
*/


exports.lowStockProducts =
async(req,res)=>{


 try{



  const products =
  await Product.find({



   stock:{


    $lte:5


   }



  });






  res.status(200).json({



   success:true,


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
=========================
MONTHLY REVENUE
=========================
*/


exports.monthlyRevenue =
async(req,res)=>{


 try{


  const orders =
  await Order.find();




  const monthly = {};




  orders.forEach(
   (order)=>{



    const month =
    new Date(
     order.createdAt
    )
    .toLocaleString(

     "default",

     {
      month:"short"
     }

    );





    monthly[month] =
    (
     monthly[month] || 0
    )
    +
    order.totalPrice;



   }
  );





  res.status(200).json({


   success:true,


   monthly


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
=========================
SALES STATS
=========================
*/


exports.salesStats =
async(req,res)=>{


 try{


  const orders =
  await Order.find();





  const totalSales =
  orders.reduce(


   (acc,item)=>
   acc + item.totalPrice,


   0


  );






  res.status(200).json({




   success:true,



   totalOrders:
   orders.length,



   totalSales




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
=========================
REVENUE CHART DATA
=========================
*/


exports.revenueChart =
async(req,res)=>{


 try{


  const data =
  await Order.aggregate([



   {

    $group:{


     _id:{


      $month:
      "$createdAt"


     },


     revenue:{


      $sum:
      "$totalPrice"


     },


     orders:{


      $sum:1


     }


    }


   },




   {


    $sort:{


     _id:1


    }


   }



  ]);







  res.status(200).json({




   success:true,



   chart:
   data




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
=========================
TOP SELLING PRODUCTS
=========================
*/


exports.topProducts =
async(req,res)=>{


 try{



  const products =
  await Order.aggregate([



   {
    $unwind:
    "$orderItems"
   },




   {

    $group:{



     _id:
     "$orderItems.product",



     totalSold:{


      $sum:
      "$orderItems.quantity"


     }



    }



   },




   {

    $sort:{


     totalSold:-1


    }


   },



   {

    $limit:10

   }



  ]);







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
=========================
USER GROWTH ANALYTICS
=========================
*/


exports.userGrowth =
async(req,res)=>{


 try{



  const users =
  await User.aggregate([




   {


    $group:{



     _id:{


      $month:
      "$createdAt"


     },



     totalUsers:{



      $sum:1



     }



    }



   },





   {


    $sort:{


     _id:1


    }


   }




  ]);








  res.status(200).json({




   success:true,



   users




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