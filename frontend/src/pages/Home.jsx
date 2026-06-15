import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero industrial-hero">
        <div>
          <h1>Industrial & Automobile Electronics</h1>

          <h2>Reliable Electrical Products for Bikes, Cars & Workshops</h2>

          <p>
            Shop quality bike accessories, car electrical items, LED lights,
            horns, switches, chargers, wiring products and industrial electronic
            essentials with secure payments and trusted service.
          </p>

          <Link to="/products" className="hero-btn">
            Explore Products
          </Link>
        </div>
      </section>

      <section className="categories">
        <h2>Shop By Category</h2>

        <div className="category-grid">
          <div>
            🏍️
            <h3>Bike Electronics</h3>
          </div>

          <div>
            🚗
            <h3>Car Accessories</h3>
          </div>

          <div>
            💡
            <h3>LED Lights</h3>
          </div>

          <div>
            🔌
            <h3>Wiring & Switches</h3>
          </div>

          <div>
            🔋
            <h3>Batteries & Chargers</h3>
          </div>

          <div>
            📢
            <h3>Horns & Indicators</h3>
          </div>

          <div>
            🛠️
            <h3>Workshop Tools</h3>
          </div>

          <div>
            ⚙️
            <h3>Industrial Electricals</h3>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div>
          ✅
          <h3>Tested Products</h3>
          <p>Reliable parts for daily usage</p>
        </div>

        <div>
          🔒
          <h3>Secure Payment</h3>
          <p>Razorpay protected checkout</p>
        </div>

        <div>
          🚚
          <h3>Fast Delivery</h3>
          <p>Quick delivery for local needs</p>
        </div>

        <div>
          🧾
          <h3>Invoice Support</h3>
          <p>Professional invoice for every order</p>
        </div>
      </section>

      <footer>
        <h2>Sasikumar Electronics</h2>
        <p>Industrial, automobile and electrical product store</p>
        <p>© 2026 Sasikumar Electronics</p>
      </footer>
    </div>
  );
};

export default Home;