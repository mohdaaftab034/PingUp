import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/db.js'
import { inngest, functions } from './inngest/index.js'
import { serve } from 'inngest/express'
import userRouter from './routes/userRoutes.js'
import postRouter from './routes/postRoutes.js'
import storyRouter from './routes/storyRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import authRouter from './routes/authRoutes.js'
import reelRouter from './routes/reelRoutes.js'

const app = express()

await connectDB()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => res.send('server is running...'))
app.use('/api/inngest', serve({ client: inngest, functions }))
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/post', postRouter)
app.use('/api/story', storyRouter)
app.use('/api/message', messageRouter)
app.use('/api/reel', reelRouter)

const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log(`Server running on Port ${PORT}`))