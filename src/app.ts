import express, { Application, Request, Response } from 'express';
const path = require("path");
import { Schema, model, connect } from 'mongoose';
const Campground = require("./models/campground");
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


//GET ROUTES: PAGES
app.get('/', (req: Request, res: Response): void => {
    res.render("home.ejs");
});

app.get("/campgrounds", async(req: Request, res: Response) => {
    const campArr = await Campground.find();
    res.render("campgrounds/index.ejs", {campArr});
});

app.get("/campgrounds/new", async(req: Request, res: Response) => {
    res.render("campgrounds/new.ejs");
});

app.get("/campgrounds/:id/edit", async(req: Request, res: Response) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    res.render("campgrounds/edit.ejs", {camp});
});


app.get("/campgrounds/:id", async(req: Request, res: Response) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    res.render("campgrounds/show.ejs", {camp});
});



//Create campground route
app.post("/campgrounds/new", async(req: Request, res: Response) => {
   const newCamp = new Campground(req.body.campground)
   await newCamp.save();
   res.redirect(`/campgrounds/${newCamp._id}`)
});


//Update campgrounds route
app.put("/campgrounds/:id", async(req: Request, res: Response) => {
    const {id} = req.params;
    const updatedCamp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${updatedCamp._id}`)
 });


//Delete Campground route
app.delete("/campgrounds/:id", async(req: Request, res: Response) => {
    const {id} = req.params;
    const deletedCamp = await Campground.findByIdAndDelete(id, {...req.body.campground});
    res.redirect(`/campgrounds`)
 });
 


app.listen(PORT, (): void => {
    console.log('SERVER IS UP ON PORT:', PORT);
});