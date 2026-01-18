import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

const buildUsername = async (email, preferredUsername) => {
  let base = preferredUsername || email.split('@')[0]
  let username = base
  let suffix = 0

  // ensure uniqueness by appending incremental suffix when needed
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await User.findOne({ username })
    if (!exists) break
    suffix += 1
    username = `${base}${suffix}`
  }

  return username
}

export const register = async (req, res) => {
  try {
    const { email, password, full_name, username } = req.body

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Email, password, and full name are required' })
    }

    const normalizedEmail = email.toLowerCase()

    const existingEmail = await User.findOne({ email: normalizedEmail })
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already in use' })
    }

    const finalUsername = await buildUsername(normalizedEmail, username)

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      full_name,
      username: finalUsername,
    })

    const safeUser = user.toObject()
    delete safeUser.password

    res.status(201).json({ success: true, token: generateToken(user._id), user: safeUser })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    const normalizedEmail = email.toLowerCase()
    const user = await User.findOne({ email: normalizedEmail }).select('+password')

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const safeUser = user.toObject()
    delete safeUser.password

    res.json({ success: true, token: generateToken(user._id), user: safeUser })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const safeUser = user.toObject()
    delete safeUser.password

    res.json({ success: true, user: safeUser })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
