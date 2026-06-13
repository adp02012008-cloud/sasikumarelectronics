const mongoose =
require("mongoose");


const addressSchema =
new mongoose.Schema({

  fullName:{
    type:String
  },

  phone:{
    type:String
  },

  address:{
    type:String
  },

  city:{
    type:String
  },

  state:{
    type:String
  },

  pincode:{
    type:String
  },

  country:{
    type:String,
    default:"India"
  }

});


const userSchema =
new mongoose.Schema(
  {

    name:{
      type:String,
      required:true
    },


    email:{
      type:String,
      required:true,
      unique:true
    },


    password:{
      type:String,
      select:false
    },


    googleId:{
      type:String
    },


    role:{
      type:String,
      enum:[
        "user",
        "admin"
      ],
      default:"user"
    },


    addresses:[

      addressSchema

    ]

  },


  {

    timestamps:true

  }

);


module.exports =
mongoose.model(
  "User",
  userSchema
);