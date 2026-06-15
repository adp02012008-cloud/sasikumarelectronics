import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const validCart = useMemo(() => {
    return cart.filter((item) => item.product);
  }, [cart]);

  const selectedCartItems = useMemo(() => {
    return validCart.filter((item) =>
      selectedItems.includes(item.product._id)
    );
  }, [validCart, selectedItems]);

  const itemsTotal = selectedCartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  useEffect(() => {
    calculateDeliveryCharge();
  }, [itemsTotal]);

  const fetchCart = async () => {
    try {
      const res = await API.get("/cart");
      const items = res.data.cart.items || [];

      setCart(items);
      setSelectedItems(
        items
          .filter((item) => item.product)
          .map((item) => item.product._id)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const calculateDeliveryCharge = async () => {
    try {
      if (itemsTotal <= 0) {
        setDeliveryCharge(0);
        return;
      }

      const res = await API.get(
        `/delivery/calculate?subtotal=${itemsTotal}`
      );

      setDeliveryCharge(res.data.deliveryCharge || 0);
    } catch (error) {
      console.log(error);
      setDeliveryCharge(0);
    }
  };

  const toggleItem = (productId) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === validCart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(validCart.map((item) => item.product._id));
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

  const updateQty = async (productId, quantity) => {
    try {
      if (quantity < 1) return;

      await API.put("/cart/update", {
        productId,
        quantity,
      });

      fetchCart();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Quantity update failed"
      );
    }
  };

  const marketplaceFee = itemsTotal > 0 ? 5 : 0;

  const orderTotal =
    itemsTotal + deliveryCharge + marketplaceFee;

  const proceedCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item");
      return;
    }

    localStorage.setItem(
      "checkoutItems",
      JSON.stringify(selectedItems)
    );

    navigate("/checkout");
  };

  return (
    <div className="cart-page pro-cart-page">
      <div className="cart-top-box">
        <h1>Shopping Cart</h1>

        {validCart.length > 0 && (
          <>
            <label className="select-all-row">
              <input
                type="checkbox"
                checked={
                  selectedItems.length === validCart.length &&
                  validCart.length > 0
                }
                onChange={toggleAll}
              />
              Select all items
            </label>

            <h2>Total ₹{orderTotal}</h2>

            <button
              className="mobile-buy-btn"
              onClick={proceedCheckout}
              disabled={selectedItems.length === 0}
            >
              {selectedItems.length === 0
                ? "Select items to checkout"
                : `Proceed to Buy (${selectedItems.length} items)`}
            </button>
          </>
        )}
      </div>

      {validCart.length === 0 ? (
        <div className="empty-cart-box">
          <h2>Your cart is empty</h2>

          <Link to="/products">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {validCart.map((item) => {
              const product = item.product;
              const isSelected = selectedItems.includes(product._id);

              return (
                <div
                  className={`cart-item pro-cart-item ${
                    isSelected ? "selected-cart-item" : ""
                  }`}
                  key={item._id}
                >
                  <div className="cart-image-wrap">
                    <button
                      className={`cart-check overlay-check ${
                        isSelected ? "checked" : ""
                      }`}
                      onClick={() => toggleItem(product._id)}
                    >
                      {isSelected ? "✓" : ""}
                    </button>

                    <img
                      src={product.images?.[0]?.url || "/favicon.svg"}
                      alt={product.name}
                    />
                  </div>

                  <div className="cart-info">
                    <h3>{product.name}</h3>

                    <p className="cart-category">
                      {product.category}
                    </p>

                    <h2>₹{product.price}</h2>

                    <p className="cart-stock">
                      {product.stock > 0 ? "In stock" : "Out of stock"}
                    </p>

                    <p className="cart-return">
                      10 days returnable
                    </p>

                    <div className="cart-actions">
                      <div className="qty-box">
                        <button
                          onClick={() => {
                            if (item.quantity <= 1) {
                              removeItem(product._id);
                            } else {
                              updateQty(product._id, item.quantity - 1);
                            }
                          }}
                        >
                          -
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() =>
                            updateQty(product._id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="cart-delete-btn"
                        onClick={() => removeItem(product._id)}
                      >
                        Delete
                      </button>

                      <button className="cart-save-btn">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary pro-cart-summary">
            <h2>Price Details</h2>

            <p>
              Items ({selectedItems.length}):
              <span>₹{itemsTotal}</span>
            </p>

            <p>
              Delivery:
              <span>
                {deliveryCharge === 0
                  ? "FREE"
                  : `₹${deliveryCharge}`}
              </span>
            </p>

            <p>
              Marketplace Fee:
              <span>₹{marketplaceFee}</span>
            </p>

            {deliveryCharge === 0 && itemsTotal > 0 && (
              <p className="saving-line">
                FREE Delivery
                <span>FREE</span>
              </p>
            )}

            <h2>
              Order Total:
              <span>₹{orderTotal}</span>
            </h2>

            <button
              className="checkout-btn"
              onClick={proceedCheckout}
              disabled={selectedItems.length === 0}
            >
              {selectedItems.length === 0
                ? "Select Items"
                : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;