import {
 useEffect,
 useState,
} from "react";

import API from "../api/axios";

import {
 useNavigate,
} from "react-router-dom";


const Checkout = () => {

 const navigate =
 useNavigate();

 const user =
 JSON.parse(
  localStorage.getItem("user")
 );

 const userId =
 user?._id ||
 user?.id;

 const [
  cart,
  setCart
 ] =
 useState([]);

 const [
  loading,
  setLoading
 ] =
 useState(false);


 useEffect(()=>{

  fetchCart();

 },[]);


 const fetchCart =
 async()=>{

  try{

   if(!userId){
    return;
   }

   const res =
   await API.get(
    `/cart/${userId}`
   );

   setCart(
    res.data.cart.items || []
   );

  }
  catch(error){

   console.log(error);

  }

 };


 const total =
 cart.reduce(
  (sum,item)=>
  sum +
  item.product.price *
  item.quantity,
  0
 );


 const handlePayment =
 async()=>{

  if(total <= 0){

   alert(
    "Cart is empty"
   );

   return;

  }

  try{

   setLoading(true);

   const {data} =
   await API.post(
    "/payment/create-order",
    {
     amount:
     total
    }
   );

   const options = {

    key:
    import.meta.env
    .VITE_RAZORPAY_KEY_ID,

    amount:
    data.order.amount,

    currency:
    data.order.currency,

    name:
    "Sasikumar Electronics",

    description:
    "Order Payment",

    order_id:
    data.order.id,

    handler:
    async function(response){

     await API.post(
      "/orders",
      {
       user:
       userId,

       orderItems:
       cart.map(
        item=>({
         product:
         item.product._id,

         quantity:
         item.quantity,

         price:
         item.product.price
        })
       ),

       shippingAddress:{
        address:"Customer Address",
        city:"City",
        state:"State",
        pincode:"000000",
        country:"India"
       },

       paymentMethod:
       "Razorpay",

       paymentInfo:{
        razorpayOrderId:
        data.order.id,

        razorpayPaymentId:
        response.razorpay_payment_id
       },

       totalPrice:
       total
      }
     );

     alert(
      "Payment Successful. Order Placed."
     );

     navigate(
      "/orders"
     );

    },

    theme:{
     color:"#2563eb"
    }

   };

   const razorpay =
   new window.Razorpay(
    options
   );

   razorpay.open();

  }
  catch(error){

   console.log(error);

   alert(
    "Payment Failed"
   );

  }
  finally{

   setLoading(false);

  }

 };


 return(

  <div className="checkout-page">

   <div className="checkout-card">

    <h1>
     Checkout
    </h1>

    <p>
     Review your order before payment
    </p>

    {
     cart.length === 0
     ? (
      <h3>
       Your cart is empty
      </h3>
     )
     : (
      <>

       {
        cart.map(
         item=>(

          <div
           key={item._id}
           className="checkout-item"
          >

           <span>
            {item.product.name}
           </span>

           <span>
            {item.quantity}
            {" × ₹"}
            {item.product.price}
           </span>

          </div>

         )
        )
       }

       <hr/>

       <h2>
        Total: ₹{total}
       </h2>

       <button
        onClick={handlePayment}
        disabled={loading}
       >
        {
         loading
         ?
         "Processing..."
         :
         `Pay ₹${total}`
        }
       </button>

      </>
     )
    }

   </div>

  </div>

 );

};

export default Checkout;