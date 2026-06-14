const nodemailer =
require("nodemailer");


const transporter =
nodemailer.createTransport({

 host:"smtp.gmail.com",

 port:587,

 secure:false,


 auth:{

  user:
  process.env.EMAIL_USER,


  pass:
  process.env.EMAIL_PASS

 },


 tls:{

  rejectUnauthorized:false

 }

});



const sendEmail =
async(options)=>{


 try{


  const info =
  await transporter.sendMail({

   from:
   `"Sasikumar Electronics" <${process.env.EMAIL_USER}>`,

   to:
   options.to,

   subject:
   options.subject,

   html:
   options.html

  });



  console.log(
   "Email Sent:",
   info.messageId
  );


 }
 catch(error){


  console.log(
   "Email Error:",
   error.message
  );


 }


};



module.exports =
sendEmail;