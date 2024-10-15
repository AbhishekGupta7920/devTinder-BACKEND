const express = require("express");
const app = express();
const PORT = 7777;
const connectDB = require("./config/database");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request")
const userRouter = require("./routes/user");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(cors({
    origin : "http://localhost:5173",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials : true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.use((req, res, next)=>{
    console.log("hello devs");
    next()
})

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

app.get("/", (req, res)=>{
    res.send("this is home page");
})

app.get("/users", async (req, res)=>{
    try{

        const users = await User.find({});
        console.log(users);
        if(users.length == 0)
             res.status(400).json("no user found");
        else res.send(users);
    }catch(err){
        res.status(400).send("ERROR: " + err);
    }
})


app.get("/user", async (req, res) => {
    try {
        const userEmail = req.body.emailId; 
        if (!userEmail) return res.status(400).send("Email ID not provided");

        const resultUser = await User.findOne({ emailId: userEmail }).lean(); // Await the query
        if (resultUser) return res.json({ msg: resultUser });
        else return res.status(404).send("User not found");
    } catch (err) {
        res.status(500).send("ERROR: " + err);
    }
});


connectDB()
  .then(()=>{
    console.log("database connected successfully");
    app.listen(PORT, ()=> console.log("server started at " + PORT));
  })
  .catch((err)=>{
      console.log("database cann't connected");
  })