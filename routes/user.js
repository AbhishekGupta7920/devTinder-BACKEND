const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const ConnectinRequest = require("../models/connectionRequests");
const USER_SAFE_DATA = ["firstName", "lastName", "age", "gender", "skills", "photoUrl", "about"];
const User = require("../models/user");

// Route: GET /user/requests/received
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        if (!loggedInUser) throw new Error("You are not logged in");

        // Finding all the connection requests you received
        const allConnectionRequests = await ConnectinRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", "firstName lastName age gender photoUrl");

        if (allConnectionRequests.length === 0) {
            return res.json({ msg: "You have no requests" }); // Return to prevent further execution
        }

        return res.json({
            msg: "Data fetched successfully",
            data: allConnectionRequests
        });
    } catch (err) {
        return res.status(400).send("Error: " + err.message); // Return for consistency
    }
});

// Route: GET /user/connections
userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        if (!loggedInUser) throw new Error("You are not logged in");

        // Finding all accepted connections
        // Abhi --> Deepak
        // Deepak --> Vashudha
        // Rohit --> Deepak
        const MyConnections = await ConnectinRequest.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUserId: loggedInUser._id, status: "accepted" }
            ]
        }).populate("fromUserId", USER_SAFE_DATA);

        if (MyConnections.length === 0) {
            return res.json({ msg: "You have no connections" }); // Return to prevent further execution
        }

        const data = MyConnections.map((connection) => {
            if (connection.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return connection.toUserId;
            } else {
                return connection.fromUserId;
            }
        });

        return res.json({
            msg: "Data fetched successfully",
            connectionsInfo: MyConnections,
            data: data
        });
    } catch (err) {
        return res.status(400).send("Error: " + err.message); // Return for consistency
    }
});

// Route: GET /feed?page=1&limit=10
userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        if (!loggedInUser) throw new Error("You are not logged in");

        // Correctly accessing query parameters
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit <= 50 ? limit : 50;
        const skip = (page - 1) * limit;

        // Finding all accepted connections
        const MyConnections = await ConnectinRequest.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUserId: loggedInUser._id, status: "accepted" }
            ]
        }).select("fromUserId toUserId");

        console.log(MyConnections);

        // Creating a set of user IDs to hide from the feed
        const hideUsersFromFeed = new Set();
        MyConnections.forEach(connection => {
            hideUsersFromFeed.add(connection.fromUserId.toString());
            hideUsersFromFeed.add(connection.toUserId.toString());
        });

        // Finding users to show on the feed (excluding hidden users)
        const showUsersOnFeed = await User.find({
            _id: { $nin: Array.from(hideUsersFromFeed) }
        })
            .select(USER_SAFE_DATA)
            .skip(skip)
            .limit(limit);

        return res.json({
            msg: "Data fetched successfully",
            data: showUsersOnFeed
        });
    } catch (err) {
        return res.status(400).send("Error: " + err.message); // Return for consistency
    }
});

module.exports = userRouter;
