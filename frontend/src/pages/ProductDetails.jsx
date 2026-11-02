import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import ShareModal from "../components/ShareModal";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    checkWishlistStatus();
  }, [id]);

  const handleShare = async () => {
    if (!product) return;
    const origin = window.location.origin;
    const shareUrl = `${origin}/products/${product._id}`;
    const priceFormatted = Number(product.price || 0).toLocaleString("en-IN");
    const shareText = `Check out ${product.name} on Sasikumar Electronics for ₹${priceFormatted}!`;

    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: `${product.name} | Sasikumar Electronics`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    setIsShareOpen(true);
  };

  const getLoggedUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      const prod = res.data.product;

      setProduct(prod);
      setSelectedImage(
        prod.images?.[0]?.url || "/favicon.svg"
      );

      if (prod) {
        document.title = `${prod.name} | Sasikumar Electronics`;

        const setMeta = (attr, val, content) => {
          if (!content) return;
          let el = document.querySelector(`meta[${attr}="${val}"]`);
          if (!el) {
            el = document.createElement("meta");
            el.setAttribute(attr, val);
            document.head.appendChild(el);
          }
          el.setAttribute("content", content);
        };

        const imgUrl = prod.images?.[0]?.url || "";
        if (imgUrl) {
          setMeta("property", "og:image", imgUrl);
          setMeta("name", "twitter:image", imgUrl);
        }
        setMeta("property", "og:title", `${prod.name} - ₹${prod.price}`);
        setMeta("name", "twitter:title", `${prod.name} - ₹${prod.price}`);
        if (prod.description) {
          setMeta("property", "og:description", prod.description.slice(0, 160));
          setMeta("name", "description", prod.description.slice(0, 160));
        }
      }
    } catch (error) {
      console.log(error);
      alert("Product not found");
      navigate("/products");
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/${id}`);
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.log(error);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const user = getLoggedUser();

      if (!user) {
        setIsWishlisted(false);
        return;
      }

      const res = await API.get("/wishlist");

      const saved =
        res.data.wishlist?.products?.some(
          (product) => product._id === id
        ) || false;

      setIsWishlisted(saved);
    } catch (error) {
      console.log(error);
    }
  };

  const addToCart = async (goCart = true) => {
    try {
      const user = getLoggedUser();

      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      await API.post("/cart/add", {
        productId: id,
        quantity,
      });

      if (goCart) {
        navigate("/cart");
      } else {
        alert("Product added to cart");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add product");
    }
  };

  const buyNow = async () => {
    await addToCart(true);
  };

  const toggleWishlist = async () => {
    try {
      const user = getLoggedUser();

      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      if (wishlistBusy) return;

      setWishlistBusy(true);

      const oldValue = isWishlisted;
      setIsWishlisted(!oldValue);

      if (oldValue) {
        await API.delete(`/wishlist/${id}`);
      } else {
        await API.post("/wishlist/add", {
          productId: id,
        });
      }
    } catch (error) {
      checkWishlistStatus();
      alert(error.response?.data?.message || "Wishlist failed");
    } finally {
      setWishlistBusy(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();

    try {
      await API.post("/reviews", {
        product: id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });

      alert("Review submitted");

      setReviewForm({
        rating: 5,
        comment: "",
      });

      fetchProduct();
      fetchReviews();
    } catch (error) {
      alert(error.response?.data?.message || "Login required to review");
    }
  };

  if (!product) {
    return (
      <div className="products-page">
        <h2>Loading product...</h2>
      </div>
    );
  }

  const mrp = Math.round(product.price * 1.5);
  const discount = Math.round(((mrp - product.price) / mrp) * 100);

  return (
    <div className="amazon-detail-page">
      <div className="breadcrumb">
        Home / {product.category} / {product.name}
      </div>

      <div className="amazon-detail-grid">
        <div className="amazon-gallery">
          <div className="thumb-column">
            {product.images?.length > 0 ? (
              product.images.map((img) => (
                <img
                  key={img._id || img.url}
                  src={img.url}
                  alt={product.name}
                  className={selectedImage === img.url ? "active-thumb" : ""}
                  onClick={() => setSelectedImage(img.url)}
                />
              ))
            ) : (
              <img src="/favicon.svg" alt="product" />
            )}
          </div>

          <div className="big-image-box">
            <div className="image-floating-actions">
              <button
                type="button"
                className={`floating-heart ${isWishlisted ? "saved" : ""}`}
                disabled={wishlistBusy}
                onClick={toggleWishlist}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                {isWishlisted ? "♥" : "♡"}
              </button>

              <button
                type="button"
                className="floating-share-btn"
                onClick={handleShare}
                title="Share this product"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </button>
            </div>

            <img src={selectedImage} alt={product.name} />
          </div>
        </div>

        <div className="product-main-info">
          <div className="product-title-row">
            <h1>{product.name}</h1>
            <button
              type="button"
              className="detail-header-share-btn"
              onClick={handleShare}
              title="Share product"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <span>Share</span>
            </button>
          </div>

          <p className="brand-line">
            Brand: <b>{product.brand || "Generic"}</b>
          </p>

          <div className="rating-line">
            ⭐ {product.ratings || 0} ({product.numReviews || 0} reviews)
          </div>

          <hr />

          <p className="deal-tag">Limited time deal</p>

          <div className="detail-price-row">
            <span>-{discount}%</span>
            <h2>₹{product.price}</h2>
          </div>

          <p className="mrp-line">
            M.R.P.: <del>₹{mrp}</del>
          </p>

          <p className="tax-line">Inclusive of all taxes</p>

          <div className="offer-grid">
            <div>
              <b>Cashback</b>
              <p>Save more with online payment offers</p>
            </div>

            <div>
              <b>Partner Offers</b>
              <p>Special discounts on selected products</p>
            </div>

            <div>
              <b>Invoice</b>
              <p>Invoice available after order</p>
            </div>
          </div>

          <h3>About this item</h3>

          <p className="detail-description">{product.description}</p>
        </div>

        <aside className="buy-box">
          <h2>₹{product.price}</h2>

          <p className="delivery-line">
            FREE delivery available at checkout
          </p>

          <p className={product.stock > 0 ? "stock big-stock" : "out-stock"}>
            {product.stock > 0 ? "In stock" : "Out of stock"}
          </p>

          <label>Quantity</label>

          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>

          <button
            className="amazon-cart-btn"
            disabled={product.stock <= 0}
            onClick={() => addToCart(false)}
          >
            Add to Cart
          </button>

          <button
            className="amazon-buy-btn"
            disabled={product.stock <= 0}
            onClick={buyNow}
          >
            Buy Now
          </button>

          <button
            className={`wishlist-wide ${isWishlisted ? "saved" : ""}`}
            disabled={wishlistBusy}
            onClick={toggleWishlist}
          >
            {isWishlisted ? "Saved in Wishlist ♥" : "Add to Wish List"}
          </button>

          <button
            type="button"
            className="share-wide-btn"
            onClick={handleShare}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Share this product
          </button>

          <p className="secure-text">🔒 Secure transaction</p>
        </aside>
      </div>

      <section className="reviews-area">
        <div className="review-form-box">
          <h2>Rate This Product</h2>

          <form onSubmit={submitReview}>
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

            <textarea
              required
              placeholder="Write your product experience..."
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({
                  ...reviewForm,
                  comment: e.target.value,
                })
              }
            />

            <button>Submit Review</button>
          </form>
        </div>

        <div className="review-list-box">
          <h2>Customer Reviews</h2>

          {reviews.length === 0 ? (
            <p>No reviews yet. Be the first to review.</p>
          ) : (
            reviews.map((review) => (
              <div className="review-card" key={review._id}>
                <h3>⭐ {review.rating} / 5</h3>
                <p>{review.comment}</p>
                <small>By {review.user?.name || "Customer"}</small>
              </div>
            ))
          )}
        </div>
      </section>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        product={product}
      />
    </div>
  );
};

export default ProductDetails;