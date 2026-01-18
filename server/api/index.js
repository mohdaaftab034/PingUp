import app from './server.js'
import connectDB from './configs/db.js'

// Initialize database connection for serverless
let isConnected = false

const handler = async (req, res) => {
    if (!isConnected) {
        try {
            await connectDB()
            isConnected = true
        } catch (error) {
            console.error('Database connection failed:', error)
        }
    }
    return app(req, res)
}

export default handler
