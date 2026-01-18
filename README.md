# PingUp - Social Media Platform

A modern full-stack social media platform with features including posts, stories, reels, messaging, and connections.

## 🚀 Features

- **User Authentication** - Secure JWT-based authentication
- **Posts** - Create, like, and comment on posts
- **Stories** - 24-hour ephemeral content with likes and views
- **Reels** - Short-form video content with Instagram-like interactions
- **Messaging** - Real-time direct messaging with SSE
- **Connections** - Follow/unfollow users and manage connections
- **Discover** - Find new users and content
- **Profile Management** - Customize profile with photos and bio

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- ImageKit account (for media storage)
- Inngest account (for scheduled jobs)
- Email account (for notifications)

## 🛠️ Installation

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
FRONTEND_URL=http://localhost:5173
```

5. Start the development server:
```bash
npm run server
```

The backend will run on `http://localhost:4000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Configure environment variable in `.env`:
```env
VITE_BASEURL=http://localhost:4000
```

5. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🚢 Deployment

### Deploy to Vercel

#### Backend Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the root directory to `server`
4. Add all environment variables from `.env.example`
5. Deploy

#### Frontend Deployment

1. Import the project in Vercel (separate deployment)
2. Set the root directory to `client`
3. Add environment variable:
   - `VITE_BASEURL`: Your deployed backend URL
4. Deploy

### Environment Variables Checklist

**Backend (Vercel):**
- ✅ MONGODB_URI
- ✅ JWT_SECRET
- ✅ IMAGEKIT_PUBLIC_KEY
- ✅ IMAGEKIT_PRIVATE_KEY
- ✅ IMAGEKIT_URL_ENDPOINT
- ✅ EMAIL_USER
- ✅ EMAIL_PASS
- ✅ INNGEST_EVENT_KEY
- ✅ INNGEST_SIGNING_KEY
- ✅ FRONTEND_URL (your frontend URL)

**Frontend (Vercel):**
- ✅ VITE_BASEURL (your backend URL)

## 📁 Project Structure

```
PingUp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API configuration
│   │   ├── assets/        # Images, icons
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── features/      # Redux slices
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   └── App.jsx        # Main app component
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
│
└── server/                # Node.js backend
    ├── api/              # Serverless handler
    ├── configs/          # Configuration files
    ├── controllers/      # Route controllers
    ├── inngest/          # Scheduled jobs
    ├── middleware/       # Express middleware
    ├── models/           # MongoDB models
    ├── routes/           # API routes
    ├── .env.example
    ├── package.json
    ├── server.js         # Main server file
    └── vercel.json
```

## 🔧 Tech Stack

**Frontend:**
- React 19
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios
- Lucide React (icons)
- React Hot Toast

**Backend:**
- Node.js
- Express
- MongoDB + Mongoose
- JWT Authentication
- ImageKit (media storage)
- Inngest (job scheduling)
- NodeMailer (email)
- Server-Sent Events (real-time messaging)

## 📱 Features Detail

### Posts
- Create posts with images
- Like and comment on posts
- Follow button on post cards
- View user profiles from posts

### Stories
- Upload photo/video stories
- 24-hour auto-deletion
- Like stories
- View story viewers
- Navigate between stories

### Reels
- Upload short-form videos
- Full-screen vertical scrolling
- Double-tap to like with animation
- Like, comment, and share
- Share reels via direct messages
- Preserve original video aspect ratio

### Messaging
- Real-time messaging with SSE
- Send images
- Share reels as thumbnails
- Click shared reel thumbnails to open videos

### Mobile Experience
- Responsive design
- Bottom navigation bar
- Fixed chat layout
- Full-screen reels experience
- Hidden navigation on reels page

## 🐛 Known Issues & Solutions

- **Horizontal scroll in chat**: Fixed with overflow-x-hidden
- **Video aspect ratio**: Videos maintain original aspect ratio
- **Double-tap like**: Properly implemented with ID comparison fixes
- **Share functionality**: Reels shared as direct messages with thumbnails

## 📄 License

This project is private and not licensed for public use.

## 👨‍💻 Development

Created by Aafta

For questions or issues, please contact the development team.
