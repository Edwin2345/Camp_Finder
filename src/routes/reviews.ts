import express, { Request, Response, NextFunction } from 'express';
import { reviewsValidationSchema, joinErrors} from '../utils/validate_schema/validations';
const Campground = require("../models/campground");
const Review = require("../models/review");

import {ExpressError} from "../utils/ExpressError"
import { wrapAsync } from '../utils/wrapAsync';


const reviewsRouter = express.Router({mergeParams: true});

function validateReview(req: Request, res: Response, next: NextFunction){
    const {error} = reviewsValidationSchema.validate(req.body);
    if(error){
      const errorStr  = joinErrors(error.details);
      console.log(errorStr);
      throw new ExpressError(errorStr, 400);
    } else{
       next();
    }
}

//Create Reviews Route
reviewsRouter.post("/new", validateReview, wrapAsync(async(req: Request, res: Response) => {
    //console.log(req.body.review);
    const {campid} = req.params;
    const camp = await Campground.findById(campid);
    const {rating, body} = req.body.review;
    const newReview = new Review({rating, body});
    camp.reviews.push(newReview._id);
    await newReview.save();
    await camp.save();
    req.flash("success", "New Review Created");
    res.redirect(`/campgrounds/${camp._id}`);
 }))


//Delete Review Route
reviewsRouter.delete("/:reviewid",  wrapAsync(async(req: Request, res: Response) => {
    const {campid, reviewid} = req.params;
    const camp = await Campground.findByIdAndUpdate(campid, {$pull: {reviews: reviewid}}, {new: true});
    await Review.findByIdAndDelete(reviewid);
    req.flash("success", "Review Deleted");
    res.redirect(`/campgrounds/${camp._id}`);
}))


module.exports = reviewsRouter;

