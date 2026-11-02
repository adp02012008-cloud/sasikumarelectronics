import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [loading, setLoading] = useState(false);

  // Address states
  const [userProfile, setUserProfile] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [isManualAddress, setIsManualAddress] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("checkoutItems") || "[]"
    );

    setSelectedIds(stored);
    fetchCart(stored);
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await API.get("/users/profile");
      const uData = res.data.user;
      if (uData) {
        setUserProfile(uData);
        const addrs = uData.addresses || [];
        setSavedAddresses(addrs);

        if (addrs.length > 0) {
          applyAddress(addrs[0], uData.name, uData.email);
          setSelectedAddressIdx(0);
          setIsManualAddress(false);
        } else {
          setIsManualAddress(true);
          setAddress((prev) => ({
            ...prev,
            fullName: uData.name || "",
            email: uData.email || "",
          }));
        }
      }
    } catch {
      setIsManualAddress(true);
    }
  };

  const applyAddress = (addrObj, userName = "", userEmail = "") => {
    setAddress({
      fullName: userName || userProfile?.name || address.fullName || "",
      email: userEmail || userProfile?.email || address.email || "",
      phone: addrObj.phone || "",
      address: addrObj.street || "",
      city: addrObj.city || "",
      state: addrObj.state || "",
      pincode: addrObj.postalCode || "",
      country: addrObj.country || "India",
    });
  };

  const handleSelectSavedAddress = (idx) => {
    setSelectedAddressIdx(idx);
    setIsManualAddress(false);
    applyAddress(savedAddresses[idx], userProfile?.name, userProfile?.email);
  };

  const fetchCart = async (ids) => {
    try {
      const res = await API.get("/cart");
      const allItems = (res.data.cart?.items || []).filter((item) => item.product);

      let selectedItems = [];
      if (ids && ids.length > 0) {
        selectedItems = allItems.filter((item) => {
          const itemProdId = item.product._id
            ? item.product._id.toString()
            : item.product.toString();
          return ids.some((id) => id.toString() === itemProdId);
        });
      }

      if (selectedItems.length === 0 && allItems.length > 0) {
        selectedItems = allItems;
        const allIds = allItems.map((item) =>
          item.product._id ? item.product._id.toString() : item.product.toString()
        );
        setSelectedIds(allIds);
      }

      setCart(selectedItems);
    } catch (error) {
      console.log(error);
    }
  };

  const itemsTotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [cart]);

  useEffect(() => {
    calculateDeliveryCharge();
  }, [itemsTotal]);

  const calculateDeliveryCharge = async () => {
    try {
      if (itemsTotal <= 0) {
        setDeliveryCharge(0);
        return;
      }

      const res = await API.get(`/delivery/calculate?subtotal=${itemsTotal}`);
      setDeliveryCharge(res.data.deliveryCharge || 0);
    } catch (error) {
      console.log(error);
      setDeliveryCharge(0);
    }
  };

  const handleAddressChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const marketplaceFee = Math.round(itemsTotal * 0.02);
  const total = itemsTotal + deliveryCharge + marketplaceFee;

  const validateAddress = () => {
    if (
      !address.fullName ||
      !address.phone ||
      !address.address ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      alert("Please fill all required delivery address details");
      return false;
    }

    if (address.phone.length < 10) {
      alert("Please enter a valid phone number");
      return false;
    }

    // Email is strictly optional - only validate format if provided
    if (address.email && address.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(address.email.trim())) {
        alert("Please enter a valid email address or leave it blank");
        return false;
      }
    }

    return true;
  };

  const handlePayment = async () => {
    if (cart.length === 0) {
      alert("No selected items found. Go back to cart and select items.");
      navigate("/cart");
      return;
    }

    if (!validateAddress()) {
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.post("/payment/create-order", {
        amount: total,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Sasikumar Electronics",
        description: "Order Payment",
        order_id: data.order.id,

        handler: async function (response) {
          try {
            await API.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            await API.post("/orders", {
              orderItems: cart.map((item) => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price,
              })),

              shippingAddress: address,
              paymentMethod: "Razorpay",

              paymentInfo: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
              },

              totalPrice: total,
            });

            await API.post("/cart/remove-selected", {
              productIds: selectedIds,
            });

            localStorage.removeItem("checkoutItems");

            alert("Payment successful. Order placed!");
            navigate("/orders");
          } catch (error) {
            console.log(error);
            alert(
              error.response?.data?.message ||
                "Payment completed, but order creation failed. Please contact support."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },

        prefill: {
          name: address.fullName,
          email: address.email || "",
          contact: address.phone,
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Payment Failed");
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="pro-checkout-wrapper">
        <div className="pro-checkout-empty">
          <h2>Your Checkout is Empty</h2>
          <p>Please select products from your cart to proceed with order checkout.</p>
          <button className="btn-submit-yellow" onClick={() => navigate("/cart")}>
            Return to Shopping Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pro-checkout-wrapper">
      <div className="pro-checkout-container">
        {/* Left Column: Delivery Address & Order Review */}
        <div className="checkout-main-col">
          {/* Section 1: Delivery Address */}
          <div className="checkout-block-card">
            <div className="block-header">
              <span className="step-num">1</span>
              <h2>Select Delivery Address</h2>
            </div>

            {/* Saved Profile Addresses */}
            {savedAddresses.length > 0 && (
              <div className="saved-addresses-selector">
                <p className="sub-instruction">Choose from your saved profile addresses:</p>
                <div className="saved-cards-grid">
                  {savedAddresses.map((addr, idx) => (
                    <div
                      key={idx}
                      className={`saved-addr-card ${
                        !isManualAddress && selectedAddressIdx === idx ? "active-card" : ""
                      }`}
                      onClick={() => handleSelectSavedAddress(idx)}
                    >
                      <div className="card-top-radio">
                        <input
                          type="radio"
                          name="addressSelection"
                          checked={!isManualAddress && selectedAddressIdx === idx}
                          onChange={() => handleSelectSavedAddress(idx)}
                        />
                        <b>Address #{idx + 1}</b>
                      </div>
                      <p className="addr-street">{addr.street}</p>
                      <p className="addr-city">
                        {addr.city}{addr.state ? `, ${addr.state}` : ""} - {addr.postalCode}
                      </p>
                      {addr.phone && <p className="addr-phone">📞 {addr.phone}</p>}
                    </div>
                  ))}
                </div>

                <div className="manual-toggle-row">
                  <button
                    className="btn-toggle-manual"
                    onClick={() => {
                      setIsManualAddress(true);
                      setAddress((prev) => ({
                        ...prev,
                        email: prev.email || userProfile?.email || "",
                        phone: "",
                        address: "",
                        city: "",
                        state: "",
                        pincode: "",
                      }));
                    }}
                  >
                    {isManualAddress ? "✓ Entering Manual Address" : "+ Use / Add a Different Address"}
                  </button>
                </div>

                {!isManualAddress && (
                  <div className="saved-addr-email-row">
                    <label>
                      Order Updates & Invoice Email <span className="optional-tag">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. customer@example.com (optional)"
                      value={address.email}
                      onChange={handleAddressChange}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Manual / Editing Address Form */}
            {(isManualAddress || savedAddresses.length === 0) && (
              <div className="manual-address-form">
                <h3>Delivery Address Details</h3>
                <div className="form-grid-2col">
                  <div className="input-field-wrap">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={address.fullName}
                      onChange={handleAddressChange}
                    />
                  </div>

                  <div className="input-field-wrap">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="10-digit Mobile Number"
                      value={address.phone}
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>

                <div className="input-field-wrap full-width">
                  <label>
                    Email Address <span className="optional-tag">(Optional - for invoice & delivery updates)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. customer@example.com (optional)"
                    value={address.email}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="input-field-wrap full-width">
                  <label>House No, Street Name, Area</label>
                  <textarea
                    name="address"
                    rows="3"
                    placeholder="e.g. Door No 12/A, Gandhi Street, Anna Nagar"
                    value={address.address}
                    onChange={handleAddressChange}
                  />
                </div>

                <div className="form-grid-3col">
                  <div className="input-field-wrap">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={address.city}
                      onChange={handleAddressChange}
                    />
                  </div>

                  <div className="input-field-wrap">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={address.state}
                      onChange={handleAddressChange}
                    />
                  </div>

                  <div className="input-field-wrap">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="Pincode"
                      value={address.pincode}
                      onChange={handleAddressChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Items in Order */}
          <div className="checkout-block-card">
            <div className="block-header">
              <span className="step-num">2</span>
              <h2>Review Order Items ({cart.length})</h2>
            </div>

            <div className="checkout-items-list">
              {cart.map((item) => (
                <div key={item._id} className="checkout-product-row">
                  <div className="item-thumb-box">
                    <img
                      src={item.product.images?.[0]?.url || "/favicon.svg"}
                      alt={item.product.name}
                    />
                  </div>

                  <div className="item-info">
                    <h4>{item.product.name}</h4>
                    <p className="item-category">{item.product.category}</p>
                    <div className="item-price-qty">
                      <span className="qty-tag">Qty: {item.quantity}</span>
                      <span className="unit-price">₹{item.product.price} each</span>
                    </div>
                  </div>

                  <div className="item-subtotal">
                    ₹{item.product.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="checkout-summary-col">
          <div className="checkout-summary-card">
            <button
              className="amazon-pay-btn"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? "Opening Payment..." : `Proceed to Pay ₹${total}`}
            </button>

            <div className="summary-breakdown">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Items ({cart.length}):</span>
                <span>₹{itemsTotal}</span>
              </div>

              <div className="summary-row">
                <span>Delivery Charge:</span>
                <span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
              </div>

              <div className="summary-row">
                <span>Marketplace Fee (2%):</span>
                <span>₹{marketplaceFee}</span>
              </div>

              <hr className="summary-divider" />

              <div className="summary-row total-row">
                <span>Order Total:</span>
                <span className="grand-total">₹{total}</span>
              </div>
            </div>

            <div className="trust-security-box">
              <p className="trust-item">🔒 256-bit SSL Payment Protection</p>
              <p className="trust-item">⚡ Instant Order Confirmation</p>
              <p className="trust-item">🚚 Express Fast Delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;