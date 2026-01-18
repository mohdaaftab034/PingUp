import express from 'express'
import { upload } from '../configs/multer.js'
import { protect } from '../middleware/auth.js'
import { 
    createReel, 
    getReels, 
    toggleReelLike, 
    commentOnReel, 
    shareReel,
    addReelView 
} from '../controllers/reelController.js'

const reelRouter = express.Router()

reelRouter.post('/create', upload.single('video'), protect, createReel)
reelRouter.get('/get', protect, getReels)
reelRouter.post('/like', protect, toggleReelLike)
reelRouter.post('/comment', protect, commentOnReel)
reelRouter.post('/share', protect, shareReel)
reelRouter.post('/view', protect, addReelView)

export default reelRouter
