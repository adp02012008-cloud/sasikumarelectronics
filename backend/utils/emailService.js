const nodemailer =
require("nodemailer");


const transporter =
nodemailer.createTransport({

 host:
 process.env.EMAIL_HOST,

 port:
 587,

 secure:
 false,

 requireTLS:
 true,

 connectionTimeout:
 30000,

 greetingTimeout:
 30000,


 auth:{

  user:
  process.env.EMAIL_USER,


  pass:
  process.env.EMAIL_PASS

 }

});




const sendEmail =
async(options)=>{


 try{


  let info =
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
   "EMAIL FULL ERROR:",
   error
  );


 }


};


module.exports =
sendEmail;