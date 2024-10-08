const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
    fromUserId : {
        type : mongoose.Schema.Types.ObjectId,
        require : true,
        ref: "User",
    },
    toUserId : {
        type : mongoose.Schema.Types.ObjectId,
        require : true,
        ref: "User",
    },
    status : {
        type: String,
        require: true,
        enum : {
            values : ["ignored", "interested", "accepted", "rejected"],
            massage : `{VLAUE} is incorrect status type`,
        }
    }
}, {timestamps : true});

connectionRequestSchema.index({fromUserId:1, toUserId : 1});

connectionRequestSchema.pre("save", function(next){
  const connectionRequest = this;
  // chcking if the formUserId is same as toUserId
  if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
    throw new Error("can't send connection request to itself");
  }

  next();
})

module.exports = new mongoose.model("ConnectinRequest", connectionRequestSchema);