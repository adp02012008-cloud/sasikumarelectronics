const User =
require("../models/User");

const bcrypt =
require("bcryptjs");

const jwt =
require("jsonwebtoken");


/*
=========================
GENERATE TOKEN
=========================
*/

const generateToken =
(user)=>{

 return jwt.sign(
  {
   id:user._id,

   role:user.role
  },

  process.env.JWT_SECRET,

  {
   expiresIn:"7d"
  }
 );

};


/*
=========================
REGISTER
=========================
*/


exports.register =
async(req,res)=>{

 try{

  const {
   name,
   email,
   password
  } = req.body;


  const existingUser =
  await User.findOne({
   email
  });


  if(existingUser){

   return res.status(400)
   .json({

    success:false,

    message:
    "User already exists"

   });

  }


  const hashedPassword =
  await bcrypt.hash(
   password,
   10
  );


  const user =
  await User.create({

   name,

   email,

   password:
   hashedPassword

  });


  const token =
  generateToken(
   user
  );


  res.status(201)
  .json({

   success:true,

   token,

   user:{
    id:user._id,
    name:user.name,
    email:user.email,
    role:user.role
   }

  });


 }
 catch(error){

  res.status(500)
  .json({

   success:false,

   message:
   error.message

  });

 }

};



/*
=========================
LOGIN
=========================
*/


exports.login =
async(req,res)=>{

 try{


  const {
   email,
   password
  } = req.body;


  const user =
  await User.findOne({
   email
  })
  .select(
   "+password"
  );


  if(!user){

   return res.status(401)
   .json({

    success:false,

    message:
    "Invalid Credentials"

   });

  }


  const match =
  await bcrypt.compare(
   password,
   user.password
  );


  if(!match){

   return res.status(401)
   .json({

    success:false,

    message:
    "Invalid Credentials"

   });

  }


  const token =
  generateToken(
   user
  );


  res.json({

   success:true,

   token,


   user:{

    id:user._id,

    name:user.name,

    email:user.email,

    role:user.role

   }

  });


 }
 catch(error){


  res.status(500)
  .json({

   success:false,

   message:
   error.message

  });


 }

};


/*
=========================
PROFILE
=========================
*/

exports.profile =
async(req,res)=>{

 try{

  const user =
  await User.findById(
   req.user.id
  );

  res.json({

   success:true,

   user

  });


 }
 catch(error){

  res.status(500)
  .json({

   success:false,

   message:error.message

  });

 }

};