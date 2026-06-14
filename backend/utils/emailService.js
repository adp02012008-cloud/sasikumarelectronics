const axios =
require("axios");


const sendEmail =
async(options)=>{


 try{


  const response =
  await axios.post(

   "https://api.brevo.com/v3/smtp/email",


   {


    sender:{

     name:
     "Sasikumar Electronics",

     email:
     process.env.EMAIL_FROM

    },


    to:[

     {

      email:
      options.to

     }

    ],


    subject:
    options.subject,


    htmlContent:
    options.html


   },


   {


    headers:{


     "api-key":
     process.env.BREVO_API_KEY,


     "Content-Type":
     "application/json"


    }


   }


  );


  console.log(
   "Email Sent Successfully"
  );


  return response.data;


 }


 catch(error){


  console.log(

   "BREVO ERROR:",

   error.response?.data
   ||
   error.message

  );


 }


};



module.exports =
sendEmail;