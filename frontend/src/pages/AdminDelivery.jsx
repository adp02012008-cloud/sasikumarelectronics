import { useEffect, useState } from "react";
import API from "../api/axios";

const AdminDelivery = () => {
  const [settings, setSettings] = useState([]);

  const [form, setForm] = useState({
    minAmount: "",
    maxAmount: "",
    deliveryCharge: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get("/delivery");
      setSettings(res.data.settings || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const addSetting = async (e) => {
    e.preventDefault();

    try {
      await API.post("/delivery", {
        minAmount: Number(form.minAmount),
        maxAmount: Number(form.maxAmount),
        deliveryCharge: Number(form.deliveryCharge),
      });

      alert("Delivery charge range added");

      setForm({
        minAmount: "",
        maxAmount: "",
        deliveryCharge: "",
      });

      fetchSettings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add delivery setting");
    }
  };

  const deleteSetting = async (id) => {
    if (!window.confirm("Delete this delivery range?")) return;

    try {
      await API.delete(`/delivery/${id}`);
      fetchSettings();
    } catch (error) {
      alert("Delete failed");
    }
  };

  return (
    <div className="admin-page">
      <h1>Delivery Settings</h1>

      <div className="admin-form-box">
        <h2>Add Delivery Charge Range</h2>

        <form className="product-form" onSubmit={addSetting}>
          <input
            name="minAmount"
            type="number"
            placeholder="Minimum Order Amount"
            value={form.minAmount}
            onChange={handleChange}
            required
          />

          <input
            name="maxAmount"
            type="number"
            placeholder="Maximum Order Amount"
            value={form.maxAmount}
            onChange={handleChange}
            required
          />

          <input
            name="deliveryCharge"
            type="number"
            placeholder="Delivery Charge"
            value={form.deliveryCharge}
            onChange={handleChange}
            required
          />

          <button type="submit">
            Add Delivery Range
          </button>
        </form>
      </div>

      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Minimum Amount</th>
              <th>Maximum Amount</th>
              <th>Delivery Charge</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {settings.length === 0 ? (
              <tr>
                <td colSpan="4">
                  No delivery settings added
                </td>
              </tr>
            ) : (
              settings.map((item) => (
                <tr key={item._id}>
                  <td>₹{item.minAmount}</td>
                  <td>₹{item.maxAmount}</td>
                  <td>
                    {item.deliveryCharge === 0
                      ? "FREE"
                      : `₹${item.deliveryCharge}`}
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => deleteSetting(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDelivery;