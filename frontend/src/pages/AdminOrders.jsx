import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

const AdminOrders = () => {

  const [
    orders,
    setOrders
  ] = useState([]);

  useEffect(() => {

    fetchOrders();

  }, []);

  const fetchOrders =
    async () => {

      try {

        const { data } =
          await axios.get(
            "http://localhost:5000/api/orders"
          );

        setOrders(
          data.orders
        );

      }
      catch(error){

        console.log(error);

      }

    };

  return (

    <div>

      <h1>
        Order Management
      </h1>

      {
        orders.map(
          (order) => (

            <div
              key={
                order._id
              }
            >

              <p>
                Order ID:
                {order._id}
              </p>

              <p>
                Total:
                ₹{
                  order.totalPrice
                }
              </p>

              <p>
                Status:
                {
                  order.orderStatus
                }
              </p>

              <hr />

            </div>

          )
        )
      }

    </div>

  );

};

export default AdminOrders;