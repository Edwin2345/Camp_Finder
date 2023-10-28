import express, { Request, Response, NextFunction } from 'express';
import { reviewsValidationSchema, joinErrors} from '../utils/validate_schema/validations';


import {ExpressError} from "../utils/ExpressError"
import { wrapAsync } from '../utils/wrapAsync';
const {isLoggedIn, isAuthorReview} = require("../utils/middleware");
const {reviewNew, reviewDelete} = require("../controllers/reviews")

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
reviewsRouter.post("/new",  isLoggedIn, validateReview, wrapAsync(reviewNew))


//Delete Review Route
reviewsRouter.delete("/:reviewid", isLoggedIn, isAuthorReview, wrapAsync(reviewDelete))


module.exports = reviewsRouter;

