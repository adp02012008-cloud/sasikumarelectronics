import { useContext, useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const searchWrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    if (user && !isAdmin) {
      fetchCartCount();

      window.addEventListener("cartUpdated", fetchCartCount);
      return () => window.removeEventListener("cartUpdated", fetchCartCount);
    } else {
      setCartCount(0);
    }
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const res = await API.get("/cart");
      const validItems = (res.data.cart?.items || []).filter(
        (item) => item.product
      );
      setCartCount(validItems.length);
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
              className="website-logo-circle"
            />
            <div className="brand-text-wrap">
              <span className="brand-title-gold">SK</span>
              <span className="brand-title-white">ELECTRONICS</span>
            </div>
          </Link>

          <div className="nav-search-wrap" ref={searchWrapRef}>
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
              <div className="user-profile-badge-nav">
                <Link to="/profile" className="nav-user-link">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="nav-user-photo"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="nav-user-initial">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="nav-user-name">
                    Hello, {user.name ? user.name.split(" ")[0] : "Account"}
                  </span>
                </Link>
                <button className="nav-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
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