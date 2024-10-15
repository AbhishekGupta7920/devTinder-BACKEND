const express = require("express");
const profileRoute = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {userAuth} = require("../middlewares/auth");
const {validateEditProfileData} = require("../utils/validation");


profileRoute.get("/profile/view", async (req, res)=>{
    try{
        const {token} = req.cookies;
        if(!token) throw new Error("token is not valid");

        //validating or varifing the token 
        const decodedObj = await jwt.verify(token, "DEV@Tinder$790");
        
        const {_id} = decodedObj;
        const user = await User.findById(_id);
        if(!user) throw new Error("User not found");

        res.send(user);
    }catch(err){
        res.status(401).send("ERROR: " + err);
    }
})



profileRoute.patch("/profile/edit", userAuth,  async (req, res)=>{
    try{
        
        const user = req.user;

        if( ! validateEditProfileData(req)) throw new Error("Invalid Edit Request");

        // now update
        Object.keys(req.body).forEach((key)=>
           ( user[key] = req.body[key])
        )

        await user.save();
        res.json({msg: `${user.firstName} your profile has been updated`, newValue : user});

    }catch(err){
        res.status(400).send("ERROR: " + err);
    }
})

module.exports = profileRoute;