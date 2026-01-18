import fs from 'fs'
import imagekit from '../configs/imageKit.js'
import Post from '../models/postModel.js'
import User from '../models/userModel.js'
import { inngest } from '../inngest/index.js'

//add a post
export const addPost = async (req, res) => {
    try {
        const userId = req.userId
        const { content, post_type } = req.body
        const images = req.files

        let image_urls = []

        if (images.length) {
            image_urls = await Promise.all(
                images.map(async (image) => {
                    const fileBuffer = fs.readFileSync(image.path)
                    const response = await imagekit.upload({
                        file: fileBuffer,
                        fileName: image.originalname,
                        folder: "posts"
                    })

                    const url = imagekit.url({
                        path: response.filePath,
                        transformation: [
                            { quality: 'auto' },
                            { format: 'webp' },
                            { width: '1280' }
                        ]
                    })
                    return url
                })
            )
        }

        await Post.create({
            user: userId,
            content,
            image_urls,
            post_type
        })

        res.json({ success: true, message: "Post created successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//Get Post
export const getFeedPost = async (req, res) => {
    try {
        const userId = req.userId
        const posts = await Post.find({})
            .populate('user')
            .populate('comment.user', 'username full_name profile_picture')
            .sort({ createdAt: -1 })
        
        // Filter out posts with null/invalid user references
        const validPosts = posts.filter(post => post.user !== null)

        res.json({ success: true, posts: validPosts })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//like Post (8:24)
export const likePost = async (req, res) => {
    try {
        const userId = req.userId
        const { postId } = req.body

        const post = await Post.findById(postId)

        const alreadyLiked = post.likes_count.some(likeId => likeId.toString() === userId)

        if (alreadyLiked) {
            post.likes_count = post.likes_count.filter(user => user.toString() !== userId)
            await post.save();
            res.json({ success: true, message: 'Post unliked' })
        } else {
            post.likes_count.push(userId)
            await post.save()
            res.json({ success: true, message: "Post liked" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//comment post // your inngest client instance

export const addComment = async (req, res) => {
    try {
        const userId = req.userId
        const { postId, content } = req.body
        if (!content) {
            return res.json({ success: false, message: "Comment content is required" });
        }

        // Add comment in DB
        const post = await Post.findByIdAndUpdate(
            postId,
            { $push: { comment: { content, user: userId, createdAt: new Date() } } },
            { new: true }
        ).populate('comment.user', 'username full_name profile_picture');

        if (!post) {
            return res.json({ success: false, message: "Post not found" });
        }

        const newComment = post.comment[post.comment.length - 1];

        // 🔥 Fire Inngest event to notify SSE
        await inngest.send({
            name: "post/comment.added",
            data: {
                postId,
                comment: {
                    id: newComment._id,
                    content: newComment.content,
                    user: newComment.user,
                },
            },
        });

        res.json({ success: true, message: "Comment added", post });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.json({ success: false, message: "Internal server error" });
    }
};
