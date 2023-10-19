import { Schema, Model, HydratedDocument, model, connect } from 'mongoose';

/*1. Create Interface for Document + Model Methods*/
interface ICampground{
    title: string,
    price: number,
    image: string,
    description: string,
    location: string
}

const campgroundSchema = new Schema({
   title: {type: String},
   price: {type: Number},
   image: {type: String},
   description: {type: String},
   location: {type: String}
 })
 
const Campground = model<ICampground>("Campground", campgroundSchema);

module.exports = Campground
