import {
 useEffect,
 useState,
} from "react";

import API from "../api/axios";

import {
 Link,
} from "react-router-dom";


const Cart = () => {

 const [cart,setCart] =
 useState([]);

 const user =
 JSON.parse(
  localStorage.getItem("user")
 );

 const userId =
 user?._id ||
 user?.id;

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


 const removeItem =
 async(id)=>{

  try{

   await API.delete(
    `/cart/${userId}/${id}`
   );

   fetchCart();

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


 return(

  <div className="cart-page">

   <h1>
    Shopping Cart
   </h1>

   {
    cart.length === 0
    ? (
     <h2>
      Your cart is empty
     </h2>
    )
    : (
     <>

      <div className="cart-list">

       {
        cart.map(
         item=>(

          <div
           className="cart-item"
           key={item._id}
          >

           <img
            src={
             item.product.images?.[0]?.url ||
             "/favicon.svg"
            }
           />

           <div>

            <h3>
             {item.product.name}
            </h3>

            <p>
             Quantity: {item.quantity}
            </p>

            <p>
             ₹{item.product.price}
            </p>

           </div>

           <button
            onClick={()=>
             removeItem(
              item.product._id
             )
            }
           >
            Remove
           </button>

          </div>

         )
        )
       }

      </div>

      <div className="cart-summary">

       <h2>
        Total : ₹{total}
       </h2>

       <Link
        to="/checkout"
        className="checkout-btn"
       >
        Checkout
       </Link>

      </div>

     </>
    )
   }

  </div>

 );

};

export default Cart;