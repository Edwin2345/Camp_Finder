import express, { Application, Request, Response, NextFunction } from 'express';
const path = require("path");
import { connect } from 'mongoose';
import {ExpressError} from "./utils/ExpressError";
import { wrapAsync } from './utils/wrapAsync';
const methodOverrride = require("method-override");
const ejsMate = require("ejs-mate");
const campgroundRouter = require("./routes/campgrounds");
const reviewsRouter = require("./routes/reviews");
const userRouter = require("./routes/users");
const sessions = require("express-session");
const flash = require("connect-flash")
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");




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
app.use(  express.static(path.join(__dirname, "public")) );


/*Express Session Setup*/
declare module 'express-session' {
    interface SessionData {
      returnTo: string;
    }
 }

const sessionOptions = {
    secret: "todoreplacewithsecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        //prevent XSS
        httpOnly: true,
        //make cookie expire after 1 week
        expires: Date.now() + 1000*60*60*24*7,
        maxAge:  1000*60*60*24*7
    }
}
app.use(sessions(sessionOptions))

//Flash Message Middleware
app.use(flash());



//Passport Auth Setup
app.use(passport.initialize());
app.use(passport.session());
//authentice using local user, password stragey
passport.use(new LocalStrategy(User.authenticate()))

//store and unstore data from session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Local Variables
app.use( (req: Request, res: Response, next: NextFunction) => {
    //flash messages
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    //user loggedin
    res.locals.currentUser = req.user
    next();
})


//Method overrride Middleware
app.use(methodOverrride("_method"));


//Campgroun Routes Middleware
app.use("/campgrounds", campgroundRouter);
//Review Routes Middleware
app.use("/campgrounds/:campid/reviews", reviewsRouter);
//User Routes Middleware
app.use("/", userRouter)

//HOME ROUTE
app.get('/', (req: Request, res: Response): void => {
    res.redirect("/login")
});


//##############################################################################################


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
 

//Port Setup
app.listen(PORT, (): void => {
    console.log('SERVER IS UP ON PORT:', PORT);
});