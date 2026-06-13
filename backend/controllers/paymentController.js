const Razorpay =
require("razorpay");

const crypto =
require("crypto");

const razorpay =
new Razorpay({

  key_id:
  process.env.RAZORPAY_KEY_ID,

  key_secret:
  process.env.RAZORPAY_KEY_SECRET,

});

/*
==================================
CREATE RAZORPAY ORDER
==================================
*/

exports.createOrder =
async (req, res) => {

  try {

    const {
      amount
    } = req.body;

    if (!amount) {

      return res.status(400).json({

        success: false,

        message:
        "Amount is required"

      });

    }

    const options = {

      amount:
      Number(amount) * 100,

      currency:
      "INR",

      receipt:
      `receipt_${Date.now()}`

    };

    const order =
    await razorpay.orders.create(
      options
    );

    res.status(200).json({

      success: true,

      order

    });

  }
  catch (error) {

    console.error(error);

    res.status(500).json({

      success: false,

      message:
      error.message

    });

  }

};

/*
==================================
VERIFY PAYMENT
==================================
*/

exports.verifyPayment =
async (req, res) => {

  try {

    const {

      razorpay_order_id,

      razorpay_payment_id,

      razorpay_signature

    } = req.body;

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature =
      crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body.toString())
      .digest("hex");

    const isAuthentic =
      expectedSignature ===
      razorpay_signature;

    if (!isAuthentic) {

      return res.status(400).json({

        success: false,

        message:
        "Invalid Signature"

      });

    }

    res.status(200).json({

      success: true,

      message:
      "Payment Verified Successfully"

    });

  }
  catch (error) {

    res.status(500).json({

      success: false,

      message:
      error.message

    });

  }

};