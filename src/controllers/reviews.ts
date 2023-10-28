import express, { Request, Response, NextFunction } from 'express';
const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.reviewNew = async(req: Request, res: Response) => {
    //console.log(req.body.review);
    try{
        const {campid} = req.params;
        const camp = await Campground.findById(campid);
        const {rating, body} = req.body.review;
        const newReview = new Review({rating, body});
        camp.reviews.push(newReview._id);
        newReview.author = req.user?._id;
        await newReview.save();
        await camp.save();
        req.flash("success", "New Review Created");
        res.redirect(`/campgrounds/${camp._id}`);
    }
    catch(e){
        req.flash("error", "Campground does not exist");
        res.redirect(`/campgrounds`);
    }
   
}


module.exports.reviewDelete = async(req: Request, res: Response) => {
    const {campid, reviewid} = req.params;
    try{
        const camp = await Campground.findByIdAndUpdate(campid, {$pull: {reviews: reviewid}}, {new: true});
        await Review.findByIdAndDelete(reviewid);
        req.flash("success", "Review Deleted");
        res.redirect(`/campgrounds/${camp._id}`);    
    }
    catch(e){
        req.flash("error", "Review Or Campground not found");
        res.redirect(`/campgrounds`);
    }
}