import {
 Link
} from "react-router-dom";



const Home = () => {


return (

<div className="home-page">



<section className="hero">


 <div>


  <h1>
   Upgrade Your Digital Life
  </h1>


  <h2>
   Latest Electronics.
   Best Prices.
  </h2>


  <p>

   Shop mobiles, laptops,
   gadgets and accessories
   with secure payments and
   smart offers.

  </p>



  <Link
   to="/products"
   className="hero-btn"
  >

   Shop Now

  </Link>



 </div>


</section>








<section className="categories">


 <h2>
  Shop By Category
 </h2>


 <div className="category-grid">


  <div>
   📱
   <h3>Mobiles</h3>
  </div>


  <div>
   💻
   <h3>Laptops</h3>
  </div>


  <div>
   🎧
   <h3>Accessories</h3>
  </div>


  <div>
   ⌚
   <h3>Gadgets</h3>
  </div>


 </div>


</section>









<section className="trust-section">


 <div>

  🚚

  <h3>
   Fast Delivery
  </h3>

  <p>
   Quick doorstep delivery
  </p>

 </div>





 <div>

  🔒

  <h3>
   Secure Payment
  </h3>

  <p>
   Razorpay protected checkout
  </p>

 </div>






 <div>

  ⭐

  <h3>
   Original Products
  </h3>

  <p>
   Quality guaranteed
  </p>

 </div>







 <div>

  🤖

  <h3>
   Smart Pricing
  </h3>

  <p>
   AI powered best deals
  </p>

 </div>


</section>










<footer>


 <h2>
  Sasikumar Electronics
 </h2>


 <p>

  Your trusted electronics shopping destination

 </p>



 <p>

 © 2026 Sasikumar Electronics

 </p>


</footer>




</div>

);


};



export default Home;