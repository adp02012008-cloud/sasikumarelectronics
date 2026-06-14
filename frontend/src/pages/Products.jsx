import {
 useEffect,
 useState,
} from "react";

import API
from "../api/axios";

import {
 useNavigate,
} from "react-router-dom";


const Products = () => {

 const [
  products,
  setProducts
 ] =
 useState([]);

 const [
  loading,
  setLoading
 ] =
 useState(true);

 const navigate =
 useNavigate();


 useEffect(()=>{

  fetchProducts();

 },[]);


 const fetchProducts =
 async()=>{

  try{

   const res =
   await API.get(
    "/products"
   );

   setProducts(
    res.data.products || []
   );

  }
  catch(error){

   console.log(error);

  }
  finally{

   setLoading(false);

  }

 };


 const addToCart =
 async(productId)=>{

  try{

   const user =
   JSON.parse(
    localStorage.getItem("user")
   );

   if(!user){

    alert(
     "Please login first"
    );

    navigate(
     "/login"
    );

    return;

   }

   const userId =
   user?._id ||
   user?.id;

   await API.post(
    "/cart/add",
    {
     userId,
     productId,
     quantity:1,
    }
   );

   alert(
    "Product added to cart"
   );

   navigate(
    "/cart"
   );

  }
  catch(error){

   console.log(error);

   alert(
    error.response?.data?.message ||
    "Failed to add product to cart"
   );

  }

 };


 return(

  <div className="products-page">

   <div className="page-heading">

    <h1>
     Latest Electronics
    </h1>

    <p>
     Explore our best products and smart deals
    </p>

   </div>

   {
    loading
    ?
    <h2>
     Loading Products...
    </h2>
    :
    <div className="product-grid">

     {
      products.map(
       (product)=>(

        <div
         className="product-card"
         key={product._id}
        >

         <div className="product-img-box">

          {
           product.images &&
           product.images.length > 0
           ?
           <img
            src={product.images[0].url}
            alt={product.name}
           />
           :
           <img
            src="/favicon.svg"
            alt="product"
           />
          }

         </div>

         <div className="product-info">

          <h3>
           {product.name}
          </h3>

          <p className="category">
           {product.category}
          </p>

          <p className="price">
           ₹{product.price}
          </p>

          <p
           className={
            product.stock > 0
            ?
            "stock"
            :
            "out-stock"
           }
          >
           {
            product.stock > 0
            ?
            `In Stock (${product.stock})`
            :
            "Out Of Stock"
           }
          </p>

          <button
           className="cart-btn"
           disabled={product.stock <= 0}
           onClick={()=>
            addToCart(
             product._id
            )
           }
          >
           Add To Cart
          </button>

         </div>

        </div>

       )
      )
     }

    </div>
   }

  </div>

 );

};

export default Products;