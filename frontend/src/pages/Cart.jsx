import { useEffect, useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await API.get("/cart");
      setCart(res.data.cart.items || []);
    } catch (error) {
      console.log(error);
    }
  };

  const removeItem = async (id) => {
    try {
      await API.delete(`/cart/${id}`);
      fetchCart();
    } catch (error) {
      console.log(error);
    }
  };

  const increaseQty = async (productId) => {
    try {
      await API.post("/cart/add", {
        productId,
        quantity: 1,
      });

      fetchCart();
    } catch (error) {
      console.log(error);
    }
  };

  const itemsTotal = cart.reduce(
    (sum, item) =>
      sum + item.product.price * item.quantity,
    0
  );

  const deliveryCharge =
    itemsTotal > 0 && itemsTotal < 1000 ? 80 : 0;

  const marketplaceFee =
    itemsTotal > 0 ? 5 : 0;

  const orderTotal =
    itemsTotal + deliveryCharge + marketplaceFee;

  return (
    <div className="cart-page pro-cart-page">
      <div className="cart-top-box">
        <h1>Shopping Cart</h1>

        {cart.length > 0 && (
          <>
            <h2>
              Total ₹{orderTotal}
            </h2>

            <Link
              to="/checkout"
              className="mobile-buy-btn"
            >
              Proceed to Buy ({cart.length} items)
            </Link>
          </>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart-box">
          <h2>Your cart is empty</h2>
          <Link to="/products">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cart.map((item) => (
              <div
                className="cart-item pro-cart-item"
                key={item._id}
              >
                <div className="cart-check">✓</div>

                <img
                  src={
                    item.product.images?.[0]?.url ||
                    "/favicon.svg"
                  }
                  alt={item.product.name}
                />

                <div className="cart-info">
                  <h3>{item.product.name}</h3>

                  <p className="cart-category">
                    {item.product.category}
                  </p>

                  <h2>₹{item.product.price}</h2>

                  <p className="cart-stock">
                    In stock
                  </p>

                  <p className="cart-return">
                    10 days returnable
                  </p>

                  <div className="cart-actions">
                    <div className="qty-box">
                      <button
                        onClick={() =>
                          removeItem(item.product._id)
                        }
                      >
                        🗑
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          increaseQty(item.product._id)
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="cart-delete-btn"
                      onClick={() =>
                        removeItem(item.product._id)
                      }
                    >
                      Delete
                    </button>

                    <button className="cart-save-btn">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary pro-cart-summary">
            <p>
              Items:
              <span>₹{itemsTotal}</span>
            </p>

            <p>
              Delivery:
              <span>₹{deliveryCharge}</span>
            </p>

            <p>
              Marketplace Fee:
              <span>₹{marketplaceFee}</span>
            </p>

            {deliveryCharge === 0 && (
              <p className="saving-line">
                FREE Delivery
                <span>-₹80</span>
              </p>
            )}

            <h2>
              Order Total:
              <span>₹{orderTotal}</span>
            </h2>

            <Link
              to="/checkout"
              className="checkout-btn"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;