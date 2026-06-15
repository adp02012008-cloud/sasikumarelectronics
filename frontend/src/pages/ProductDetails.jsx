import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import API from "../api/axios";

const ProductDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [product, setProduct] =
    useState(null);

  const [reviews, setReviews] =
    useState([]);

  const [selectedImage, setSelectedImage] =
    useState("");

  const [reviewForm, setReviewForm] =
    useState({
      rating: 5,
      comment: "",
    });

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await API.get(
        `/products/${id}`
      );

      setProduct(res.data.product);

      setSelectedImage(
        res.data.product.images?.[0]?.url ||
          "/favicon.svg"
      );
    } catch (error) {
      console.log(error);
      alert("Product not found");
      navigate("/products");
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(
        `/reviews/${id}`
      );

      setReviews(
        res.data.reviews || []
      );
    } catch (error) {
      console.log(error);
    }
  };

  const addToCart = async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      await API.post("/cart/add", {
        productId: id,
        quantity: 1,
      });

      alert("Product added to cart");
      navigate("/cart");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to add product"
      );
    }
  };

  const addToWishlist = async () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      await API.post("/wishlist/add", {
        productId: id,
      });

      alert("Added to wishlist");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Wishlist failed"
      );
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
      alert(
        error.response?.data?.message ||
          "Login required to review"
      );
    }
  };

  if (!product) {
    return (
      <div className="products-page">
        <h2>Loading product...</h2>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <div className="product-detail-card">
        <div className="detail-gallery">
          <div className="thumbnail-list">
            {
              product.images?.length > 0
                ? product.images.map((img) => (
                    <img
                      key={img._id || img.url}
                      src={img.url}
                      alt={product.name}
                      className={
                        selectedImage === img.url
                          ? "active-thumb"
                          : ""
                      }
                      onClick={() =>
                        setSelectedImage(img.url)
                      }
                    />
                  ))
                : (
                    <img
                      src="/favicon.svg"
                      alt="product"
                    />
                  )
            }
          </div>

          <div className="main-detail-image">
            <img
              src={selectedImage}
              alt={product.name}
            />
          </div>
        </div>

        <div className="detail-info">
          <p className="product-category">
            {product.category}
          </p>

          <h1>{product.name}</h1>

          <p className="detail-brand">
            Brand: {product.brand || "Generic"}
          </p>

          <div className="detail-rating">
            ⭐ {product.ratings || 0}
            <span>
              ({product.numReviews || 0} reviews)
            </span>
          </div>

          <hr />

          <h2>₹{product.price}</h2>

          <p
            className={
              product.stock > 0
                ? "stock"
                : "out-stock"
            }
          >
            {product.stock > 0
              ? `In Stock (${product.stock})`
              : "Out of Stock"}
          </p>

          <p className="detail-description">
            {product.description}
          </p>

          <div className="detail-actions">
            <button
              disabled={product.stock <= 0}
              onClick={addToCart}
            >
              Add To Cart
            </button>

            <button
              className="buy-btn"
              disabled={product.stock <= 0}
              onClick={() => {
                addToCart();
              }}
            >
              Buy Now
            </button>

            <button
              className="detail-wish"
              onClick={addToWishlist}
            >
              Add To Wishlist
            </button>
          </div>
        </div>
      </div>

      <div className="review-section">
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

            <button>
              Submit Review
            </button>
          </form>
        </div>

        <div className="review-list-box">
          <h2>Customer Reviews</h2>

          {reviews.length === 0 ? (
            <p>No reviews yet. Be the first to review.</p>
          ) : (
            reviews.map((review) => (
              <div
                className="review-card"
                key={review._id}
              >
                <h3>
                  ⭐ {review.rating} / 5
                </h3>

                <p>
                  {review.comment}
                </p>

                <small>
                  By {review.user?.name || "Customer"}
                </small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;