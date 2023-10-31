import { Schema, Model, HydratedDocument, model, connect, Types } from 'mongoose';
const Review = require("./review");

/*1. Create Interface for Document + Model Methods*/
interface Iimage{
   url: string,
   filename: string
}

interface IGeo{
   type: string,
   coordinates: number[]
}


interface ICampground{
    title: string,
    price: number,
    images: Iimage[],
    description: string,
    geometry: IGeo,
    location: string,
    author: Types.ObjectId
    reviews: Types.ObjectId[];
}

const campgroundSchema = new Schema<ICampground>({
   title: {type: String},
   price: {type: Number},
   images:  [
      {
        url: {type: String},
        filename: {type: String}
      }
   ],
   geometry: {
      type: {type: String, enum: ['Point'], required: true},
      coordinates: {type: [Number], required: true}
   },
   description: {type: String},
   location: {type: String},
   author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
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
