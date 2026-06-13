import {
 Link,
} from "react-router-dom";


import {
 useContext,
} from "react";


import {
 AuthContext,
} from "../context/AuthContext";




const Navbar = () => {


 const {
  user,
  logout,
 } =
 useContext(
  AuthContext
 );





 return(


 <nav className="navbar">



  {/* LOGO */}


  <div className="nav-logo">


   <Link to="/">

    Sasikumar Electronics

   </Link>


  </div>






  {/* CUSTOMER LINKS */}


  <div className="nav-links">



   <Link to="/">

    Home

   </Link>



   <Link to="/products">

    Products

   </Link>



   {

    user && (

    <>


     <Link to="/wishlist">

      Wishlist

     </Link>



     <Link to="/cart">

      Cart

     </Link>



     <Link to="/orders">

      My Orders

     </Link>


    </>

    )

   }






   {/* ADMIN ONLY */}


   {

    user?.role === "admin"

    &&

    <>


     <Link to="/admin">

      Dashboard

     </Link>



     <Link to="/admin/products">

      Products Admin

     </Link>



     <Link to="/admin/orders">

      Orders Admin

     </Link>



     <Link to="/admin/users">

      Users

     </Link>



    </>


   }






   {/* AUTH */}


   {

    !user

    ?

    <>


     <Link 
      className="login-btn"
      to="/login"
     >

      Login

     </Link>




     <Link
      className="register-btn"
      to="/register"
     >

      Register

     </Link>


    </>


    :

    <>



     <span className="username">

      Hi, {user.name}

     </span>




     <button
      className="logout-btn"
      onClick={
       logout
      }
     >

      Logout

     </button>



    </>

   }



  </div>



 </nav>


 );


};




export default Navbar;