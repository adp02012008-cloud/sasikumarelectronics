import {
 useEffect,
 useState,
} from "react";


import API from "../api/axios";



const Orders = () => {


 const [
  orders,
  setOrders
 ] =
 useState([]);



 const [
  loading,
  setLoading
 ] =
 useState(true);





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
  finally{


   setLoading(false);


  }



 };









 const downloadInvoice =
 async(id)=>{


  try{


   const token =
   localStorage.getItem(
    "token"
   );




   const response =
   await API.get(

    `/orders/invoice/${id}`,

    {

     responseType:
     "blob",


     headers:{

      Authorization:
      `Bearer ${token}`

     }


    }

   );





   const url =
   window.URL.createObjectURL(

    new Blob(
     [
      response.data
     ]
    )

   );




   const link =
   document.createElement(
    "a"
   );



   link.href =
   url;



   link.download =
   `invoice-${id}.pdf`;



   link.click();



  }
  catch(error){


   alert(
    "Invoice download failed"
   );


  }


 };









 return(


 <div className="orders-page">



  <h1>

   My Orders

  </h1>





  {

   loading

   ?

   <h2>
    Loading Orders...
   </h2>


   :


   orders.length===0

   ?

   <h2>

    No Orders Found

   </h2>


   :





   <div className="orders-list">



    {

     orders.map(

      order=>(




      <div

       className="order-card"

       key={
        order._id
       }

      >




       <h3>

        Order #

        {
         order._id
        }

       </h3>







       <div>


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


       </div>








       <h2>

        ₹

        {
         order.totalPrice
        }

       </h2>






       <p>


        Status :


        <span className="status">


         {
          order.orderStatus
         }


        </span>


       </p>






       <p>

        Payment :

        {
         order.paymentMethod
        }

       </p>






       <button

        onClick={
         ()=>

         downloadInvoice(
          order._id
         )

        }

       >


        Download Invoice


       </button>





      </div>



      )

     )

    }




   </div>



  }




 </div>


 );


};




export default Orders;