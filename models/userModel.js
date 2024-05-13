let mongoose= require("mongoose")

let userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    profileImage:{
      type:String,
      default:"default.png"
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }],
    password:{
        type:String,
        required:true
    },
},{timestamps:true})


module.exports=mongoose.model("User",userSchema)