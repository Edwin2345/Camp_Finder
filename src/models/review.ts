import { Schema, Model, HydratedDocument, model, connect, Types} from 'mongoose';

/*1. Create Interface for Document + Model Methods*/
interface IReview{
   body: string,
   rating: number,
   author: Types.ObjectId
}

const reviewSchema = new Schema<IReview>({
    body: {type: String},
    rating: {type: Number},
    author: {type: Schema.Types.ObjectId, ref: "User"},
})


const Review = model<IReview>("Review", reviewSchema);


module.exports = Review;