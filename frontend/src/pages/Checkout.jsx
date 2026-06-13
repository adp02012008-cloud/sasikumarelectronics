import axios from "axios";

function Checkout() {

  const handlePayment =
  async () => {

    try {

      const { data } =
      await axios.post(
        "http://localhost:5000/api/payment/create-order",
        {
          amount: 500
        }
      );

      const options = {

        key:
        import.meta.env
        .VITE_RAZORPAY_KEY_ID,

        amount:
        data.order.amount,

        currency:
        data.order.currency,

        name:
        "Dhiwakar Store",

        description:
        "Order Payment",

        order_id:
        data.order.id,

        handler:
        function(response){

          alert(
            "Payment Success\n" +
            response
            .razorpay_payment_id
          );

          console.log(
            response
          );

        }

      };

      const razorpay =
      new window.Razorpay(
        options
      );

      razorpay.open();

    }
    catch(error){

  console.error(
    "Payment Error:",
    error
  );

  if(
    error.response
  ){
    console.log(
      error.response.data
    );
  }

  alert(
    "Payment Failed. Check browser console."
  );

}

  };

  return (

    <div
      style={{
        textAlign:"center",
        marginTop:"100px"
      }}
    >

      <h1>
        Checkout
      </h1>

      <button
        onClick={
          handlePayment
        }
      >
        Pay ₹500
      </button>

    </div>

  );

}

export default Checkout;