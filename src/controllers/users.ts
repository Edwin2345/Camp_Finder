import express, { Request, Response, NextFunction } from 'express';
const User = require("../models/user");
import passport from 'passport';

//User Regiser Functionality
//##########################
module.exports.userRegisterForm = (req: Request, res: Response) => {
    res.render("users/register.ejs");
};

module.exports.userRegister = async(req: Request, res: Response, next: NextFunction) => {
    try{
      const {email, username, password} = req.body;
      const newUser = new User({email, username});
      //encrypts password
      const registeredUser = await User.register(newUser, password);
      //login newly created iummediately
      req.login(registeredUser, function(err){
        if(err){return next(err)}
        req.flash("success", "Account Created. Welcome" )
        res.redirect("/campgrounds");
      })
    }
    catch(e: any){
        req.flash("error", e.message)
        res.redirect("/register");
    }
}


//User Login Functionality
//########################
module.exports.userLoginForm =  (req: Request, res: Response) => {
    res.render("users/login.ejs");
}

module.exports.userLogin = (req: Request, res: Response) => {
    req.flash("success", "Welcome Back");
    const returnURL = res.locals.returnTo || "/campgrounds"
    res.redirect(returnURL);
}


//User Logout Functionality
//###########################
module.exports.userLogout = (req: Request, res: Response, next: NextFunction) => {
    req.logOut(function(err){
      if(err){
         return next(err);
      }
      req.flash("success", "Logged out successfully")
      return res.redirect("/login");
    })
 }
 