const User =
require("../models/User");

const bcrypt =
require("bcryptjs");


/*
=========================
GET PROFILE
=========================
*/

exports.getProfile =
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


/*
=========================
UPDATE PROFILE
=========================
*/


exports.updateProfile =
async(req,res)=>{

 try{


  const user =
  await User.findById(
    req.user.id
  );


  user.name =
  req.body.name ||
  user.name;


  user.email =
  req.body.email ||
  user.email;


  await user.save();


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


/*
=========================
CHANGE PASSWORD
=========================
*/


exports.changePassword =
async(req,res)=>{


 try{


 const user =
 await User.findById(
  req.user.id
 )
 .select(
  "+password"
 );


 const match =
 await bcrypt.compare(
  req.body.oldPassword,
  user.password
 );


 if(!match){


  return res.status(400)
  .json({

   success:false,

   message:
   "Old password wrong"

  });


 }


 user.password =
 await bcrypt.hash(
  req.body.newPassword,
  10
 );


 await user.save();


 res.json({

  success:true,

  message:
  "Password Updated"

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
ADD ADDRESS
=========================
*/


exports.addAddress =
async(req,res)=>{


 try{


 const user =
 await User.findById(
  req.user.id
 );


 user.addresses.push(
  req.body
 );


 await user.save();


 res.json({

  success:true,

  addresses:
  user.addresses

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