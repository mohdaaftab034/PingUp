import jwt from 'jsonwebtoken'

export const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || ''
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authenticated' })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.userId
        next()
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token' })
    }
}