import fs from 'fs'
import imagekit from '../configs/imageKit.js'
import Reel from '../models/reelModel.js'
import User from '../models/userModel.js'

// Create a new reel
export const createReel = async (req, res) => {
    try {
        const userId = req.userId
        const { caption } = req.body
        const video = req.file

        if (!video) {
            return res.json({ success: false, message: "Video is required" })
        }

        // Upload video to imagekit
        const fileBuffer = fs.readFileSync(video.path)
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: video.originalname,
        })

        const reel = await Reel.create({
            user: userId,
            video_url: response.url,
            thumbnail_url: response.thumbnailUrl || response.url,
            caption
        })

        await reel.populate('user', 'full_name username profile_picture _id')

        res.json({ success: true, message: "Reel created successfully", reel })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get all reels
export const getReels = async (req, res) => {
    try {
        const reels = await Reel.find({})
            .populate('user', 'full_name username profile_picture _id')
            .populate('likes', '_id')
            .populate('comments.user', 'full_name username profile_picture _id')
            .sort({ createdAt: -1 })

        res.json({ success: true, reels })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Like/Unlike reel
export const toggleReelLike = async (req, res) => {
    try {
        const userId = req.userId
        const { reelId } = req.body

        const reel = await Reel.findById(reelId)
        if (!reel) {
            return res.json({ success: false, message: "Reel not found" })
        }

        const isLiked = reel.likes.some(like => like.toString() === userId)

        if (isLiked) {
            reel.likes = reel.likes.filter(like => like.toString() !== userId)
        } else {
            reel.likes.push(userId)
        }

        await reel.save()

        res.json({ 
            success: true, 
            message: isLiked ? "Reel unliked" : "Reel liked", 
            liked: !isLiked,
            likes_count: reel.likes.length
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Comment on reel
export const commentOnReel = async (req, res) => {
    try {
        const userId = req.userId
        const { reelId, content } = req.body

        if (!content || !content.trim()) {
            return res.json({ success: false, message: "Comment content is required" })
        }

        const reel = await Reel.findById(reelId)
        if (!reel) {
            return res.json({ success: false, message: "Reel not found" })
        }

        reel.comments.push({
            user: userId,
            content: content.trim()
        })

        await reel.save()
        await reel.populate('comments.user', 'full_name username profile_picture _id')

        res.json({ 
            success: true, 
            message: "Comment added", 
            comments: reel.comments 
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Increment share count
export const shareReel = async (req, res) => {
    try {
        const { reelId } = req.body

        const reel = await Reel.findById(reelId)
        if (!reel) {
            return res.json({ success: false, message: "Reel not found" })
        }

        reel.shares_count += 1
        await reel.save()

        res.json({ success: true, message: "Share counted", shares_count: reel.shares_count })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Increment view count
export const addReelView = async (req, res) => {
    try {
        const { reelId } = req.body

        const reel = await Reel.findById(reelId)
        if (!reel) {
            return res.json({ success: false, message: "Reel not found" })
        }

        reel.views_count += 1
        await reel.save()

        res.json({ success: true, views_count: reel.views_count })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
