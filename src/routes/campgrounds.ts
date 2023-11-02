import express, { Request, Response, NextFunction } from 'express';
import { campgroundValidationSchema, joinErrors} from '../utils/validate_schema/validations';
import {ExpressError} from "../utils/ExpressError";
import { wrapAsync } from '../utils/wrapAsync';
const {isLoggedIn, isAuthorCampground} = require("../utils/middleware");
const {campIndex, campNewForm, campEditForm, campShow, campNew, campUpdate, campDelete, campMine, campSearch} = require("../controllers/campgrounds");
const campgroundRouter = express.Router();
const multer  = require('multer')
const {storage} = require("../cloudinary/index")
const upload = multer({storage})


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
                .post(isLoggedIn, upload.array("campground[images]", 5), validateCampground, wrapAsync(campNew));
                /*.post(upload.array("campground[image]", 5), (req: Request, res: Response)=>{
                   console.log(req.body);
                   console.log(req.files);
                   res.redirect("/campgrounds")
                })*/

//search
campgroundRouter.get("/search", wrapAsync(campSearch))


//My Campgrounds page
campgroundRouter.get("/my", isLoggedIn, wrapAsync(campMine))


//Camp Edit Form
campgroundRouter.get("/:id/edit", isLoggedIn, isAuthorCampground, wrapAsync(campEditForm));


//Camp Show, Update, Delete
campgroundRouter.route("/:id")
                .get(wrapAsync(campShow))
                .put(isLoggedIn, isAuthorCampground, upload.array("campground[images]", 5), validateCampground, wrapAsync(campUpdate))
                .delete(isLoggedIn, isAuthorCampground, wrapAsync(campDelete));


module.exports  = campgroundRouter;