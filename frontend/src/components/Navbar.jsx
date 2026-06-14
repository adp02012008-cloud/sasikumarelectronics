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

 return (

  <>

   <div className="top-navbar">

    <div className="brand">
     <Link to="/">
      Sasikumar Electronics
     </Link>
    </div>

    <div className="search-box">
     <input
      type="text"
      placeholder="Search for mobiles, laptops, accessories..."
     />
     <button>
      Search
     </button>
    </div>

    <div className="nav-actions">

     {!user ? (
      <>
       <Link to="/login">
        Login
       </Link>

       <Link to="/register">
        Register
       </Link>
      </>
     ) : (
      <>
       <span>
        Hi, {user.name}
       </span>

       <button
        onClick={logout}
       >
        Logout
       </button>
      </>
     )}

    </div>

   </div>

   <div className="bottom-navbar">

    <Link to="/">
     Home
    </Link>

    <Link to="/products">
     Products
    </Link>

    {user && (
     <>
      <Link to="/wishlist">
       Wishlist
      </Link>

      <Link to="/cart">
       Cart
      </Link>

      <Link to="/orders">
       Orders
      </Link>
     </>
    )}

    {user?.role === "admin" && (
     <>
      <Link to="/admin">
       Dashboard
      </Link>

      <Link to="/admin/products">
       Manage Products
      </Link>

      <Link to="/admin/orders">
       Manage Orders
      </Link>

      <Link to="/admin/users">
       Users
      </Link>
     </>
    )}

   </div>

  </>

 );

};

export default Navbar;