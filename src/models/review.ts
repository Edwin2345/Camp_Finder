import { Schema, Model, HydratedDocument, model, connect } from 'mongoose';

/*1. Create Interface for Document + Model Methods*/
interface IReview{
   body: string,
   rating: number
}

const reviewSchema = new Schema<IReview>({
    body: {type: String},
    rating: {type: Number}
})


const Review = model<IReview>("Review", reviewSchema);


module.exports = Review;