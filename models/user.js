const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema({
    firstName: {
        type : String,
        require: true,
        minLength: 4,
        validate(value){
            if(!value) throw new Error("firstName can't be empty string")
        }
    },
    lastName: {
        type: String,
        validate(value){
            if(!value) throw new Error("lastName can't be empty string")
        }
    },
    emailId: {
        type: String,
        lowercase: true,
        require: true,
        unique: true,
        trim: true,
        validate(value){
            if(! validator.isEmail(value)) throw new Error("Invalid email"+ value);
        },    
    },
    password: {
        type: String,
        require: true,
        validate(value){
            if(! validator.isStrongPassword(value)) throw new Error("plz enter strong password")
        },
    },
    skills: [String],
    gender: {
        type: String,
        // require: true,
        validata(value){
            if(!["male", "female", "other"].includes(value)){
                throw new Error("gender is not valid - " + value);
            }
        }
    },
    age:{
        type: Number,
        min: 18,

    },
    about: {
        type: String,
        default: "hey i am using devTinder"
    },
    photoUrl: {
        type: String,
        default: "https://t4.ftcdn.net/jpg/02/50/23/29/240_F_250232932_MnAM3LqScjM6gIc9jb1BG44aXq8erWs3.jpg",
        validate(value){
            if(! validator.isURL(value)) throw new Error("photo url is invalid"); 
        }
    },
}, {timestamps : true});

const  userModel = mongoose.model("User", UserSchema);

module.exports = userModel;