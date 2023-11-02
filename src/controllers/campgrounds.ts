import express, { Request, Response, NextFunction } from 'express';
const Campground = require("../models/campground");
const {default: multer}  = require('multer');
const {cloudinary} = require("../cloudinary/index");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN;


const geoCoder = mbxGeocoding({accessToken: mapBoxToken})

interface Iimage{
    url: string,
    filename: string
 }
 

//GET ROUTE FUNCTIONALITY
//##########################
module.exports.campIndex = async(req: Request, res: Response) => {
    const campArr = await Campground.find();
    res.render("campgrounds/index.ejs", {campArr , type: "all"});
}


module.exports.campNewForm = (req: Request, res: Response) => {
    res.render("campgrounds/new.ejs");
}


module.exports.campEditForm = async(req: Request, res: Response) => {
    const {id} = req.params;
    try{
        const camp = await Campground.findById(id);
        if(!camp){
           throw new Error()
        }
        res.render("campgrounds/edit.ejs", {camp});
    }
    catch(e){
        req.flash("error", "Campground Could Not Be Found");
        res.redirect("/campgrounds");
    }
}



module.exports.campSearch= async(req: Request, res: Response) => {
  const {option, query} = req.query;
  let campArr = [];
  if(option === "address"){
    campArr =  await Campground.find({location: query});
  }
  else if(option === "name"){
    campArr =  await Campground.find({title: query}); 
  }
  res.render("campgrounds/index.ejs", {campArr , type: "results"});
}



module.exports.campMine= async(req: Request, res: Response) => {
    if(req.user){
    const campArr = await Campground.find({author: req.user._id});
      res.render("campgrounds/index.ejs", {campArr , type: "mine"});
    }
}


module.exports.campShow = async(req: Request, res: Response) => {
    const {id} = req.params;
    try{
        const camp = await Campground.findById(id)
        .populate({
           path: "reviews",
           populate: {
             path: "author",
             model: "User"
           }
        })
        .populate("author");
        if(!camp){
            throw new Error();
        }
        res.render("campgrounds/show.ejs", {camp});
    }
    catch(e){
        req.flash("error", "Campground Could Not Be Found");
        res.redirect("/campgrounds");
    }
}



//OTHER CAMP FUNCTIONALITY
//##########################
module.exports.campNew = async(req: Request, res: Response) => {
    try{
       const geoResult = await geoCoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send();
        const newCamp = new Campground(req.body.campground)
        if(geoResult){
            newCamp.geometry = geoResult.body.features[0].geometry;
        }
        newCamp.author = req.user?._id;
        //add images
        if(req.files){
            const imgArr = req.files as Array<Express.Multer.File>
            newCamp.images = imgArr.map((el)=>{
               return {
                 url: el.path,
                 filename: el.filename
               }
            })
        }
        await newCamp.save();
        req.flash("success", `${newCamp.title} Was Created`);
        res.redirect(`/campgrounds/${newCamp._id}`);
    }
    catch(e: any){
        req.flash("error", e.toString());
        res.redirect("/campgrounds");
    } 
}


module.exports.campUpdate = async(req: Request, res: Response) => {
    const {id} = req.params;
    try{
        const updatedCamp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
        if(!updatedCamp){
           throw new Error();
        }
        //Geocode new location
        if(req.body.campground.location !== updatedCamp.location){
            const geoResult = await geoCoder.forwardGeocode({
                 query: req.body.campground.location,
                 limit: 1
             }).send();
             if(geoResult){
                 updatedCamp.geometry = geoResult.body.features[0].geometry;
             }
        }
        //add images
        if(req.files){
            const imgArr = req.files as Array<Express.Multer.File>
            imgArr.forEach((el)=>{
                updatedCamp.images.push(
                 {
                  url: el.path,
                  filename: el.filename
                 }
                )
            })
        }
        await updatedCamp.save();
        //delete images
        if(req.body.deleteImages){
            for(let img of req.body.deleteImages){
               await cloudinary.uploader.destroy(img);
            }
            await updatedCamp.updateOne({$pull : {images: {filename: {$in: req.body.deleteImages}}}})
        }
        req.flash("success", `${updatedCamp.title} Was Updated`);
        res.redirect(`/campgrounds/${updatedCamp._id}`)
    }
    catch(e: any){
        req.flash("error", e.toString());
        res.redirect("/campgrounds");
    }
 }



module.exports.campDelete = async(req: Request, res: Response) => {
    const {id} = req.params;
    try{
        const deletedCamp = await Campground.findByIdAndDelete(id, {...req.body.campground});
        if(!deletedCamp){
          throw new Error();
        }
        for(let img of deletedCamp.images){
               await cloudinary.uploader.destroy(img.filename);
        }
        req.flash("success", `${deletedCamp.title} Was Deleted`);
        res.redirect(`/campgrounds`)
    }
    catch(e){
        req.flash("error", "Campground To Be Deleted Not Found");
        res.redirect("/campgrounds");
    }
 }