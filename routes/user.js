const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const ConnectinRequest = require("../models/connectionRequests");
const USER_SAFE_DATA = ["firstName", "lastName", "age", "gender", "skills", "photoUrl", "about"];
const User = require("../models/user");


userRouter.get("/user/requests/received", userAuth, async (req, res)=>{
    try{
        const loggedInUser = req.user;
        if(!loggedInUser) throw new Error("u r not loggedIn");

        //finding all the connection requests u got 
        const allConnectionRequests = await ConnectinRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", "firstName lastName age gender photoUrl");

        if(allConnectionRequests.length == 0) res.json({msg: "U have no requests"});

        res.json({
            msg: "Data fetch successfully",
            data : allConnectionRequests
        })
    }
    catch(err){
        res.status(400).send("Error: "+ err);
    }
})


userRouter.get("/user/connections", userAuth, async (req, res)=>{
    try{
        const loggedInUser = req.user;
        if(!loggedInUser) throw new Error("u r not loggedIn");

        // Abhi --> Deepak
        // Deepak --> Vashudha
        // Rohit --> Deepak

        //finding all the connection requests u got 
        const MyConnections = await ConnectinRequest.find({
            $or: [ {toUserId: loggedInUser._id, status:"accepted"},
                   {fromUserId: loggedInUser._id, status : "accepted"}
                 ]
        }).populate("fromUserId", USER_SAFE_DATA);

        if(MyConnections.length == 0) res.json({msg: "U have no CONNECTIONS"});

        const data = MyConnections.map((connection)=>{
            if(connection.fromUserId._id.toString() === 
                    loggedInUser._id.toString())  return connection.toUserId;
            else return connection.fromUserId;
        })
        res.json({
            msg: "Data fetch successfully",
            connectionsInfo : MyConnections,
            data : data

        })
    }
    catch(err){
        res.status(400).send("Error: "+ err);
    }
})

            //("/feed?page=1&limit=10")
userRouter.get("/feed", userAuth, async (req, res)=>{
    try{
        const loggedInUser = req.user;
        if(!loggedInUser) throw new Error("u r not loggedIn");

        const page = parseInt(req.params.page) || 1;
        let limit = parseInt(req.params.limit) || 10;
        limit = limit<= 50 ? limit : 50;
        const skip = (page-1)*limit;



        //finding all the connection requests i got 
        const MyConnections = await ConnectinRequest.find({
            $or: [ {toUserId: loggedInUser._id, status:"accepted"},
                   {fromUserId: loggedInUser._id, status : "accepted"}
                 ]
        }).select("fromUserId toUserId");

        console.log(MyConnections);
        //since MyConnections constains myid in every connection so make it unique
        const hideUsersFromFeed = new Set();
        MyConnections.forEach(connection => {
            hideUsersFromFeed.add(connection.fromUserId);
            hideUsersFromFeed.add(connection.toUserId);
        });
        // not hideUserFromFeed constains all the user ids whome we should not have to show 
        // on the feed page 
        // so find all the user whome we have to show on feed page
        const showUsersOnFeed = await User.find({ _id: { $nin : Array.from(hideUsersFromFeed)}})
                                                                  .select(USER_SAFE_DATA)
                                                                  .skip(skip)
                                                                  .limit(limit);

        

        res.json({
            msg: "Data fetch successfully",
            data : showUsersOnFeed

        })
    }
    catch(err){
        res.status(400).send("Error: "+ err);
    }
})

module.exports = userRouter;