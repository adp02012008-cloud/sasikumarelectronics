import { useEffect, useState } from "react";
import API from "../api/axios";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState("");

  const statuses = [
    "Processing",
    "Packed",
    "Shipped",
    "Out For Delivery",
    "Delivered",
    "Cancelled",
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      setUpdating(orderId);

      await API.put(`/orders/status/${orderId}`, {
        status,
        message: `Your order is now ${status}`,
      });

      alert("Order status updated. Email and WhatsApp sent.");
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Status update failed");
    } finally {
      setUpdating("");
    }
  };

  return (
    <div className="admin-orders">
      <h1>Order Management</h1>

      {orders.length === 0 ? (
        <h2>No Orders Found</h2>
      ) : (
        orders.map((order) => (
          <div className="admin-order-card" key={order._id}>
            <div className="order-head">
              <h3>Order #{order._id}</h3>
              <span className="status">{order.orderStatus}</span>
            </div>

            <div className="admin-order-grid">
              <div>
                <h3>Customer</h3>
                <p>Name: {order.shippingAddress?.fullName || order.user?.name}</p>
                <p>Email: {order.user?.email || "Not Available"}</p>
                <p>Phone: {order.shippingAddress?.phone}</p>
              </div>

              <div>
                <h3>Delivery Address</h3>
                <p>{order.shippingAddress?.address}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </p>
                <p>Pincode: {order.shippingAddress?.pincode}</p>
                <p>Country: {order.shippingAddress?.country}</p>
              </div>

              <div>
                <h3>Payment</h3>
                <p>Method: {order.paymentMethod}</p>
                <p>
                  Payment ID:{" "}
                  {order.paymentInfo?.razorpayPaymentId || "Not Available"}
                </p>
                <p>Total: ₹{order.totalPrice}</p>
              </div>
            </div>

            <h3>Products</h3>

            <div className="admin-products-list">
              {order.orderItems.map((item) => (
                <p key={item._id}>
                  {item.product?.name || "Product removed"} × {item.quantity} —
                  ₹{item.price}
                </p>
              ))}
            </div>

            <h3>Update Status</h3>

            <div className="status-buttons">
              {statuses.map((status) => (
                <button
                  key={status}
                  disabled={updating === order._id || order.orderStatus === status}
                  onClick={() => updateStatus(order._id, status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <h3>Tracking Timeline</h3>

            <div className="timeline">
              {order.trackingTimeline?.map((track, index) => (
                <div className="timeline-item" key={index}>
                  <b>{track.status}</b>
                  <p>{track.message}</p>
                  <small>{new Date(track.date).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminOrders;