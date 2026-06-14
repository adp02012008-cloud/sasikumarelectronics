import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
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

  const handleAddressChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

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
      alert("Enter valid WhatsApp phone number");
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (total <= 0) {
      alert("Cart is empty");
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

          await API.delete("/cart/clear");

          alert("Payment Successful. Order Placed.");
          navigate("/orders");
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-card checkout-wide">
        <h1>Checkout</h1>
        <p>Enter delivery details before payment</p>

        {cart.length === 0 ? (
          <h3>Your cart is empty</h3>
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
                  placeholder="WhatsApp Phone Number"
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