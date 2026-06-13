const mongoose =
require("mongoose");


const activitySchema =
new mongoose.Schema(
{

 user:{

  type:
  mongoose.Schema.Types.ObjectId,

  ref:
  "User",

  required:true

 },


 product:{

  type:
  mongoose.Schema.Types.ObjectId,

  ref:
  "Product",

  required:true

 },


 category:{

  type:String

 },


 brand:{

  type:String

 }


},

{

 timestamps:true

}

);


module.exports =
mongoose.model(
 "UserActivity",
 activitySchema
);