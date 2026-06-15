import {
 useContext,
 useEffect,
 useState,
} from "react";


import {
 Link,
 useNavigate,
} from "react-router-dom";


import {
 AuthContext,
} from "../context/AuthContext";


import API from "../api/axios";



const Navbar = () => {


 const {
  user,
  logout,
 } =
 useContext(
  AuthContext
 );


 const navigate =
 useNavigate();



 const [
  keyword,
  setKeyword,
 ] =
 useState("");



 const [
  suggestions,
  setSuggestions,
 ] =
 useState([]);





 useEffect(()=>{


  const timer =
  setTimeout(()=>{


   fetchSuggestions();


  },300);



  return()=>clearTimeout(timer);


 },[keyword]);





 const fetchSuggestions =
 async()=>{


  try{


   if(
    keyword.trim()
    ===
    ""
   ){

    setSuggestions([]);

    return;

   }



   const res =
   await API.get(
    `/products/suggestions?keyword=${keyword}`
   );



   setSuggestions(
    res.data.suggestions || []
   );


  }
  catch(error){

   console.log(error);

  }


 };







 const searchHandler =
 ()=>{


  if(
   keyword.trim()
  ){


   navigate(
    `/products?search=${keyword}`
   );


   setSuggestions([]);


  }


 };







 const openProduct =
 (name)=>{


  setKeyword(name);


  navigate(
   `/products?search=${name}`
  );


  setSuggestions([]);


 };










 return(


 <>


 <nav className="main-navbar">



  <div className="nav-logo">


   <Link to="/">

    ⚡ Sasikumar Electronics

   </Link>


  </div>







  <div className="nav-search">


   <input

    value={
     keyword
    }

    onChange={
     (e)=>
     setKeyword(
      e.target.value
     )
    }


    placeholder=
    "Search bike lights, car accessories, electrical products..."


   />



   <button
    onClick={
     searchHandler
    }
   >

    Search

   </button>





   {


    suggestions.length > 0
    &&


    <div className="suggestion-box">


    {

     suggestions.map(
      item=>(


       <div

        className="suggestion-item"

        key={
         item._id
        }

        onClick={
         ()=>openProduct(
          item.name
         )
        }

       >


        <img

         src={
          item.images?.[0]?.url
         }

        />


        <div>


         <b>
          {item.name}
         </b>


         <p>

          {item.category}

          {" • ₹"}

          {item.price}

         </p>



        </div>



       </div>


      )
     )


    }


    </div>


   }



  </div>








  <div className="nav-user">



   {


    user

    ?

    <>


    <span>

     👋 {user.name}

    </span>



    <button
     onClick={
      logout
     }
    >

     Logout

    </button>


    </>



    :



    <>


    <Link to="/login">

     Login

    </Link>



    <Link to="/register">

     Register

    </Link>



    </>



   }




  </div>


 </nav>










 <div className="category-navbar">



  <Link to="/">

   Home

  </Link>



  <Link to="/products">

   Products

  </Link>







  {

   user &&


   <>


    <Link to="/wishlist">

     ❤️ Wishlist

    </Link>



    <Link to="/cart">

     🛒 Cart

    </Link>



    <Link to="/orders">

     Orders

    </Link>


   </>


  }








  {


   user?.role==="admin"

   &&


   <>


    <Link
     className="admin-link"
     to="/admin"
    >

     Dashboard

    </Link>





    <Link
     className="admin-link"
     to="/admin/products"
    >

     Add Products

    </Link>





    <Link
     className="admin-link"
     to="/admin/orders"
    >

     Manage Orders

    </Link>





    <Link
     className="admin-link"
     to="/admin/users"
    >

     Users

    </Link>





    <Link
     className="admin-link"
     to="/admin/analytics"
    >

     Analytics

    </Link>




   </>


  }





 </div>



 </>


 );


};


export default Navbar;