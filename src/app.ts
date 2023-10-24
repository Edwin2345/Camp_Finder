import express, { Application, Request, Response, NextFunction } from 'express';
const path = require("path");
import { Schema, model, connect } from 'mongoose';
import {ExpressError} from "./utils/ExpressError";
import { wrapAsync } from './utils/wrapAsync';
const Campground = require("./models/campground");
const Review = require("./models/review")
import { campgroundValidationSchema, joinErrors, reviewsValidationSchema } from './utils/validate_schema/validations';
const methodOverrride = require("method-override");
const ejsMate = require("ejs-mate");



const app: Application = express();
const PORT: number = 3001;

//MONGO CONNECTION
main().catch( e =>  console.log(e));

async function main(){

  await connect('mongodb://127.0.0.1:27017/campDB')
  console.log("Database Connection OPENED!")

}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, '../views'));

/*Middle Ware fo parsing Request Body (POST) from Form  or JSON*/
app.use(express.json());
app.use(express.urlencoded({extended: true}));


//Method overrride Middleware
app.use(methodOverrride("_method"));

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

//GET ROUTES: PAGES
app.get('/', (req: Request, res: Response): void => {
    res.render("home.ejs");
});

app.get("/campgrounds", wrapAsync(async(req: Request, res: Response) => {
    const campArr = await Campground.find();
    res.render("campgrounds/index.ejs", {campArr});
}));

app.get("/campgrounds/new", (req: Request, res: Response) => {
    res.render("campgrounds/new.ejs");
});

app.get("/campgrounds/:id/edit", wrapAsync(async(req: Request, res: Response) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    res.render("campgrounds/edit.ejs", {camp});
}));


app.get("/campgrounds/:id", wrapAsync(async(req: Request, res: Response) => {
    const {id} = req.params;
    const camp = await Campground.findById(id).populate("reviews");
    res.render("campgrounds/show.ejs", {camp});
}));


//##############################################################################################


//Create campground route
app.post("/campgrounds/new", validateCampground, wrapAsync(async(req: Request, res: Response) => {
   const newCamp = new Campground(req.body.campground)
   await newCamp.save();
   res.redirect(`/campgrounds/${newCamp._id}`)
}));


app.post("/campgrounds/:campid/reviews/new", validateReview, wrapAsync(async(req: Request, res: Response) => {
    //console.log(req.body.review);
    const {campid} = req.params;
    const camp = await Campground.findById(campid);
    const {rating, body} = req.body.review;
    const newReview = new Review({rating, body});
    camp.reviews.push(newReview._id);
    await newReview.save();
    await camp.save();
    console.log(newReview)
    res.redirect(`/campgrounds/${camp._id}`);
 }))


//Update campgrounds route
app.put("/campgrounds/:id", validateCampground, wrapAsync(async(req: Request, res: Response) => {
    const {id} = req.params;
    const updatedCamp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${updatedCamp._id}`)
 }));


//Delete Campground route
app.delete("/campgrounds/:id", wrapAsync(async(req: Request, res: Response) => {
    const {id} = req.params;
    const deletedCamp = await Campground.findByIdAndDelete(id, {...req.body.campground});
    res.redirect(`/campgrounds`)
 }));


//Delete Review Rout
app.delete("/campgrounds/:campid/reviews/:reviewid",  wrapAsync(async(req: Request, res: Response) => {
    const {campid, reviewid} = req.params;
    const camp = await Campground.findByIdAndUpdate(campid, {$pull: {reviews: reviewid}}, {new: true});
    await Review.findByIdAndDelete(reviewid);
    res.redirect(`/campgrounds/${camp._id}`);
}))

 //Unkown Route handler
 app.all("*", wrapAsync((req: Request, res: Response, next: NextFunction): void => {
    throw new ExpressError("Page Does Not Exist", 404)
}));

 //ERROR HANDLING
app.use((err: Error | ExpressError, req: Request, res: Response, next: NextFunction): void => {
    if( "statusCode" in err ){
        res.status(err.statusCode).render("error.ejs", {err});
     }else{
         res.status(500).render("error.ejs", {err});
     }
     next(err);
})
 


app.listen(PORT, (): void => {
    console.log('SERVER IS UP ON PORT:', PORT);
});