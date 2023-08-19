
const express= require("express");
const bodyParser= require("body-parser");
const ejs=require("ejs");
const app=express();
const mongoose=require("mongoose");
// cookies & sesssion 
const session = require('express-session');//01
const passport=require("passport");//02
const passportLocalMongoose=require("passport-local-mongoose");//03

// const encrypt=new require("mongoose-encryption");
// const md5 = require('md5');
// const bcrypt=require("bcrypt");
// const saltRounds = 10;// enough else will take more time 

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended:true
}));

//04
app.use(session({
    secret:"Our little secret.",
    resave:false,
    saveUninitialized: true,
}));
app.use(passport.initialize());//05
app.use(passport.session());//06


// mongoose.connect("mongodb://localhost:27017/userDB");
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,});
const userSchema= new mongoose.Schema({
    email: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);//07   hash+ salt adding


// const secret="thisisourlittlesecret";
// userSchema.plugin(encrypt, { secret: secret,  encryptedFields: ["password"]});
const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy()); //08       //Strategies are responsible for authenticating requests

passport.serializeUser(User.serializeUser()); //09
passport.deserializeUser(User.deserializeUser());//10

app.get("/", (req,res)=>{
    res.render("home");
});
app.get("/login", (req,res)=>{
    res.render("login");
});

app.get("/register", (req,res)=>{
    res.render("register");
});
app.get("/secrets", (req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
         res.redirect("/login");
    }
});
app.get("/logout", (req,res)=>{
    req.logout(function(err) { //logout need call back function
        if (err) { return next(err); }
        res.redirect('/');
      });
});
// 


//   try {
// //   const hash=await  bcrypt.hash(req.body.password, saltRounds)
//         // Store hash in your password DB.
// //    console.log("this is hash"+hash);
//         const newUser=new User({
//             email: req.body.username,
//           password: req.body.password
//         });
    
//       const userAdded=await  newUser.save();
//         // User saved successfully
//       console.log(userAdded);
//         if (userAdded) {
//             res.render("secrets");
//         }
 
   
//   } catch (error) {    
//    console.error(error);
//    res.status(500).json({ error: "An error occurred while registering the user." });
//   }



// });

// app.post("/login",async(req,res)=>{
//     const username=req.body.username;
//     const password=req.body.password;
// //check in database if user exists
// try {
//  const foundUser=   await User.findOne({email:username }).exec();
//  if (foundUser) {
//     const match = await bcrypt.compare(password, foundUser.password);
//     if (match) {
//         res.render("secrets");
//     } else {
//         res.send("Incorrect password");
//     }
// } else {
//     res.send("User not found");
// }

// } catch (error) {
//     res.send("User not found  "+ error);
// }


// });
app.post("/register", async (req, res) => {
    try {
     await User.register({ username: req.body.username }, req.body.password);
  
      // Authenticate the user after successful registration
      passport.authenticate("local")(req, res, function () {
        // This callback is called after authentication is successful
        // Redirect to the "secrets" page
        res.redirect("/secrets");
      });
    } catch (error) {
      // If registration fails, redirect to the "/register" page
      res.redirect("/register");
    }
  });

app.post("/login",async(req,res)=>{
 
const user =new User({
    username:req.body.username,
    password:req.body.password
});
req.login(user, function(error){ //initiate a login session
    if(error){
        console.log(error);
    }
    else{
        passport.authenticate("local")(req, res, function () {
            // This callback is called after authentication is successful
            // Redirect to the "secrets" page
           res.redirect("/secrets"); 
          });
    }
})

});











app.listen(3000, ()=>{
    console.log("Server Started on port 3000");
})