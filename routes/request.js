const express = require("express");
const { userAuth } = require("../middlewares/auth");
const requestRouter = express.Router();
const User = require("../models/user");
const ConnectinRequest = require("../models/connectionRequests");


requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res)=>{
   try{

       const loggedInUser = req.user;
       if(!loggedInUser) throw new Error("you r not logged in");
   
       const {status, toUserId}  = req.params;
   
       // validating the status i.e it must be ignored or interested
       const allowedStatus = ["ignored", "interested"];
       const isAllowedStatus = allowedStatus.includes(status);
       if(! isAllowedStatus) throw new Error("Invalid status: "+ status);
   
       //checking is this toUserId is in our database or not
       const toUser = await User.findById(toUserId);
       if(!toUser) return res.status(400).send("User no found");
   
       //now check is this request already made, i.e is there r already friends or rejected or 
       // already send send friend request 
       const existingConnectionRequest = await ConnectinRequest.findOne({
           $or: [  {fromUserId : loggedInUser._id, toUserId},
                   { fromUserId : toUserId , toUserId : loggedInUser._id}
                ]
       })
       
       if(existingConnectionRequest)
            return res.status(400).json({msg : "connection request already exist!!!"});
   
       // seft conneciton is already check in schema
   
       // not make the new insatace of this connection req
       const newConnection = new ConnectinRequest({
           fromUserId : loggedInUser._id,
           toUserId,
           status
       })
   
       const data = await newConnection.save();
   
       res.json({
           msg: `${loggedInUser.firstName} is ${status} to ${toUser.firstName}`,
           data : data
       })
   }
   catch(err){
      res.status(400).send("ERROR: "+ err);
   }
})

requestRouter.post("/request/review/:status/:fromUserId", userAuth, async(req, res)=>{
    try{
        const loggedInUser = req.user;
        if(! loggedInUser) throw new Error("u r not loggedin");

        const {status , fromUserId} = req.params;

        //validating status
        const allowedStatus = ["accepted", "rejected"];
        if(! allowedStatus.includes(status))
            throw new Error("invalid status : " + status);

        //validation the fromUserId, that fromUserId exist in our database or not
        const fromUser = await User.findById(fromUserId);
        if( ! fromUser) throw new Error("user id "+ fromUserId + "is invalid");

        //finding the connection request 
        const connectionRequest = await ConnectinRequest.findOne({
            toUserId : loggedInUser._id,
            status: "interested",        
        })

        if(!connectionRequest)
            return res.status(400).json({msg: "Connection request not found"});


        // else we found the connection request so not accept or reject this connection req
        // based on the status user send in the query

        connectionRequest.status = status;
        const data = await connectionRequest.save();

        res.json({
            msg: `you ${status} the connection reqest of ${fromUser.firstName}`,
            data: data
        })
    }
    catch(err){
        res.status(400).send("ERROR: "+ err);
    }
})

module.exports = requestRouter;