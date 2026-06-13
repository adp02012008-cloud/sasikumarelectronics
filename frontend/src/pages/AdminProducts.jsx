import {
 useEffect,
 useState,
} from "react";


import API from "../api/axios";



const AdminProducts = () => {


 const [
  products,
  setProducts
 ] =
 useState([]);




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


 };







 const deleteProduct =
 async(id)=>{


  if(
   !window.confirm(
    "Delete this product?"
   )
  )
  return;



  try{


   const token =
   localStorage.getItem(
    "token"
   );



   await API.delete(

    `/products/${id}`,

    {

     headers:{

      Authorization:
      `Bearer ${token}`

     }

    }

   );



   fetchProducts();



  }
  catch(error){


   alert(
    "Delete Failed"
   );


   console.log(
    error
   );


  }


 };










 return(


 <div className="admin-products">



  <h1>

   Product Management

  </h1>






  <div className="table-box">



  <table>



   <thead>


    <tr>


     <th>
      Image
     </th>


     <th>
      Product
     </th>



     <th>
      Category
     </th>



     <th>
      Price
     </th>



     <th>
      Stock
     </th>



     <th>
      Action
     </th>


    </tr>



   </thead>







   <tbody>


   {


    products.map(

     product=>(



      <tr
       key={
        product._id
       }
      >



       <td>


        <img

         className="admin-img"

         src={

          product.images?.[0]?.url

          ||

          "https://via.placeholder.com/80"

         }

        />


       </td>






       <td>

        {
         product.name
        }

       </td>






       <td>

        {
         product.category
        }

       </td>






       <td>

        ₹

        {
         product.price
        }

       </td>






       <td>


        <span

         className={

          product.stock > 5

          ?

          "stock-ok"

          :

          "stock-low"

         }

        >


        {
         product.stock
        }


        </span>


       </td>







       <td>


        <button

         className="delete-btn"


         onClick={
          ()=>

          deleteProduct(

           product._id

          )

         }

        >


         Delete


        </button>



       </td>





      </tr>


     )

    )

   }


   </tbody>




  </table>



  </div>



 </div>


 );


};




export default AdminProducts;