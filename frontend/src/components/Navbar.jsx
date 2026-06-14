import {
 Link
} from "react-router-dom";

import {
 useContext
} from "react";

import {
 AuthContext
} from "../context/AuthContext";


const Navbar = () => {


 const {
  user,
  logout
 } =
 useContext(
  AuthContext
 );


 return (

 <>

 <nav className="main-navbar">


  <div className="nav-logo">

   <Link to="/">
    ⚡ Sasikumar Electronics
   </Link>

  </div>




  <div className="nav-search">

   <input
    placeholder="Search mobiles, laptops, accessories..."
   />

   <button>
    Search
   </button>

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
      onClick={logout}
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
   <Link
    className="admin-link"
    to="/admin"
   >
    Admin Panel
   </Link>
  }



 </div>


 </>

 );


};


export default Navbar;