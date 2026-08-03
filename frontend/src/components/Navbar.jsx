import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    if (user && !isAdmin) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const res = await API.get("/cart");
      const items = res.data.cart?.items || [];
      const totalQty = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
      setCartCount(totalQty);
    } catch {
      setCartCount(0);
    }
  };

  const fetchSuggestions = async () => {
    try {
      if (!keyword.trim()) {
        setSuggestions([]);
        return;
      }

      const res = await API.get(
        `/products/suggestions?keyword=${encodeURIComponent(keyword)}`
      );

      setSuggestions(res.data.suggestions || []);
    } catch (error) {
      console.log(error);
    }
  };

  const searchHandler = () => {
    if (!keyword.trim()) return;

    navigate(`/products?search=${encodeURIComponent(keyword.trim())}`);
    setSuggestions([]);
  };

  const openProduct = (item) => {
    navigate(`/products/${item._id}`);
    setKeyword("");
    setSuggestions([]);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <header className="top-navbar">
        <div className="nav-container">
          <Link to="/" className="brand-logo">
            <img
              src={logo}
              alt="Sasikumar Electronics"
              className="website-logo"
            />
          </Link>

          <div className="nav-search-wrap">
            <div className="nav-search">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchHandler();
                }}
                placeholder="Search bike lights, car accessories, electronics..."
              />

              <button onClick={searchHandler}>Search</button>
            </div>

            {suggestions.length > 0 && (
              <div className="suggestion-box">
                {suggestions.map((item) => (
                  <div
                    className="suggestion-item"
                    key={item._id}
                    onClick={() => openProduct(item)}
                  >
                    <img
                      src={item.images?.[0]?.url || "/favicon.svg"}
                      alt={item.name}
                    />

                    <div>
                      <b>{item.name}</b>
                      <p>
                        {item.category} • ₹{item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="nav-account">
            {user ? (
              <button onClick={handleLogout}>Logout</button>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <nav className="category-navbar">
        <Link to="/">Products</Link>

        {user && !isAdmin && (
          <>
            <Link to="/cart" className="cart-nav-link">
              <span>Cart</span>
              {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
            </Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/orders">Orders</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}

        {!user && (
          <>
            <Link to="/cart" className="cart-nav-link">
              <span>Cart</span>
              {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
            </Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/orders">Orders</Link>
          </>
        )}

        {isAdmin && (
          <>
            <Link className="admin-link" to="/admin">
              Dashboard
            </Link>

            <Link className="admin-link" to="/admin/products">
              Products
            </Link>

            <Link className="admin-link" to="/admin/orders">
              Orders
            </Link>

            <Link className="admin-link" to="/admin/users">
              Users
            </Link>

            <Link className="admin-link" to="/admin/delivery">
              Delivery
            </Link>

            <Link className="admin-link" to="/admin/analytics">
              Analytics
            </Link>
          </>
        )}
      </nav>

      <nav className={`mobile-bottom-nav ${isAdmin ? "admin-mobile-nav" : ""}`}>
        {!user && (
          <>
            <Link to="/">
              🔎
              <span>Products</span>
            </Link>

            <Link to="/login">
              🔑
              <span>Login</span>
            </Link>

            <Link to="/register">
              📝
              <span>Register</span>
            </Link>
          </>
        )}

        {user && !isAdmin && (
          <>
            <Link to="/">
              🔎
              <span>Products</span>
            </Link>

            <Link to="/cart">
              🛒
              <span>Cart</span>
            </Link>

            <Link to="/wishlist">
              ❤️
              <span>Wishlist</span>
            </Link>

            <Link to="/orders">
              📦
              <span>Orders</span>
            </Link>

            <Link to="/profile">
              👤
              <span>Profile</span>
            </Link>
          </>
        )}

        {isAdmin && (
          <>
            <Link to="/admin">
              📊
              <span>Home</span>
            </Link>

            <Link to="/admin/products">
              ➕
              <span>Products</span>
            </Link>

            <Link to="/admin/orders">
              📦
              <span>Orders</span>
            </Link>

            <Link to="/admin/users">
              👥
              <span>Users</span>
            </Link>

            <Link to="/admin/analytics">
              📈
              <span>Stats</span>
            </Link>
          </>
        )}
      </nav>
    </>
  );
};

export default Navbar;