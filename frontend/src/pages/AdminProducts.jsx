import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

const AdminProducts = () => {

  const [
    products,
    setProducts
  ] = useState([]);

  useEffect(() => {

    fetchProducts();

  }, []);

  const fetchProducts =
    async () => {

      try {

        const { data } =
          await axios.get(
            "http://localhost:5000/api/products"
          );

        setProducts(
          data.products
        );

      }
      catch(error){

        console.log(error);

      }

    };

  const deleteProduct =
    async (id) => {

      try {

        await axios.delete(
          `http://localhost:5000/api/products/${id}`
        );

        fetchProducts();

      }
      catch(error){

        console.log(error);

      }

    };

  return (

    <div>

      <h1>
        Product Management
      </h1>

      <table
        border="1"
        cellPadding="10"
      >

        <thead>

          <tr>

            <th>
              Name
            </th>

            <th>
              Category
            </th>

            <th>
              Price
            </th>

            <th>
              Stock
            </th>

            <th>
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {
            products.map(
              (product) => (

                <tr
                  key={
                    product._id
                  }
                >

                  <td>
                    {product.name}
                  </td>

                  <td>
                    {product.category}
                  </td>

                  <td>
                    ₹{product.price}
                  </td>

                  <td>
                    {product.stock}
                  </td>

                  <td>

                    <button
                      onClick={() =>
                        deleteProduct(
                          product._id
                        )
                      }
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              )
            )
          }

        </tbody>

      </table>

    </div>

  );

};

export default AdminProducts;