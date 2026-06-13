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

    <nav className="navbar">

      <Link to="/">
        Home
      </Link>

      <Link to="/products">
        Products
      </Link>

      <Link to="/wishlist">
        Wishlist
      </Link>

      <Link to="/cart">
        Cart
      </Link>

      <Link to="/checkout">
        Checkout
      </Link>

      <Link to="/orders">
        Orders
      </Link>

      <Link to="/admin">
        Admin
      </Link>

      <Link to="/admin/products">
        Manage Products
      </Link>

      <Link to="/admin/orders">
        Manage Orders
      </Link>

      <Link to="/admin/users">
        Manage Users
      </Link>

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
            Welcome {user.name}
          </span>

          <button
            onClick={logout}
          >
            Logout
          </button>
        </>
      )}

    </nav>

  );
};

export default Navbar;