import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true, lowercase: true},
    password: {type: String, required: true, select: false},
    full_name: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    bio: {type: String, default: "Hey there! I am using PingUp."},
    profile_picture: {type: String, default: ""},
    cover_photo: {type:String, default: ""},
    location: {type: String, default: ""},
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    following: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    connections: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
}, {timestamps: true, minimize: false})

const User = mongoose.model('User', userSchema)

export default User;