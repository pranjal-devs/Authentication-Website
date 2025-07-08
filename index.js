const express=require("express")
const bcrypt=require("bcryptjs")
const mongoose=require("mongoose")
mongoose.connect("Your Mongo URL here")
const { UserModel } = require("./db")
const jwt = require("jsonwebtoken")
const JWT_SECRET="Your random password here"
const app=express()
const { z } = require("zod")
app.use(express.json())
app.use(express.static('public'))
app.post("/signup",async function(req,res){
    const requiredbody = z.object({
        username: z.string().min(5).max(20),
        fullname: z.string().min(3).max(50),
        email: z.string().email(),
        password: z.string().min(8).max(16)
    })          
    const parseddatawithsuccess=requiredbody.safeParse(req.body)
    if(!parseddatawithsuccess.success){
        res.json({
            message : "Invalid Format"
        })
        return
    }
    const username = req.body.username
    const fullname = req.body.fullname
    const email = req.body.email
    const password = req.body.password
    try{
        const hashedpassword=await bcrypt.hash(password,5)
        await UserModel.create({
            username : username,
            fullname : fullname,
            email : email,
            password : hashedpassword
        })
    }catch(e){
        res.json({
            message : "User Already Exists"
        })
        console.log("Error of existing user")
    }
    res.json({
        message : "You are Signed Up successully"
    })
})


app.post("/login",async function(req,res){
    const email = req.body.email 
    const password = req.body.password
    const user = await UserModel.findOne({
        email : email
    })
    if(!user){
        res.status(403).json({
            message : "The user does not exists on our database"
        })
        return
    }
    console.log(user)
    const passwordmatched = await bcrypt.compare(password,user.password)
    if(passwordmatched){
        const token=jwt.sign({
            id : user._id.toString()
        },JWT_SECRET)
        res.json({
            token : token
        })
    }
    else{
        res.status(403).json({
            message : "Invalid Credentials"
        })
    }
})
function auth(req, res, next) {
    const token = req.headers.token;
    if (!token) {
        return res.status(401).json({ message: "Token not provided" });
    }
    try {
        const decodedData = jwt.verify(token, JWT_SECRET);
        req.userId = decodedData.id; // You can now access req.userId in your route
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}
app.get("/dashboard", auth, (req, res) => {
    res.json({
        message: "Welcome to your dashboard 🎉",
        userId: req.userId 
    });
});


app.listen(3000)
