import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/my-orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (id) => {
    try {
      const response = await API.get(`/orders/invoice/${id}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.download = `invoice-${id}.pdf`;
      link.click();
    } catch (error) {
      alert("Invoice download failed");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusMatch = filter === "All" || order.orderStatus === filter;

      const text = search.toLowerCase();

      const searchMatch =
        order._id.toLowerCase().includes(text) ||
        order.orderItems.some((item) =>
          item.product?.name?.toLowerCase().includes(text)
        );

      return statusMatch && searchMatch;
    });
  }, [orders, search, filter]);

  const statusText = (status) => {
    if (status === "Delivered") return "Your item has been delivered";
    if (status === "Cancelled") return "Your order was cancelled";
    return `Your order is now ${status}`;
  };

  return (
    <div className="orders-page pro-orders-page">
      <div className="orders-layout">
        <aside className="orders-filter">
          <h2>Filters</h2>

          <h3>Order Status</h3>

          {[
            "All",
            "Processing",
            "Packed",
            "Shipped",
            "Out For Delivery",
            "Delivered",
            "Cancelled",
          ].map((status) => (
            <label key={status}>
              <input
                type="radio"
                checked={filter === status}
                onChange={() => setFilter(status)}
              />
              {status}
            </label>
          ))}
        </aside>

        <main>
          <div className="orders-head">
            <h1>My Orders</h1>

            <div className="orders-search">
              <input
                placeholder="Search your orders here"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button>Search Orders</button>
            </div>
          </div>

          {loading ? (
            <h2>Loading Orders...</h2>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-box">
              <h2>No Orders Found</h2>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) =>
                order.orderItems.map((item) => (
                  <div className="flipkart-order-card" key={item._id}>
                    <img
                      src={item.product?.images?.[0]?.url || "/favicon.svg"}
                      alt={item.product?.name}
                    />

                    <div className="order-product-info">
                      <h3>{item.product?.name || "Product removed"}</h3>
                      <p>Quantity: {item.quantity}</p>
                      <p>Order ID: {order._id}</p>
                      <button onClick={() => downloadInvoice(order._id)}>
                        Download Invoice
                      </button>
                    </div>

                    <h3>₹{item.price * item.quantity}</h3>

                    <div className="order-status-box">
                      <b className={order.orderStatus === "Cancelled" ? "red-dot" : "green-dot"}>
                        ● {order.orderStatus}
                      </b>

                      <p>{statusText(order.orderStatus)}</p>

                      {order.orderStatus === "Delivered" && (
                        <button className="review-link">
                          ★ Rate & Review Product
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Orders;