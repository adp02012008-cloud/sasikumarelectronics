import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

function Orders() {

  const [orders,setOrders] =
  useState([]);

  useEffect(()=>{

    fetchOrders();

  },[]);

  const fetchOrders =
  async ()=>{

    try{

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

    <div
      style={{
        padding:"20px"
      }}
    >

      <h2>
        My Orders
      </h2>

      {

        orders.map(
          (order)=>(
            <div
              key={order._id}
              style={{
                border:
                "1px solid #ccc",

                marginBottom:
                "15px",

                padding:
                "15px"
              }}
            >

              <h3>
                Order ID:
                {" "}
                {order._id}
              </h3>

              <p>
                Total:
                ₹
                {order.totalPrice}
              </p>

              <p>
                Status:
                {" "}
                {order.orderStatus}
              </p>

            </div>
          )
        )

      }

    </div>

  );

}

export default Orders;