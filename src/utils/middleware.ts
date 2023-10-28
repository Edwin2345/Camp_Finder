import express, { Request, Response, NextFunction } from 'express';
const Campground = require("../models/campground");
const Review = require("../models/review");


function isLoggedIn(req: Request, res: Response, next: NextFunction){
  if(!req.isAuthenticated()){
      req.session.returnTo = req.originalUrl;
      req.flash("error", "You must sign in first");
      return res.redirect("/login");
  }
  return next();
}


async function isAuthorCampground(req: Request, res: Response, next: NextFunction){
   const {id} = req.params;
   try{
      const campFound = await Campground.findById(id);
      if(!campFound){
        throw new Error();
      }
      else if(req.user && campFound.author.equals(req.user._id)){
         return next()
      }
      else{
         req.flash("error", "You do not have access to that campground");
         return res.redirect("/campgrounds");
      }
   }
   catch(e){
      req.flash("error", "Campground not Found");
       return res.redirect("/campgrounds");
   }
}


async function isAuthorReview(req: Request, res: Response, next: NextFunction){
   const {reviewid} = req.params;
   try{
      const reviewFound = await Review.findById(reviewid);
      if(!reviewFound){
         throw new Error
      }
      else if(req.user && reviewFound.author.equals(req.user._id)){
         return next()
      }
      else{
         req.flash("error", "You do not have access to that review");
         return res.redirect("/campgrounds");
      }
   }
   catch(e){
      req.flash("error", "Review not Found");
      return res.redirect("/campgrounds");
   }

}





function storeReturnToLocally(req: Request, res: Response, next: NextFunction){
   if(req.session.returnTo){
      res.locals.returnTo = req.session.returnTo;
   }
   next();
}






module.exports.isLoggedIn = isLoggedIn;
module.exports.storeReturnToLocally = storeReturnToLocally;
module.exports.isAuthorCampground = isAuthorCampground;
module.exports.isAuthorReview = isAuthorReview;