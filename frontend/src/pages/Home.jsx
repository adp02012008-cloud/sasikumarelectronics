import {
 Link,
} from "react-router-dom";



const Home = () => {


 return(


 <div className="home">



  {/* HERO SECTION */}


  <section className="hero-section">


   <div className="hero-content">


    <h1>

     Sasikumar Electronics

    </h1>



    <h2>

     Smart Electronics.
     Best Prices.

    </h2>



    <p>

     Explore mobiles, gadgets and electronics
     with secure shopping, smart recommendations
     and trusted service.

    </p>




    <Link
     to="/products"
     className="shop-btn"
    >

     Shop Now

    </Link>



   </div>


  </section>







  {/* FEATURES */}


  <section className="features">


   <div>

    <h3>
     🚚 Fast Delivery
    </h3>

    <p>
     Quick and reliable delivery
    </p>

   </div>





   <div>

    <h3>
     🔒 Secure Payment
    </h3>

    <p>
     Razorpay protected checkout
    </p>

   </div>





   <div>

    <h3>
     🤖 Smart Deals
    </h3>

    <p>
     AI powered price updates
    </p>

   </div>





   <div>

    <h3>
     ⭐ Quality Products
    </h3>

    <p>
     Trusted electronics store
    </p>

   </div>




  </section>








  {/* ABOUT */}


  <section className="about">


   <h2>

    Why Choose Us?

   </h2>



   <p>

    Sasikumar Electronics provides
    the latest electronic products
    with intelligent recommendations,
    easy ordering and customer support.

   </p>



  </section>





 </div>


 );


};




export default Home;