import fs from 'fs'
import imagekit from '../configs/imageKit.js'
import Story from '../models/storyModel.js'
import User from '../models/userModel.js'
import { inngest } from '../inngest/index.js'

//Add user story
export const addUserStory = async (req , res)=> {
    try {
        const userId = req.userId
        const {content, media_type, background_color} = req.body
        const media = req.file
        let media_url = ''

        //upload media to imagekit
        if(media_type == 'image' || media_type == 'video'){
            const fileBuffer = fs.readFileSync(media.path)
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: media.originalname,
            })
            media_url = response.url
        }
        //create story
        const story = await Story.create({
            user: userId,
            content,
            media_type,
            media_url,
            background_color
        })

        console.log(`✅ Story created: ${story._id}`);

        //Schedule story deletion after 24 hours
        try {
            await inngest.send({
                name: 'app/story.delete',
                data: {storyId: story._id}
            })
            console.log(`📧 Story deletion event sent to Inngest for story: ${story._id}`);
        } catch (inngestError) {
            console.error(`⚠️ Failed to send story deletion event to Inngest:`, inngestError.message);
            // Still respond with success as story is created, but log the Inngest error
        }

        res.json({success: true, message: "Story created successfully", storyId: story._id})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

//Get User stories
export const getStories = async (req , res)=> {
    try {
        const userId = req.userId
        const stories = await Story.find({}).populate('user').populate('likes').populate('views_count').sort({createdAt: -1})
        
        // Filter out stories with null/invalid user references
        const validStories = stories.filter(story => story.user !== null)

        res.json({success: true, stories: validStories})
        
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

//Add/Remove view to story
export const addStoryView = async (req, res) => {
    try {
        const userId = req.userId
        const { storyId } = req.body

        const story = await Story.findById(storyId)
        if (!story) {
            return res.json({ success: false, message: "Story not found" })
        }

        // Check if user already viewed
        if (!story.views_count.includes(userId)) {
            story.views_count.push(userId)
            await story.save()
        }

        res.json({ success: true, message: "View added" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//Like/Unlike story
export const toggleStoryLike = async (req, res) => {
    try {
        const userId = req.userId
        const { storyId } = req.body

        const story = await Story.findById(storyId).populate('likes')
        if (!story) {
            return res.json({ success: false, message: "Story not found" })
        }

        const isLiked = story.likes.some(like => like._id.toString() === userId)

        if (isLiked) {
            story.likes = story.likes.filter(like => like._id.toString() !== userId)
        } else {
            story.likes.push(userId)
        }

        await story.save()
        await story.populate('likes')

        res.json({ success: true, message: isLiked ? "Story unliked" : "Story liked", liked: !isLiked, likes: story.likes })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//Get story viewers
export const getStoryViewers = async (req, res) => {
    try {
        const { storyId } = req.params

        const story = await Story.findById(storyId).populate('views_count', 'full_name username profile_picture _id')
        if (!story) {
            return res.json({ success: false, message: "Story not found" })
        }

        res.json({ success: true, viewers: story.views_count })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}