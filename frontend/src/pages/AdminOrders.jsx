import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

const statusFlow = {
  Processing: ["Packed", "Cancelled"],
  Packed: ["Shipped", "Cancelled"],
  Shipped: ["Out For Delivery"],
  "Out For Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const statuses = [
    "All",
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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus =
        filter === "All" || order.orderStatus === filter;

      const value = search.toLowerCase();

      const matchSearch =
        order._id.toLowerCase().includes(value) ||
        order.shippingAddress?.fullName?.toLowerCase().includes(value) ||
        order.user?.email?.toLowerCase().includes(value) ||
        order.shippingAddress?.phone?.includes(value);

      return matchStatus && matchSearch;
    });
  }, [orders, filter, search]);

  const shortOrderId = (id) => {
    return `SE-${id.slice(-6).toUpperCase()}`;
  };

  const getNextActions = (order) => {
    return statusFlow[order.orderStatus] || [];
  };

  const updateStatus = async (orderId, status) => {
    try {
      setUpdating(orderId);

      const res = await API.put(`/orders/status/${orderId}`, {
        status,
        message: `Your order is now ${status}`,
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? res.data.order : order
        )
      );

      setSelectedOrder(res.data.order);

      alert("Order status updated. Email notification sent.");
    } catch (error) {
      alert(error.response?.data?.message || "Status update failed");
    } finally {
      setUpdating("");
    }
  };

  return (
    <div className="admin-orders professional-orders">
      <div className="orders-top">
        <div>
          <h1>Order Management</h1>
          <p>
            Manage customer orders, payments, products and delivery progress.
          </p>
        </div>

        <button onClick={fetchOrders}>Refresh</button>
      </div>

      <div className="order-toolbar">
        <input
          placeholder="Search order id, customer, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="orders-table-card">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7">No orders found</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <b>{shortOrderId(order._id)}</b>
                    <small>
                      {new Date(order.createdAt).toLocaleString()}
                    </small>
                  </td>

                  <td>
                    <b>
                      {order.shippingAddress?.fullName ||
                        order.user?.name ||
                        "Customer"}
                    </b>
                    <small>{order.user?.email}</small>
                    <small>{order.shippingAddress?.phone}</small>
                  </td>

                  <td>{order.orderItems?.length || 0}</td>

                  <td>₹{order.totalPrice}</td>

                  <td>
                    <span className="paid-badge">Paid</span>
                  </td>

                  <td>
                    <span
                      className={`order-status ${order.orderStatus
                        .replaceAll(" ", "-")
                        .toLowerCase()}`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>

                  <td>
                    <button
                      className="view-order-btn"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="order-modal-bg">
          <div className="order-modal">
            <div className="modal-head">
              <div>
                <h2>{shortOrderId(selectedOrder._id)}</h2>
                <p>Order ID: {selectedOrder._id}</p>
              </div>

              <button onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <div className="admin-order-grid">
              <div>
                <h3>Customer</h3>
                <p>Name: {selectedOrder.shippingAddress?.fullName}</p>
                <p>Email: {selectedOrder.user?.email}</p>
                <p>Phone: {selectedOrder.shippingAddress?.phone}</p>
              </div>

              <div>
                <h3>Delivery Address</h3>
                <p>{selectedOrder.shippingAddress?.address}</p>
                <p>
                  {selectedOrder.shippingAddress?.city},{" "}
                  {selectedOrder.shippingAddress?.state}
                </p>
                <p>Pincode: {selectedOrder.shippingAddress?.pincode}</p>
                <p>Country: {selectedOrder.shippingAddress?.country}</p>
              </div>

              <div>
                <h3>Payment</h3>
                <p>Status: Paid</p>
                <p>Method: {selectedOrder.paymentMethod}</p>
                <p>
                  ID:{" "}
                  {selectedOrder.paymentInfo?.razorpayPaymentId || "N/A"}
                </p>
                <p>Total: ₹{selectedOrder.totalPrice}</p>
              </div>
            </div>

            <h3>Products</h3>

            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {selectedOrder.orderItems.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <img
                        src={
                          item.product?.images?.[0]?.url ||
                          "/favicon.svg"
                        }
                        alt=""
                      />
                    </td>

                    <td>{item.product?.name || "Product removed"}</td>

                    <td>{item.quantity}</td>

                    <td>₹{item.price}</td>

                    <td>₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="status-action-box">
              <h3>Next Action</h3>

              {getNextActions(selectedOrder).length === 0 ? (
                <p className="completed-text">
                  This order is {selectedOrder.orderStatus}.
                </p>
              ) : (
                getNextActions(selectedOrder).map((status) => (
                  <button
                    key={status}
                    disabled={updating === selectedOrder._id}
                    onClick={() => updateStatus(selectedOrder._id, status)}
                  >
                    {updating === selectedOrder._id
                      ? "Updating..."
                      : status === "Packed"
                      ? "Pack Order"
                      : status === "Shipped"
                      ? "Ship Order"
                      : status === "Out For Delivery"
                      ? "Out For Delivery"
                      : status === "Delivered"
                      ? "Mark Delivered"
                      : "Cancel Order"}
                  </button>
                ))
              )}
            </div>

            <h3>Tracking Timeline</h3>

            <div className="timeline professional-timeline">
              {selectedOrder.trackingTimeline?.map((track, index) => (
                <div className="timeline-item" key={index}>
                  <b>{track.status}</b>
                  <p>{track.message}</p>
                  <small>{new Date(track.date).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;