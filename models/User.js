const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({

    username:String,
    password:String,

    email:String,
    randomNumber:String,
    email_active:Boolean,   // true da acitve, false chua active

    type:Number, //  0 Client, 1 Administrator

    status:Number,      // 1 active, 0 block

    dateCreated:Date,

    current_socketId:String

});

module.exports = mongoose.model("User", userSchema);