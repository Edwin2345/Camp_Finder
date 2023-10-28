import express, { Request, Response, NextFunction } from 'express';
import { campgroundValidationSchema, joinErrors} from '../utils/validate_schema/validations';
import {ExpressError} from "../utils/ExpressError";
import { wrapAsync } from '../utils/wrapAsync';
const {isLoggedIn, isAuthorCampground} = require("../utils/middleware");
const {campIndex, campNewForm, campEditForm, campShow, campNew, campUpdate, campDelete} = require("../controllers/campgrounds");
const campgroundRouter = express.Router();


// VALIDATION 
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


campgroundRouter.get("/", wrapAsync(campIndex));

//New Camp Form and Creation
campgroundRouter.route("/new")
                .get(isLoggedIn, campNewForm)
                .post(isLoggedIn, validateCampground, wrapAsync(campNew));


//Camp Edit Form
campgroundRouter.get("/:id/edit", isLoggedIn, isAuthorCampground, wrapAsync(campEditForm));


//Camp Show, Update, Delete
campgroundRouter.route("/:id")
                .get(wrapAsync(campShow))
                .put(isLoggedIn, isAuthorCampground, validateCampground, wrapAsync(campUpdate))
                .delete(isLoggedIn, isAuthorCampground, wrapAsync(campDelete));


module.exports  = campgroundRouter;