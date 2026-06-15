import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
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
  }, []);

  const fetchCart = async (ids) => {
    try {
      const res = await API.get("/cart");
      const allItems = res.data.cart.items || [];

      const selectedItems = allItems.filter((item) =>
        ids.includes(item.product._id)
      );

      setCart(selectedItems);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddressChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const itemsTotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [cart]);

  const deliveryCharge =
    itemsTotal > 0 && itemsTotal < 1000 ? 80 : 0;

  const marketplaceFee = itemsTotal > 0 ? 5 : 0;

  const total =
    itemsTotal + deliveryCharge + marketplaceFee;

  const validateAddress = () => {
    if (
      !address.fullName ||
      !address.phone ||
      !address.address ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      alert("Please fill all delivery details");
      return false;
    }

    if (address.phone.length < 10) {
      alert("Enter valid phone number");
      return false;
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

            alert("Payment successful. Order placed.");
            navigate("/orders");
          } catch (error) {
            console.log(error);
            alert(
              error.response?.data?.message ||
                "Payment completed, but order creation failed. Please contact admin."
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

  return (
    <div className="checkout-page">
      <div className="checkout-card checkout-wide">
        <h1>Checkout</h1>
        <p>Only selected cart items will be ordered.</p>

        {cart.length === 0 ? (
          <div>
            <h3>No selected items found</h3>
            <button onClick={() => navigate("/cart")}>
              Back to Cart
            </button>
          </div>
        ) : (
          <>
            <div className="checkout-section">
              <h2>Delivery Address</h2>

              <div className="checkout-form">
                <input
                  name="fullName"
                  placeholder="Full Name"
                  value={address.fullName}
                  onChange={handleAddressChange}
                />

                <input
                  name="phone"
                  placeholder="Phone Number"
                  value={address.phone}
                  onChange={handleAddressChange}
                />

                <textarea
                  name="address"
                  placeholder="House No, Street, Area"
                  value={address.address}
                  onChange={handleAddressChange}
                />

                <input
                  name="city"
                  placeholder="City"
                  value={address.city}
                  onChange={handleAddressChange}
                />

                <input
                  name="state"
                  placeholder="State"
                  value={address.state}
                  onChange={handleAddressChange}
                />

                <input
                  name="pincode"
                  placeholder="Pincode"
                  value={address.pincode}
                  onChange={handleAddressChange}
                />
              </div>
            </div>

            <div className="checkout-section">
              <h2>Order Summary</h2>

              {cart.map((item) => (
                <div key={item._id} className="checkout-item">
                  <span>{item.product.name}</span>
                  <span>
                    {item.quantity} × ₹{item.product.price}
                  </span>
                </div>
              ))}

              <hr />

              <p>
                Items Total: ₹{itemsTotal}
              </p>

              <p>
                Delivery: ₹{deliveryCharge}
              </p>

              <p>
                Marketplace Fee: ₹{marketplaceFee}
              </p>

              <h2>Total: ₹{total}</h2>

              <button onClick={handlePayment} disabled={loading}>
                {loading ? "Processing..." : `Pay ₹${total}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;