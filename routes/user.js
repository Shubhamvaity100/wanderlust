const express = require("express");
const router = express.Router();
const User=require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});



router.post("/signup", wrapAsync(async(req, res) => {
   try{let {username,email,password}=req.body;
   const newUser=new User({username,email});
   const registeredUser=await User.register(newUser,password);
   console.log(registeredUser);
   req.flash("success","Successfully registered");
   res.redirect("/listings");

   }catch(e){
       req.flash("error",e.message);
       res.redirect("/signup");
   }
}));

router.post("/login", passport.authenticate('local', {failureRedirect:"/login" ,failureFlash:true}),
    wrapAsync(async(req, res) => {
    req.flash("success","Successfully logged in");
    res.redirect("/listings");
})) ;



router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});
module.exports = router;
