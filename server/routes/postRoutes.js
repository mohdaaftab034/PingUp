import express from 'express'
import { upload } from '../configs/multer.js'
import { protect } from '../middleware/auth.js'
import { addComment, addPost, getFeedPost, likePost } from '../controllers/postController.js'

const postRouter = express.Router()

postRouter.post('/add', upload.array('images', 4), protect, addPost)
postRouter.get('/feed', protect, getFeedPost)
postRouter.post('/like', protect, likePost)
postRouter.post('/comment', protect, addComment)

export default postRouter;