import express from 'express'
import { upload } from '../configs/multer.js'
import { protect } from '../middleware/auth.js'
import { addUserStory, getStories, toggleStoryLike, addStoryView, getStoryViewers } from '../controllers/storyController.js'

const storyRouter = express.Router()

storyRouter.post('/create', upload.single('media'), protect, addUserStory)
storyRouter.get('/get', protect, getStories)
storyRouter.post('/like', protect, toggleStoryLike)
storyRouter.post('/view', protect, addStoryView)
storyRouter.get('/viewers/:storyId', protect, getStoryViewers)

export default storyRouter