import express, { Request, Response, NextFunction } from 'express';
import { wrapAsync } from '../utils/wrapAsync';
import passport from 'passport';
const {storeReturnToLocally} = require("../utils/middleware")
const User = require("../models/user");
const {userRegisterForm, userRegister, userLoginForm, userLogin, userLogout} = require("../controllers/users");


const userRouter = express.Router();


//Register routes
userRouter.route("/register")
          .get(userRegisterForm)
          .post(wrapAsync(userRegister));


//Login routes
userRouter.route("/login")
          .get(userLoginForm)
          .post(storeReturnToLocally, passport.authenticate('local', {failureFlash: true, failureRedirect: "/login"}), userLogin)


//Logout
userRouter.get("/logout", userLogout )


module.exports = userRouter;