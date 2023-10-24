import { Schema, Model, HydratedDocument, model, connect, Types } from 'mongoose';
const Review = require("./review");

/*1. Create Interface for Document + Model Methods*/
interface ICampground{
    title: string,
    price: number,
    image: string,
    description: string,
    location: string,
    reviews: Types.ObjectId[];
}

const campgroundSchema = new Schema<ICampground>({
   title: {type: String},
   price: {type: Number},
   image: {type: String},
   description: {type: String},
   location: {type: String},
   reviews: [
     {
      type: Schema.Types.ObjectId,
      ref: "Review"
     }
   ]
})

//Middleware to delete reviews associated with campground
campgroundSchema.post("findOneAndDelete", async function(camp){
     if(camp){
      const deletedProducts = await Review.deleteMany({_id: {$in: camp.reviews}});
     }
})

 
const Campground = model<ICampground>("Campground", campgroundSchema);

module.exports = Campground
