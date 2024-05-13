let express=require("express")
let dotenv=require("dotenv")
let path=require("path")
let connectDB=require("./db/connection.js")
let userModel=require("./models/userModel.js")
let postModel=require("./models/postModel.js")
let bcrypt= require("bcrypt")
let jwt=require("jsonwebtoken")
const cookieParser = require("cookie-parser")
let upload=require("./multer/multer.js")




connectDB()
dotenv.config()
let app=express()

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")))
app.set("view engine","ejs")


app.get("/",(req,res)=>{
    res.render("index")

})
app.get("/login",(req,res)=>{
    res.render("login")

})
app.get("/profile",isLoggedin,async(req,res)=>{
     let user=await userModel.findOne({_id:req.user.userid}).populate("posts")
    res.render("profile",{user})

})
app.get("/edit",(req,res)=>{
    res.render("edit")

})
app.get("/upload",isLoggedin,(req,res)=>{
    res.render("upload")
})


app.post("/register",async(req,res)=>{
    let{name,username,email,password}=req.body
  
    let user=await userModel.findOne({email})

    if(user){
       return res.status(400).send("user is already existed")

    }
   let hashedPassword=await bcrypt.hash(password,10)  
  
  let createdUser=await userModel.create({
     name,
     username,
     email,
     password:hashedPassword

  })
let token=jwt.sign({email:createdUser.email,userid:createdUser._id},process.env.JWT_SECRET)

res.status(200).cookie("token",token)
res.redirect("/profile")

})

app.post("/login",async(req,res)=>{
    let{email,password}=req.body
    
    let user=await userModel.findOne({email})

    if(!user){
        return res.status(400).send("something went wrong")
    }
    let encrypted=await bcrypt.compare(password,user.password)

    if(!encrypted){
        return res.status(400).redirect("/login")
    }
   let token=jwt.sign({email:user.email,userid:user._id},process.env.JWT_SECRET)

    res.status(200).cookie("token",token).redirect("/profile")
})


app.post("/post",isLoggedin,async(req,res)=>{
    let user=await userModel.findOne({_id:req.user.userid})
    let{content}=req.body
    let post=await postModel.create({
        user:user._id,
        content:content
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect("/profile")
})

app.get("/edit/:id",isLoggedin,async(req,res)=>{
    let post=await postModel.findOne({_id:req.params.id}).populate("user")

    res.render("edit",{post})
})
app.post("/update/:id",isLoggedin,async(req,res)=>{
    let{content}=req.body
    let post=await postModel.findOneAndUpdate({_id:req.params.id},{content:content},{new:true}).populate("user")
res.redirect("/profile")
    
})


app.get("/like/:id",isLoggedin,async(req,res)=>{
    let post =await postModel.findOne({_id:req.params.id})
    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid)
    }
    else{
        post.likes.splice(post.likes.indexOf(req.user.userid), 1)
    }
    await post.save()
    res.redirect("/profile")
})

app.post("/upload",isLoggedin,upload.single("image"),async(req,res)=>{
    let user=await userModel.findOne({_id:req.user.userid})
    user.profileImage=req.file.filename
    await user.save()
    res.redirect("/profile")
})

app.get("/logout",(req,res)=>{
   res.cookie("token","")
   res.redirect("/")
  
})


function isLoggedin(req,res,next){
    let {token}=req.cookies
if(token===""){
    res.status(300).send("you need to login first")
}
let verified=jwt.verify(token,process.env.JWT_SECRET)
if(verified){
    req.user=verified
    next()
}
}


app.listen(process.env.PORT,()=>{
    console.log(`app is running at port ${process.env.PORT}`)
})