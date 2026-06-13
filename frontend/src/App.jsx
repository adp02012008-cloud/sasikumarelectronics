import {
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import AdminUsers from "./pages/AdminUsers";
import "./App.css";

import Navbar from "./components/Navbar";

function App() {

  return (
    <>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/admin"
          element={
            <AdminDashboard />
          }
        />

        <Route
          path="/admin/products"
          element={
            <AdminProducts />
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminOrders />
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminUsers />
          }
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

      </Routes>

    </>
  );
}

export default App;