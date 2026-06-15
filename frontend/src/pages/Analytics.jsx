import { useEffect, useState } from "react";
import API from "../api/axios";

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/analytics/overview");
      setData(res.data);
    } catch (error) {
      console.log(error);
      alert("Analytics loading failed");
    }
  };

  if (!data) {
    return (
      <div className="admin-page">
        <h2>Loading analytics...</h2>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Business Analytics</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Products</h3>
          <h2>{data.totalProducts}</h2>
        </div>

        <div className="stat-card">
          <h3>Orders</h3>
          <h2>{data.totalOrders}</h2>
        </div>

        <div className="stat-card">
          <h3>Users</h3>
          <h2>{data.totalUsers}</h2>
        </div>

        <div className="stat-card">
          <h3>Revenue</h3>
          <h2>₹{data.revenue}</h2>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="chart-box">
          <h2>Low Stock Products</h2>

          {data.lowStock?.length === 0 ? (
            <p>No low stock products</p>
          ) : (
            data.lowStock.map((item) => (
              <p key={item._id}>
                {item.name} — Stock: {item.stock}
              </p>
            ))
          )}
        </div>

        <div className="chart-box">
          <h2>Category Stock</h2>

          {data.categoryStock?.map((item) => (
            <p key={item._id}>
              {item._id || "Uncategorized"} — {item.stock} items
            </p>
          ))}
        </div>

        <div className="chart-box">
          <h2>Monthly Revenue</h2>

          {data.monthlyRevenue?.map((item) => (
            <p key={`${item._id.month}-${item._id.year}`}>
              {item._id.month}/{item._id.year} — ₹{item.revenue}
            </p>
          ))}
        </div>

        <div className="chart-box">
          <h2>Recent Reviews</h2>

          {data.recentReviews?.length === 0 ? (
            <p>No reviews yet</p>
          ) : (
            data.recentReviews.map((review) => (
              <p key={review._id}>
                ⭐ {review.rating} — {review.product?.name} by{" "}
                {review.user?.name}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;