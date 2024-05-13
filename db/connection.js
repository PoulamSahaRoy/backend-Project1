let mongoose=require("mongoose")

dbConnection=async()=>{
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/CON1")
        console.log("database connected") 
    } catch (error) {
        console.log(`DB connection faild ${error}`)
    }
}

module.exports=dbConnection