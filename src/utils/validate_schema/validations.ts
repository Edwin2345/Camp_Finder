//validatecampground middleware
import Joi from "joi";
import {ValidationErrorItem} from "joi";

export function joinErrors(details: ValidationErrorItem[]): string{
    let errors = "";
    console.log(details);
    for( let err of details){
        errors = errors.concat(err.message).concat(",");
    }
    return errors;
}

export const campgroundValidationSchema = Joi.object({
    campground: Joi.object({
      title: Joi.string().required(),
      location: Joi.string().required(),
      price: Joi.number().required().min(0),
      image: Joi.string().required(),
      description: Joi.string().required()
    }).required()
 })


 export const reviewsValidationSchema = Joi.object({
    review: Joi.object({
      rating: Joi.number().required().min(0).max(5),
      body: Joi.string().required(), 
    }).required(),
 })