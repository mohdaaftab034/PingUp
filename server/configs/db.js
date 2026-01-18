import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', true)
        mongoose.connection.on('connected', () => console.log('Database connected'))
        mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err.message))

        const uri = process.env.MONGODB_URI
        if (!uri) {
            throw new Error('MONGODB_URI is not set')
        }

        await mongoose.connect(uri, {
            dbName: 'pingup',
            serverSelectionTimeoutMS: 15000,
        })
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message)
        throw error
    }
}

export default connectDB;