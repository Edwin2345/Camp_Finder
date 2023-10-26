import express, { Request, Response, NextFunction } from 'express';
import { campgroundValidationSchema, joinErrors} from '../utils/validate_schema/validations';
const Campground = require("../models/campground");

import {ExpressError} from "../utils/ExpressError";
import { wrapAsync } from '../utils/wrapAsync';

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

campgroundRouter.get("/new", (req: Request, res: Response) => {
    res.render("campgrounds/new.ejs");
});

campgroundRouter.get("/:id/edit", wrapAsync(async(req: Request, res: Response) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp){
        req.flash("error", "Campground Could Not Be Found");
        res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit.ejs", {camp});
}));


campgroundRouter.get("/:id", wrapAsync(async(req: Request, res: Response) => {
    const {id} = req.params;
    const camp = await Campground.findById(id).populate("reviews");
    if(!camp){
        req.flash("error", "Campground Could Not Be Found");
        res.redirect("/campgrounds");
    }
    res.render("campgrounds/show.ejs", {camp});
}));




//OTHER ROUTES
//###############
//Create campground route
campgroundRouter.post("/new", validateCampground, wrapAsync(async(req: Request, res: Response) => {
    const newCamp = new Campground(req.body.campground)
    await newCamp.save();
    req.flash("success", `${newCamp.title} Was Created`);
    res.redirect(`/campgrounds/${newCamp._id}`)
 }));

//Update campgrounds route
campgroundRouter.put("/:id", validateCampground, wrapAsync(async(req: Request, res: Response) => {
    const {id} = req.params;
    const updatedCamp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    if(!updatedCamp){
        req.flash("error", "Campground To Be Updated Not Found");
        res.redirect("/campgrounds");
    }
    req.flash("success", `${updatedCamp.title} Was Updated`);
    res.redirect(`/campgrounds/${updatedCamp._id}`)
 }));


//Delete Campground route
campgroundRouter.delete("/:id", wrapAsync(async(req: Request, res: Response) => {
    const {id} = req.params;
    const deletedCamp = await Campground.findByIdAndDelete(id, {...req.body.campground});
    if(!deletedCamp){
        req.flash("error", "Campground To Be Deleted Not Found");
        res.redirect("/campgrounds");
    }
    req.flash("success", `${deletedCamp.title} Was Deleted`);
    res.redirect(`/campgrounds`)
 }));

 module.exports  = campgroundRouter;