import { BadgeCheck, X, Heart, Eye } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { DEFAULT_PROFILE_PICTURE } from '../assets/assets'
import api from '../api/axios'
import { useAuth } from '../context/AuthProvider'
import toast from 'react-hot-toast'

const StoryViewer = ({ viewStory, setViewStory, stories = [], currentIndex = 0, setViewStoryIndex }) => {

    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const currentUser = useSelector((state) => state.user.value)
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(viewStory?.likes?.length || 0);
    const [views, setViews] = useState(viewStory?.views_count?.length || 0);
    const [showViewers, setShowViewers] = useState(false);
    const [viewers, setViewers] = useState([]);

    useEffect(() => {
        // Add view to story
        const addView = async () => {
            try {
                const token = await getToken()
                await api.post('/api/story/view', 
                    { storyId: viewStory._id },
                    { headers: { Authorization: `Bearer ${token}` } }
                )
                setViews(viewStory?.views_count?.length || 0)
            } catch (error) {
                console.log(error)
            }
        }
        
        if (viewStory) {
            addView()
            // Check if current user has liked
            setIsLiked(viewStory?.likes?.some(like => like._id === currentUser?._id || like === currentUser?._id))
        }
    }, [viewStory, getToken, currentUser])

    const handleClose = () => {
        setViewStory(null)
    }

    const handleNext = React.useCallback(() => {
        if (stories.length > 0 && currentIndex < stories.length - 1) {
            let nextIndex = currentIndex + 1
            setViewStoryIndex(nextIndex)
            // Find next valid story (skip null users)
            let nextStory = stories[nextIndex]
            while (nextStory && !nextStory.user && nextIndex < stories.length - 1) {
                nextIndex++
                nextStory = stories[nextIndex]
            }
            if (nextStory && nextStory.user) {
                setViewStory(nextStory)
            } else {
                handleClose()
            }
        } else {
            handleClose()
        }
    }, [stories, currentIndex, setViewStoryIndex, setViewStory])

    const handlePrev = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1
            setViewStoryIndex(prevIndex)
            const prevStory = stories[prevIndex]
            if (prevStory && prevStory.user) {
                setViewStory(prevStory)
            }
        }
    }

    useEffect(() => {
        let timer, progressInterval;
        if (viewStory && viewStory.media_type !== 'video') {
            setProgress(0);
            const duration = 10000;
            const setTime = 100;
            let elapsed = 0;

            progressInterval = setInterval(() => {
                elapsed += setTime
                setProgress((elapsed / duration) * 100);
            }, setTime);

            // close story after duration
            timer = setTimeout(() => {
                handleNext()
            }, duration)
        }
        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
        }
    }, [viewStory, handleNext])

    const handleLike = async () => {
        try {
            const token = await getToken()
            const { data } = await api.post('/api/story/like',
                { storyId: viewStory._id },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            
            if (data.success) {
                setIsLiked(data.liked)
                setLikes(data.likes?.length || 0)
                toast.success(data.message)
            }
        } catch (error) {
            toast.error('Failed to like story')
            console.log(error)
        }
    }

    const fetchViewers = async () => {
        try {
            const token = await getToken()
            const { data } = await api.get(`/api/story/viewers/${viewStory._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            
            if (data.success) {
                setViewers(data.viewers)
                setShowViewers(true)
            }
        } catch (error) {
            toast.error('Failed to load viewers')
            console.log(error)
        }
    }

    if (!viewStory) return null

    const renderContent = () => {
        switch (viewStory.media_type) {
            case 'image':
                return (
                    <img src={viewStory.media_url} className='max-w-full max-h-[90vh] object-contain' alt="" />
                );
            case 'video':
                return (
                    <video src={viewStory.media_url} className='w-full h-auto max-h-[90vh] object-contain' autoPlay muted />
                );
            case 'text':
                return (
                    <div className='w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center'>
                        {viewStory.content}
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className='fixed inset-0 h-screen bg-black bg-opacity-95 z-110 flex items-center justify-center' style={{ backgroundColor: viewStory.media_type === 'text' ? viewStory.background_color : "#000000" }}>
            {/* Progress bar */}
            <div className='absolute top-0 left-0 w-full h-1 bg-gray-700'>
                <div className='h-full bg-white transition-all duration-100 linear' style={{ width: `${progress}%` }}>

                </div>
            </div>

            {/* User info - topleft */}
            <div onClick={() => navigate(`/profile/${viewStory.user?._id}`)} className='absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded bg-black/50 cursor-pointer hover:bg-black/70 transition z-20'>
                <img src={viewStory.user?.profile_picture || DEFAULT_PROFILE_PICTURE} alt="" className='size-7 sm:size-8 rounded-full object-cover border border-white' />
                <div className='text-white font-medium flex items-center gap-1.5'>
                    <span>{viewStory.user?.full_name}</span>
                    <BadgeCheck size={18} />
                </div>
            </div>

            {/* Close button */}
            <button onClick={handleClose} className='absolute top-4 right-4 text-white text-3xl font-bold focus:outline-none z-20'>
                <X className='w-8 h-8 hover:scale-110 transition cursor-pointer' />
            </button>

            {/* Likes and Views - bottom right */}
            <div className='absolute bottom-4 right-4 flex flex-col gap-3 sm:gap-4 z-20'>
                <div onClick={handleLike} className='flex items-center gap-2 text-white cursor-pointer hover:text-red-400 transition'>
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className='text-sm font-medium'>{likes}</span>
                </div>
                <div onClick={fetchViewers} className='flex items-center gap-2 text-white cursor-pointer hover:text-blue-400 transition'>
                    <Eye className='w-6 h-6' />
                    <span className='text-sm font-medium'>{views}</span>
                </div>
            </div>

            {/* Viewers Modal */}
            {showViewers && (
                <div className='absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30'>
                    <div className='bg-gray-900 rounded-lg p-4 max-w-sm w-80 max-h-96 overflow-y-auto'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-white font-semibold'>Viewed by {viewers.length}</h2>
                            <X onClick={() => setShowViewers(false)} className='w-5 h-5 text-gray-400 cursor-pointer hover:text-white' />
                        </div>
                        <div className='space-y-3'>
                            {viewers.map((viewer) => (
                                <div key={viewer._id} onClick={() => {
                                    navigate(`/profile/${viewer._id}`)
                                    setShowViewers(false)
                                }} className='flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer transition'>
                                    <img src={viewer.profile_picture || DEFAULT_PROFILE_PICTURE} alt="" className='w-8 h-8 rounded-full object-cover' />
                                    <div className='flex-1'>
                                        <p className='text-white text-sm font-medium'>{viewer.full_name}</p>
                                        <p className='text-gray-400 text-xs'>@{viewer.username}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Wrapper with Navigation */}
            <div className='max-w-[90vw] max-h-[90vh] flex items-center justify-center relative'>
                {/* Left clickable area */}
                <div onClick={handlePrev} className='absolute left-0 top-0 h-full w-1/4 cursor-pointer z-10 hover:bg-white/5 transition' />
                
                {/* Right clickable area */}
                <div onClick={handleNext} className='absolute right-0 top-0 h-full w-1/4 cursor-pointer z-10 hover:bg-white/5 transition' />

                {/* Center content */}
                <div className='flex items-center justify-center'>
                    {renderContent()}
                </div>

                {/* Navigation indicators */}
                {stories.length > 1 && (
                    <>
                        {currentIndex > 0 && (
                            <button onClick={handlePrev} className='absolute left-2 top-1/2 -translate-y-1/2 text-white text-2xl z-20 hover:text-gray-300 transition'>
                                ‹
                            </button>
                        )}
                        {currentIndex < stories.length - 1 && (
                            <button onClick={handleNext} className='absolute right-2 top-1/2 -translate-y-1/2 text-white text-2xl z-20 hover:text-gray-300 transition'>
                                ›
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default StoryViewer