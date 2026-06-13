import {
 useEffect,
 useState,
} from "react";


import API from "../api/axios";



const AdminOrders = () => {


 const [
  orders,
  setOrders
 ] =
 useState([]);




 useEffect(()=>{


  fetchOrders();


 },[]);






 const fetchOrders =
 async()=>{


  try{


   const token =
   localStorage.getItem(
    "token"
   );



   const res =
   await API.get(

    "/orders",

    {

     headers:{

      Authorization:
      `Bearer ${token}`

     }

    }

   );




   setOrders(

    res.data.orders
    ||
    []

   );



  }
  catch(error){


   console.log(
    error
   );


  }


 };









 return(


 <div className="admin-orders">



  <h1>

   Order Management

  </h1>






  {


   orders.length===0

   ?

   <h2>

    No Orders Found

   </h2>


   :




   orders.map(

    order=>(



    <div

     className="admin-order-card"

     key={
      order._id
     }

    >




     <div className="order-head">



      <h3>

       Order #

       {
        order._id
       }

      </h3>




      <span>

       {
        order.orderStatus
       }

      </span>



     </div>







     <p>


      Customer:


      {


       order.user?.name

       ||

       "Unknown"


      }


     </p>








     <p>


      Email:


      {


       order.user?.email

       ||

       "Not Available"


      }


     </p>








     <h3>

      Products

     </h3>






     {


      order.orderItems.map(

       item=>(



        <p

         key={
          item._id
         }

        >



         {
          item.product?.name
         }



         {" × "}



         {
          item.quantity
         }



        </p>



       )


      )


     }








     <h2>


      Total:


      ₹


      {
       order.totalPrice
      }



     </h2>







     <p>


      Payment:


      {


       order.paymentMethod
      }



     </p>





    </div>



    )


   )


  }





 </div>


 );


};




export default AdminOrders;