import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await API.get("/wishlist");
      setWishlist(res.data.wishlist?.products || []);
    } catch (error) {
      console.log(error);
    }
  };

  const removeWishlist = async (id) => {
    try {
      await API.delete(`/wishlist/${id}`);
      fetchWishlist();
    } catch (error) {
      console.log(error);
    }
  };

  const addToCart = async (productId) => {
    try {
      await API.post("/cart/add", {
        productId,
        quantity: 1,
      });

      alert("Added to cart");
      navigate("/cart");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add cart");
    }
  };

  return (
    <div className="account-layout">
      <aside className="account-sidebar">
        <div className="account-user">
          <div className="avatar">👤</div>

          <div>
            <p>Hello,</p>
            <h3>Customer</h3>
          </div>
        </div>

        <button onClick={() => navigate("/orders")}>
          📦 My Orders
        </button>

        <button className="active">
          ❤️ My Wishlist
        </button>

        <button onClick={() => navigate("/cart")}>
          🛒 My Cart
        </button>
      </aside>

      <main className="wishlist-page pro-wishlist-page">
        <div className="page-title-row">
          <h1>My Wishlist ({wishlist.length})</h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-box">
            <h2>Wishlist Empty</h2>

            <button onClick={() => navigate("/products")}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="wishlist-list">
            {wishlist.map((product) => (
              <div className="wishlist-row" key={product._id}>
                <img
                  src={product.images?.[0]?.url || "/favicon.svg"}
                  alt={product.name}
                  onClick={() => navigate(`/products/${product._id}`)}
                />

                <div className="wishlist-info">
                  <h3 onClick={() => navigate(`/products/${product._id}`)}>
                    {product.name}
                  </h3>

                  <p>{product.category}</p>

                  <div className="rating-row">
                    ⭐ {product.ratings || 0} ({product.numReviews || 0})
                  </div>

                  <h2>₹{product.price}</h2>

                  <span className="green-text">
                    {product.stock > 0 ? "In stock" : "Out of stock"}
                  </span>

                  <div className="wishlist-actions">
                    <button
                      disabled={product.stock <= 0}
                      onClick={() => addToCart(product._id)}
                    >
                      Add to Cart
                    </button>

                    <button
                      className="remove-outline"
                      onClick={() => removeWishlist(product._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;