const jwt =
require("jsonwebtoken");

const User =
require("../models/User");


exports.protect =
async(req,res,next)=>{


 let token;


 if(
  req.headers.authorization &&
  req.headers.authorization.startsWith(
   "Bearer"
  )
 ){

  token =
  req.headers.authorization
  .split(" ")[1];

 }


 if(!token){

  return res.status(401)
  .json({

   success:false,

   message:
   "Not Authorized"

  });

 }


 try{


  const decoded =
  jwt.verify(
   token,
   process.env.JWT_SECRET
  );


  req.user =
  await User.findById(
   decoded.id
  );


  next();


 }
 catch(error){

  res.status(401)
  .json({

   success:false,

   message:
   "Token Failed"

  });

 }


};



const ADMIN_EMAILS = [
  "adp02012008@gmail.com",
  "sdhivakar2901@gmail.com",
  process.env.ADMIN_EMAIL,
]
  .filter(Boolean)
  .map((e) => e.toLowerCase().trim());

exports.adminOnly = (req, res, next) => {
  const role = req.user?.role;
  const email = (req.user?.email || "").toLowerCase().trim();

  if (
    req.user &&
    (role === "admin" || role === "superadmin" || ADMIN_EMAILS.includes(email))
  ) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Admin Access Only",
    });
  }
};