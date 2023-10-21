import { Request, Response, NextFunction } from 'express';
import { ExpressError } from './ExpressError';

export function wrapAsync( asyncFunc: Function){
    
    return function(req: Request, res:Response, next: NextFunction){
       asyncFunc(req,res, next)
       .catch( (err: Error | ExpressError) => next(err))
    }
}
