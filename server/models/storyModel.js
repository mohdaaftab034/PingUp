import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    content: {type: String},
    media_url: {type: String},
    media_type: {type: String, enum: ['text', 'image', 'video']},
    views_count: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    background_color: {type: String}
}, {timestamps: true, minimize: false})

// TTL Index: Automatically delete stories 24 hours after creation
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Story = mongoose.model('Story', storySchema)

export default Story