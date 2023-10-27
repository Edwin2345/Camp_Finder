import express, { Request, Response, NextFunction } from 'express';


function isLoggedIn(req: Request, res: Response, next: NextFunction){
  if(!req.isAuthenticated()){
      req.session.returnTo = req.originalUrl;
      req.flash("error", "You must sign in first");
      return res.redirect("/login");
  }
  return next();
}


function storeReturnToLocally(req: Request, res: Response, next: NextFunction){
   if(req.session.returnTo){
      res.locals.returnTo = req.session.returnTo;
   }
   next();
}

module.exports.isLoggedIn = isLoggedIn;
module.exports.storeReturnToLocally = storeReturnToLocally;