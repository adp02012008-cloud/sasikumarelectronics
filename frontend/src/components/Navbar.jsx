import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const fetchSuggestions = async () => {
    try {
      if (!keyword.trim()) {
        setSuggestions([]);
        return;
      }

      const res = await API.get(
        `/products/suggestions?keyword=${keyword}`
      );

      setSuggestions(res.data.suggestions || []);
    } catch (error) {
      console.log(error);
    }
  };

  const searchHandler = () => {
    if (!keyword.trim()) return;

    navigate(`/products?search=${keyword}`);
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
            <span>⚡</span>
            Sasikumar Electronics
          </Link>

          <div className="nav-search-wrap">
            <div className="nav-search">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") searchHandler();
                }}
                placeholder="Search bike lights, car accessories, electrical products..."
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
              <>
                <span className="hello-user">
                  Hello, <b>{user.name}</b>
                </span>

                <button onClick={handleLogout}>Logout</button>
              </>
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
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>

        {user && (
          <>
            <Link to="/wishlist">❤️ Wishlist</Link>
            <Link to="/cart">🛒 Cart</Link>
            <Link to="/orders">Orders</Link>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <Link className="admin-link" to="/admin">
              Dashboard
            </Link>

            <Link className="admin-link" to="/admin/products">
              Add Products
            </Link>

            <Link className="admin-link" to="/admin/orders">
              Manage Orders
            </Link>

            <Link className="admin-link" to="/admin/users">
              Users
            </Link>

            <Link className="admin-link" to="/admin/analytics">
              Analytics
            </Link>
          </>
        )}
      </nav>

      <nav className="mobile-bottom-nav">
        <Link to="/">🏠<span>Home</span></Link>
        <Link to="/products">🔎<span>Shop</span></Link>
        <Link to="/cart">🛒<span>Cart</span></Link>
        <Link to="/orders">📦<span>Orders</span></Link>
        <Link to="/wishlist">❤️<span>Wishlist</span></Link>
      </nav>
    </>
  );
};

export default Navbar;