import express, { Request, Response, NextFunction } from 'express';
import { campgroundValidationSchema, joinErrors} from '../utils/validate_schema/validations';
const Campground = require("../models/campground");

import {ExpressError} from "../utils/ExpressError";
import { wrapAsync } from '../utils/wrapAsync';
const {isLoggedIn, isAuthorCampground} = require("../utils/middleware");

const campgroundRouter = express.Router();


// VALIDATION MIDDLEWARES
function validateCampground(req: Request, res: Response, next: NextFunction){
    const {error} = campgroundValidationSchema.validate(req.body);
    if(error){
      const errorStr  = joinErrors(error.details);
      console.log(errorStr);
      throw new ExpressError(errorStr, 400);
    } else{
       next();
    }
}



//GET ROUTES
//###############
campgroundRouter.get("/", wrapAsync(async(req: Request, res: Response) => {
    const campArr = await Campground.find();
    res.render("campgrounds/index.ejs", {campArr});
}));

campgroundRouter.get("/new", isLoggedIn, (req: Request, res: Response) => {
    res.render("campgrounds/new.ejs");
});

campgroundRouter.get("/:id/edit", isLoggedIn, isAuthorCampground, wrapAsync(async(req: Request, res: Response) => {
    const {id} = req.params;
    try{
        const camp = await Campground.findById(id);
        if(!camp){
           throw new Error()
        }
        res.render("campgrounds/edit.ejs", {camp});
    }
    catch(e){
        req.flash("error", "Campground Could Not Be Found");
        res.redirect("/campgrounds");
    }
}));


campgroundRouter.get("/:id", wrapAsync(async(req: Request, res: Response) => {
    const {id} = req.params;
    try{
        const camp = await Campground.findById(id)
        .populate({
           path: "reviews",
           populate: {
             path: "author",
             model: "User"
           }
        })
        .populate("author");
        if(!camp){
            throw new Error();
        }
        res.render("campgrounds/show.ejs", {camp});
    }
    catch(e){
        req.flash("error", "Campground Could Not Be Found");
        res.redirect("/campgrounds");
    }
}));


//OTHER ROUTES
//###############
//Create campground route
campgroundRouter.post("/new", isLoggedIn, validateCampground, wrapAsync(async(req: Request, res: Response) => {
    const newCamp = new Campground(req.body.campground)
    newCamp.author = req.user?._id;
    await newCamp.save();
    req.flash("success", `${newCamp.title} Was Created`);
    res.redirect(`/campgrounds/${newCamp._id}`)
 }));


//Update campgrounds route
campgroundRouter.put("/:id", isLoggedIn, isAuthorCampground, validateCampground, wrapAsync(async(req: Request, res: Response) => {
    const {id} = req.params;
    try{
        const updatedCamp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
        if(!updatedCamp){
           throw new Error();
        }
        req.flash("success", `${updatedCamp.title} Was Updated`);
        res.redirect(`/campgrounds/${updatedCamp._id}`)
    }
    catch(e){
        req.flash("error", "Campground To Be Updated Not Found");
        res.redirect("/campgrounds");
    }
 }));


//Delete Campground route
campgroundRouter.delete("/:id", isLoggedIn, isAuthorCampground, wrapAsync(async(req: Request, res: Response) => {
    const {id} = req.params;
    try{
        const deletedCamp = await Campground.findByIdAndDelete(id, {...req.body.campground});
        if(!deletedCamp){
          throw new Error();
        }
        req.flash("success", `${deletedCamp.title} Was Deleted`);
        res.redirect(`/campgrounds`)
    }
    catch(e){
        req.flash("error", "Campground To Be Deleted Not Found");
        res.redirect("/campgrounds");
    }
 }));

 module.exports  = campgroundRouter;