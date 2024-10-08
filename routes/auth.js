const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const {validateSingupData} = require("../utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


authRouter.post("/signup", async (req, res)=>{
    try{
        //validate body data
        validateSingupData(req);

        const {firstName, lastName, emailId, password, gender, age} = req.body;
        if(!emailId) return res.status(400).json({ error: 'Email ID is required.' });
        
        //checking if onother user with same email id exist 
        const existingUser = await User.findOne({ emailId  });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exist.' });
        }

        //encrypt password
        const passwordHash = await bcrypt.hash(password, 10);

        // creating a new instance of User 
        const newUser = new User({
            firstName, lastName, emailId, password : passwordHash
        });
    
        await newUser.save();
        res.json(
            {massage: "user created successfully",  data : newUser  }
        )
    }catch(err){
        res.status(400).send("ERROR: " + err);
    }
})

authRouter.post("/login", async (req, res)=>{
    try{
        const {emailId, password} = req.body;

        // finding user with this email and password
        const user = await User.findOne({emailId});
        if(!user) throw new Error("invalid Credintials");

        const isValidPassword = bcrypt.compare(password, user.password);
        if(! isValidPassword) throw new Error("invalid Credintials");

        //since user is found so generate a new token and set in cookies
        const token = jwt.sign({_id : user._id}, "DEV@Tinder$790");
        console.log(token);
        res.cookie("token", token);

        res.send(user)
    }catch(err){
        res.status(400).send("ERROR: " + err);
    }
})

authRouter.post("/logout", async (req, res)=>{
    res.cookie("token", null, {
        expires: new Date(Date.now()),
    })

    res.send("you r logout");
})

module.exports = authRouter;