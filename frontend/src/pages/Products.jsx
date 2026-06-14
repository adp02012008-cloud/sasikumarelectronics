import {
 useEffect,
 useState,
} from "react";

import API from "../api/axios";

import {
 useNavigate,
} from "react-router-dom";

const Products = () => {
 const [products, setProducts] = useState([]);
 const [loading, setLoading] = useState(true);
 const [keyword, setKeyword] = useState("");

 const navigate = useNavigate();

 useEffect(() => {
  fetchProducts();
 }, []);

 const fetchProducts = async () => {
  try {
   const res = await API.get("/products");
   setProducts(res.data.products || []);
  } catch (error) {
   console.log(error);
  } finally {
   setLoading(false);
  }
 };

 const addToCart = async (productId) => {
  try {
   const user = JSON.parse(localStorage.getItem("user"));

   if (!user) {
    alert("Please login first");
    navigate("/login");
    return;
   }

   await API.post("/cart/add", {
    productId,
    quantity: 1,
   });

   alert("Product added to cart");
   navigate("/cart");
  } catch (error) {
   alert(
    error.response?.data?.message ||
    "Failed to add product to cart"
   );
  }
 };

 const addToWishlist = async (productId) => {
  try {
   const user = JSON.parse(localStorage.getItem("user"));

   if (!user) {
    alert("Please login first");
    navigate("/login");
    return;
   }

   await API.post("/wishlist/add", {
    productId,
   });

   alert("Product added to wishlist");
   navigate("/wishlist");
  } catch (error) {
   alert(
    error.response?.data?.message ||
    "Failed to add product to wishlist"
   );
  }
 };

 const filteredProducts = products.filter(
  product =>
   product.name
    .toLowerCase()
    .includes(keyword.toLowerCase()) ||
   product.category
    .toLowerCase()
    .includes(keyword.toLowerCase()) ||
   product.brand
    ?.toLowerCase()
    .includes(keyword.toLowerCase())
 );

 return (
  <div className="products-page">
   <div className="products-header">
    <div>
     <h1>Latest Electronics</h1>
     <p>Shop mobiles, laptops, gadgets and accessories</p>
    </div>

    <input
     type="text"
     placeholder="Search products..."
     value={keyword}
     onChange={(e) => setKeyword(e.target.value)}
    />
   </div>

   {loading ? (
    <div className="product-grid">
     {[1, 2, 3, 4].map((item) => (
      <div className="skeleton-card" key={item}></div>
     ))}
    </div>
   ) : filteredProducts.length === 0 ? (
    <h2>No products found</h2>
   ) : (
    <div className="product-grid">
     {filteredProducts.map((product) => (
      <div className="product-card" key={product._id}>
       <div className="product-badge">
        {product.stock > 0 ? "Available" : "Out of Stock"}
       </div>

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

        <div className="rating-row">
         ⭐⭐⭐⭐☆ <span>4.5</span>
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
          ? `In Stock (${product.stock})`
          : "Out Of Stock"}
        </p>

        <div className="product-actions">
         <button
          className="cart-btn"
          disabled={product.stock <= 0}
          onClick={() => addToCart(product._id)}
         >
          Add To Cart
         </button>

         <button
          className="wish-btn"
          onClick={() => addToWishlist(product._id)}
         >
          ❤️
         </button>
        </div>
       </div>
      </div>
     ))}
    </div>
   )}
  </div>
 );
};

export default Products;