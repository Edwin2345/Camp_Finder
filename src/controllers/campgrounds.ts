import express, { Request, Response, NextFunction } from 'express';
const Campground = require("../models/campground");



//GET ROUTE FUNCTIONALITY
//##########################
module.exports.campIndex = async(req: Request, res: Response) => {
    const campArr = await Campground.find();
    res.render("campgrounds/index.ejs", {campArr});
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
    const newCamp = new Campground(req.body.campground)
    newCamp.author = req.user?._id;
    await newCamp.save();
    req.flash("success", `${newCamp.title} Was Created`);
    res.redirect(`/campgrounds/${newCamp._id}`)
}


module.exports.campUpdate = async(req: Request, res: Response) => {
    const {id} = req.params;
    try{
        const updatedCamp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
        if(!updatedCamp){
           throw new Error();
        }
        req.flash("success", `${updatedCamp.title} Was Updated`);
        res.redirect(`/campgrounds/${updatedCamp._id}`)
    }
    catch(e){
        req.flash("error", "Campground To Be Updated Not Found");
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
        req.flash("success", `${deletedCamp.title} Was Deleted`);
        res.redirect(`/campgrounds`)
    }
    catch(e){
        req.flash("error", "Campground To Be Deleted Not Found");
        res.redirect("/campgrounds");
    }
 }