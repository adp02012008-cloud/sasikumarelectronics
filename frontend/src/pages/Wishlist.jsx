import {
 useEffect,
 useState,
} from "react";


import API
from "../api/axios";



const Wishlist = () => {


 const [
  wishlist,
  setWishlist
 ] =
 useState([]);




 useEffect(()=>{


  fetchWishlist();


 },[]);






 const fetchWishlist =
 async()=>{


  try{


   const token =
   localStorage.getItem(
    "token"
   );



   const res =
   await API.get(

    "/wishlist",

    {

     headers:{

      Authorization:
      `Bearer ${token}`

     }

    }

   );



   setWishlist(

    res.data.wishlist.products
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









 const removeWishlist =
 async(id)=>{


  try{


   const token =
   localStorage.getItem(
    "token"
   );




   await API.delete(

    `/wishlist/${id}`,

    {

     headers:{

      Authorization:
      `Bearer ${token}`

     }

    }


   );




   fetchWishlist();




  }
  catch(error){



   console.log(
    error
   );



  }



 };











 return(


 <div className="wishlist-page">




  <h1>

   My Wishlist

  </h1>







  {


   wishlist.length === 0

   ?

   <h2>

    Wishlist Empty

   </h2>


   :




   <div className="wishlist-grid">



    {


     wishlist.map(

      product=>(




      <div

       className="wishlist-card"

       key={
        product._id
       }

      >






       <img

        src={

         product.images?.[0]?.url

         ||

         "/favicon.svg"

        }


       />








       <h3>


        {
         product.name
        }


       </h3>







       <p>

        ₹

        {
         product.price
        }


       </p>








       <button

        onClick={
         ()=>

         removeWishlist(

          product._id

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


  }





 </div>


 );


};




export default Wishlist;