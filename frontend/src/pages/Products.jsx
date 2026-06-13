import {
  useEffect,
  useState,
} from "react";

import API
from "../api/axios";

const Products = () => {

  const [
    products,
    setProducts,
  ] = useState([]);

  useEffect(() => {

    fetchProducts();

  }, []);

  const fetchProducts =
    async () => {

      try {

        const res =
        await API.get(
          "/products"
        );

        setProducts(
          res.data.products || []
        );

      }
      catch(error){

        console.log(error);

      }

    };

  return (

    <div className="container">

      <h1>
        Products
      </h1>

      <div className="product-grid">

        {products.map(
          (product) => (

            <div
              className="product-card"
              key={product._id}
            >

              {
                product.images &&
                product.images.length > 0
                ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                  />
                )
                : (
                  <img
                    src="https://via.placeholder.com/300"
                    alt="product"
                  />
                )
              }

              <h3>
                {product.name}
              </h3>

              <p>
                {product.category}
              </p>

              <p className="price">
                ₹{product.price}
              </p>

              <p>
                Stock: {product.stock}
              </p>

            </div>

          )
        )}

      </div>

    </div>

  );

};

export default Products;