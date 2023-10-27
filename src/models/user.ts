import { Schema, Model, HydratedDocument, model, connect } from 'mongoose';
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport")

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

//Automatically add other schema feilds using Passport
UserSchema.plugin(passportLocalMongoose);

const User =  model("User", UserSchema);

module.exports = User;