import mongoose from "mongoose";

const reelSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    video_url: { type: String, required: true },
    thumbnail_url: { type: String },
    caption: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    views_count: { type: Number, default: 0 },
    shares_count: { type: Number, default: 0 }
}, { timestamps: true });

const Reel = mongoose.model('Reel', reelSchema);

export default Reel;
