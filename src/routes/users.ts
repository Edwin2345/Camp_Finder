import express, { Request, Response, NextFunction } from 'express';
import {ExpressError} from "../utils/ExpressError"
import { wrapAsync } from '../utils/wrapAsync';
import passport from 'passport';
const {storeReturnToLocally} = require("../utils/middleware")
const User = require("../models/user");


const userRouter = express.Router();


//Register Functionality
userRouter.get("/register", (req: Request, res: Response) => {
    res.render("users/register.ejs");
})

userRouter.post("/register",wrapAsync(async(req: Request, res: Response, next: NextFunction) => {
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
}))


//Login Functionality
userRouter.get("/login", (req: Request, res: Response) => {
    res.render("users/login.ejs");
})

userRouter.post("/login", storeReturnToLocally, passport.authenticate('local', {failureFlash: true, failureRedirect: "/login"}), (req: Request, res: Response) => {
    req.flash("success", "Welcome Back");
    const returnURL = res.locals.returnTo || "/campgrounds"
    res.redirect(returnURL);
})


//Logout
userRouter.get("/logout", (req: Request, res: Response, next: NextFunction) => {
   req.logOut(function(err){
     if(err){
        return next(err);
     }
     req.flash("success", "Logged out successfully")
     return res.redirect("/login");
   })
})


module.exports = userRouter;