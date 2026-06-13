const axios =
require("axios");


const sendWhatsApp =
async(data)=>{


 try{


  const response =
  await axios.post(

   `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,


   {

    messaging_product:
    "whatsapp",


    to:
    data.phone,


    type:
    "template",


    template:{

     name:
     "hello_world",


     language:{

      code:
      "en_US"

     }

    }


   },


   {


    headers:{


     Authorization:
     `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,


     "Content-Type":
     "application/json"


    }


   }


  );


  return response.data;


 }
 catch(error){


  console.log(

   error.response?.data
   ||
   error.message

  );


 }


};


module.exports =
sendWhatsApp;