import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content: { type: String },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true, _id: true })

const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    image_urls: [{ type: String }],
    post_type: {
        type: String, enum: ['text', 'image', 'text_with_image'],
        required: true
    },
    likes_count: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comment: [commentSchema]
}, { timestamps: true, minimize: false })

const Post = mongoose.model('Post', postSchema)

export default Post;