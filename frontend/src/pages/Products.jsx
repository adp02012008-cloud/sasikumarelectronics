import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate, useSearchParams } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);

  const [reviewProduct, setReviewProduct] = useState(null);

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const searchValue = searchParams.get("search") || "";

    setKeyword(searchValue);
    fetchProducts(searchValue);
    fetchWishlistIds();
  }, [searchParams]);

  const getLoggedUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const fetchProducts = async (search = "") => {
    try {
      setLoading(true);

      const res = await API.get(
        search
          ? `/products?keyword=${encodeURIComponent(search)}`
          : "/products"
      );

      setProducts(res.data.products || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistIds = async () => {
    try {
      const user = getLoggedUser();

      if (!user) {
        setWishlistIds([]);
        return;
      }

      const res = await API.get("/wishlist");

      const ids =
        res.data.wishlist?.products?.map((product) => product._id) || [];

      setWishlistIds(ids);
    } catch (error) {
      console.log(error);
    }
  };

  const addToCart = async (productId) => {
    try {
      const user = getLoggedUser();

      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      await API.post("/cart/add", {
        productId,
        quantity: 1,
      });

      navigate("/cart");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to add product to cart"
      );
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      const user = getLoggedUser();

      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const alreadySaved = wishlistIds.includes(productId);

      if (alreadySaved) {
        await API.delete(`/wishlist/${productId}`);

        setWishlistIds((prev) =>
          prev.filter((id) => id !== productId)
        );
      } else {
        await API.post("/wishlist/add", {
          productId,
        });

        setWishlistIds((prev) => [...prev, productId]);
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Wishlist update failed"
      );
    }
  };

  const searchProducts = () => {
    navigate(
      keyword.trim()
        ? `/products?search=${encodeURIComponent(keyword.trim())}`
        : "/products"
    );
  };

  const submitReview = async () => {
    try {
      if (!reviewProduct) return;

      await API.post("/reviews", {
        product: reviewProduct._id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });

      alert("Review submitted successfully");

      setReviewProduct(null);

      setReviewForm({
        rating: 5,
        comment: "",
      });

      fetchProducts(keyword);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Please login to add review"
      );
    }
  };

  return (
    <div className="products-page">
      <div className="products-header industrial-products-header">
        <div>
          <h1>Industrial & Automobile Electronics</h1>

          <p>
            Bike accessories, car electricals, LED lights,
            wiring, switches and workshop essentials
          </p>
        </div>

        <div className="product-search-line">
          <input
            type="text"
            placeholder="Search bike light, car horn, wire, switch..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchProducts();
            }}
          />

          <button onClick={searchProducts}>
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="product-grid">
          {[1, 2, 3, 4].map((item) => (
            <div className="skeleton-card" key={item}></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <h2>No products found</h2>
      ) : (
        <div className="product-grid">
          {products.map((product) => {
            const saved = wishlistIds.includes(product._id);

            return (
              <div
                className="product-card pro-product-card"
                key={product._id}
                onClick={() => navigate(`/products/${product._id}`)}
              >
                <div className="product-badge">
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </div>

                <button
                  className={`card-heart-btn ${saved ? "saved" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product._id);
                  }}
                  title={saved ? "Remove from wishlist" : "Save to wishlist"}
                >
                  {saved ? "♥" : "♡"}
                </button>

                <div className="product-img-box">
                  <img
                    src={
                      product.images?.[0]?.url ||
                      "/favicon.svg"
                    }
                    alt={product.name}
                  />
                </div>

                <div className="product-info">
                  <p className="product-category">
                    {product.category}
                  </p>

                  <h3>{product.name}</h3>

                  <p className="product-desc">
                    {product.description}
                  </p>

                  <div className="rating-row">
                    ⭐ {product.ratings || 0}
                    <span>
                      ({product.numReviews || 0} reviews)
                    </span>
                  </div>

                  <p className="price">
                    ₹{product.price}
                  </p>

                  <p
                    className={
                      product.stock > 0
                        ? "stock"
                        : "out-stock"
                    }
                  >
                    {product.stock > 0
                      ? `Available (${product.stock})`
                      : "Currently unavailable"}
                  </p>

                  <div
                    className="product-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="cart-btn"
                      disabled={product.stock <= 0}
                      onClick={() => addToCart(product._id)}
                    >
                      Add To Cart
                    </button>
                  </div>

                  <button
                    className="review-open-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReviewProduct(product);
                    }}
                  >
                    Rate / Comment
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewProduct && (
        <div className="review-modal-bg">
          <div className="review-modal">
            <h2>Review Product</h2>

            <p>{reviewProduct.name}</p>

            <label>Rating</label>

            <select
              value={reviewForm.rating}
              onChange={(e) =>
                setReviewForm({
                  ...reviewForm,
                  rating: e.target.value,
                })
              }
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Bad</option>
            </select>

            <label>Comment</label>

            <textarea
              placeholder="Write your experience..."
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({
                  ...reviewForm,
                  comment: e.target.value,
                })
              }
            />

            <div className="review-modal-actions">
              <button onClick={submitReview}>
                Submit Review
              </button>

              <button
                className="cancel-review"
                onClick={() => setReviewProduct(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;