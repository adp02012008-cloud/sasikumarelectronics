const mongoose =
require("mongoose");


const productSchema =
new mongoose.Schema(
  {


    name:{
      type:String,
      required:true
    },


    description:{
      type:String,
      required:true
    },


    category:{
      type:String,
      required:true
    },


    brand:{
      type:String
    },


    price:{
      type:Number,
      required:true
    },


    minPrice:{
      type:Number,
      default:0
    },


    maxPrice:{
      type:Number,
      default:0
    },


    dynamicPricing:{
      type:Boolean,
      default:false
    },


    demand:{
      type:Number,
      default:0
    },


    stock:{
      type:Number,
      default:0
    },


    images:[
      {

        url:String,


        public_id:String

      }
    ],


    ratings:{
      type:Number,
      default:0
    },


    numReviews:{
      type:Number,
      default:0
    }


  },

  {

    timestamps:true

  }

);



module.exports =
mongoose.model(

  "Product",

  productSchema

);