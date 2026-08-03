import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate, useSearchParams } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistBusy, setWishlistBusy] = useState([]);

  // Filter & Sort States
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [showMobileFilter, setShowMobileFilter] = useState(false);

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

      if (wishlistBusy.includes(productId)) return;

      const alreadySaved = wishlistIds.includes(productId);
      setWishlistBusy((prev) => [...prev, productId]);

      setWishlistIds((prev) => {
        if (alreadySaved) {
          return prev.filter((id) => id !== productId);
        }
        return [...new Set([...prev, productId])];
      });

      if (alreadySaved) {
        await API.delete(`/wishlist/${productId}`);
      } else {
        await API.post("/wishlist/add", { productId });
      }
    } catch (error) {
      fetchWishlistIds();
      alert(
        error.response?.data?.message || "Wishlist update failed"
      );
    } finally {
      setWishlistBusy((prev) =>
        prev.filter((id) => id !== productId)
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

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedPriceRange("all");
    setInStockOnly(false);
    setSortBy("featured");
    setShowMobileFilter(false);
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
      setReviewForm({ rating: 5, comment: "" });
      fetchProducts(keyword);
    } catch (error) {
      alert(
        error.response?.data?.message || "Please login to add review"
      );
    }
  };

  // Derive unique categories dynamically
  const categories = [
    "all",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }
      if (selectedPriceRange === "0-200" && product.price > 200) return false;
      if (
        selectedPriceRange === "200-500" &&
        (product.price < 200 || product.price > 500)
      )
        return false;
      if (
        selectedPriceRange === "500-1000" &&
        (product.price < 500 || product.price > 1000)
      )
        return false;
      if (selectedPriceRange === "1000+" && product.price < 1000) return false;

      if (inStockOnly && product.stock <= 0) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return (b.ratings || 0) - (a.ratings || 0);
      return 0;
    });

  const hasActiveFilters =
    selectedCategory !== "all" || selectedPriceRange !== "all" || inStockOnly;

  return (
    <div className="amazon-search-page">
      {/* Mobile Filter & Sort Bar */}
      <div className="mobile-filter-bar">
        <button
          type="button"
          className="mobile-filter-btn"
          onClick={() => setShowMobileFilter(!showMobileFilter)}
        >
          <span>🔍 Filter Products</span>
          {hasActiveFilters && <span className="active-filter-badge">Active</span>}
        </button>

        <div className="mobile-sort-wrap">
          <span>Sort:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      {/* Amazon Sub-Header Search / Title Strip */}
      <div className="amazon-search-bar-strip">
        <div className="amazon-results-info">
          1-{filteredProducts.length} of over {products.length} results for{" "}
          <span className="search-term-highlight">
            "{keyword.trim() || "electronics"}"
          </span>
        </div>

        <div className="amazon-top-sort">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Avg. Customer Review</option>
          </select>
        </div>
      </div>

      {/* Main Content Area (Sidebar + Product Rows) */}
      <div className="amazon-layout-container">
        {/* Left Amazon Sidebar Filter */}
        <aside className={`amazon-sidebar ${showMobileFilter ? "mobile-drawer-open" : ""}`}>
          <div className="mobile-sidebar-close-header">
            <h3>Filter Products</h3>
            <button
              type="button"
              className="close-drawer-btn"
              onClick={() => setShowMobileFilter(false)}
            >
              ✕ Close
            </button>
          </div>
          {/* Categories */}
          <div className="amazon-filter-block">
            <h4 className="amazon-filter-title">Department / Category</h4>
            <div className="amazon-filter-list">
              {categories.map((cat) => (
                <label key={cat} className="amazon-filter-item">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                  />
                  <span>{cat === "all" ? "All Electronics" : cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Eligible for Free Delivery */}
          <div className="amazon-filter-block">
            <h4 className="amazon-filter-title">Eligible for Free Delivery</h4>
            <label className="amazon-filter-item">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span>FREE Shipping</span>
            </label>
          </div>

          {/* Price Filter */}
          <div className="amazon-filter-block">
            <h4 className="amazon-filter-title">Price</h4>
            <div className="amazon-filter-list">
              {[
                { label: "All Prices", value: "all" },
                { label: "Under ₹200", value: "0-200" },
                { label: "₹200 - ₹500", value: "200-500" },
                { label: "₹500 - ₹1,000", value: "500-1000" },
                { label: "Over ₹1,000", value: "1000+" },
              ].map((opt) => (
                <label key={opt.value} className="amazon-filter-item">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={selectedPriceRange === opt.value}
                    onChange={() => setSelectedPriceRange(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="amazon-filter-block">
            <h4 className="amazon-filter-title">Customer Reviews</h4>
            <div className="amazon-rating-filters">
              <div
                className="amazon-rating-link"
                onClick={() => setSortBy("rating")}
              >
                <span className="stars-gold">★★★★☆</span> & Up
              </div>
              <div
                className="amazon-rating-link"
                onClick={() => setSortBy("rating")}
              >
                <span className="stars-gold">★★★☆☆</span> & Up
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          <button
            type="button"
            className="amazon-reset-btn"
            onClick={resetFilters}
          >
            Clear All Filters
          </button>
        </aside>

        {/* Right Main Product Feed */}
        <main className="amazon-product-feed">
          <h2 className="amazon-results-heading">Results</h2>
          <p className="amazon-results-subtext">
            Check each product page for other buying options.
          </p>

          {loading ? (
            <div className="amazon-skeleton-list">
              {[1, 2, 3].map((n) => (
                <div key={n} className="amazon-skeleton-row"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="amazon-empty-box">
              <h3>No results found</h3>
              <p>Try resetting your filters or searching for another electronic item.</p>
              <button onClick={resetFilters}>Clear All Filters</button>
            </div>
          ) : (
            <div className="amazon-rows-wrapper">
              {filteredProducts.map((product) => {
                const saved = wishlistIds.includes(product._id);
                const mrp = Math.round(product.price * 1.35);
                const discount = Math.round(((mrp - product.price) / mrp) * 100);
                const rating = product.ratings || 4.5;
                const reviewsCount = product.numReviews || 838;

                return (
                  <div
                    className="amazon-product-row"
                    key={product._id}
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    {/* Left Column: Product Image */}
                    <div className="amazon-row-img-col">
                      <button
                        type="button"
                        className={`amazon-heart-btn ${saved ? "saved" : ""}`}
                        disabled={wishlistBusy.includes(product._id)}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product._id);
                        }}
                        title={saved ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        {saved ? "♥" : "♡"}
                      </button>

                      <img
                        src={product.images?.[0]?.url || "/favicon.svg"}
                        alt={product.name}
                        loading="lazy"
                      />
                    </div>

                    {/* Right Column: Product Info & Actions */}
                    <div className="amazon-row-details-col">
                      <div className="amazon-sponsored-tag">
                        <span>Sponsored</span> ⓘ
                      </div>

                      <h3 className="amazon-row-title">{product.name}</h3>

                      {/* Rating & Reviews */}
                      <div className="amazon-row-rating">
                        <span className="amazon-rating-score">
                          {rating.toFixed(1)}
                        </span>
                        <span className="amazon-stars-icons">
                          ★★★★☆
                        </span>
                        <span className="amazon-rating-count">
                          ({reviewsCount.toLocaleString()})
                        </span>
                      </div>

                      {/* Pricing Line */}
                      <div className="amazon-row-price-line">
                        <span className="amazon-currency">₹</span>
                        <span className="amazon-main-price">
                          {product.price.toLocaleString("en-IN")}
                        </span>
                        <span className="amazon-mrp-text">
                          M.R.P.: <span className="amazon-mrp-val">₹{mrp.toLocaleString("en-IN")}</span>
                        </span>
                        <span className="amazon-discount-percent">
                          ({discount}% off)
                        </span>
                      </div>

                      {/* Card Offers */}
                      <p className="amazon-card-offer">
                        Up to 10% Off on select payment cards
                      </p>

                      {/* Delivery Status */}
                      <p className="amazon-delivery-info">
                        <b>FREE delivery</b> <b>Tomorrow, 4 Aug</b>
                      </p>

                      <p className="amazon-stock-status">
                        {product.stock > 0
                          ? `In Stock (${product.stock} available)`
                          : "Currently Unavailable"}
                      </p>

                      {/* Amazon Yellow Button */}
                      <div
                        className="amazon-button-wrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="amazon-yellow-pill-btn"
                          disabled={product.stock <= 0}
                          onClick={() => addToCart(product._id)}
                        >
                          Add to cart
                        </button>
                      </div>

                      <button
                        className="amazon-review-trigger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReviewProduct(product);
                        }}
                      >
                        Rate & Review Product
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Review Modal */}
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
              <option value="5">5 ★ - Excellent</option>
              <option value="4">4 ★ - Good</option>
              <option value="3">3 ★ - Average</option>
              <option value="2">2 ★ - Poor</option>
              <option value="1">1 ★ - Bad</option>
            </select>

            <label>Comment</label>
            <textarea
              placeholder="Write your review here..."
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({
                  ...reviewForm,
                  comment: e.target.value,
                })
              }
            />

            <div className="review-modal-actions">
              <button onClick={submitReview}>Submit Review</button>
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