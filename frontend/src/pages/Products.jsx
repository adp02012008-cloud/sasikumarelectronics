import {
 useEffect,
 useState,
} from "react";


import API
from "../api/axios";



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

    res.data.products
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


   setLoading(
    false
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

     key={
      product._id
     }

    >




     <div className="product-img-box">



      {

       product.images
       &&
       product.images.length > 0


       ?


       <img

        src={
         product.images[0].url
        }

        alt={
         product.name
        }

       />



       :



       <img

        src=
        "https://via.placeholder.com/300"

        alt="product"

       />


      }




     </div>







     <div className="product-info">



      <h3>

       {
        product.name
       }

      </h3>




      <p className="category">

       {
        product.category
       }

      </p>





      <p className="price">

       ₹
       {
        product.price
       }

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







      <button className="cart-btn">


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