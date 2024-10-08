const mongoose = require("mongoose");

const  connectDB = async ()=> {
    await mongoose.connect("mongodb+srv://abhigupta12558:iLEwjRWXppNlCnKS@hellonodejs.m0b8h.mongodb.net/devTinder");
}

module.exports = connectDB;