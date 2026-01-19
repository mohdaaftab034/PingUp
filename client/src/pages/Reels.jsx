import React, { useEffect, useState, useRef } from 'react'
import { Heart, MessageCircle, Share2, MoreVertical, Play, Volume2, VolumeX, Plus, ArrowLeft, Home, Users, Search, UserIcon, Film } from 'lucide-react'
import { useAuth } from '../context/AuthProvider'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { DEFAULT_PROFILE_PICTURE } from '../assets/assets'
import { useNavigate, NavLink, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import UploadReelModal from '../components/UploadReelModal'

const Reels = () => {
    const [reels, setReels] = useState([])
    const [currentReelIndex, setCurrentReelIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [showComments, setShowComments] = useState(false)
    const [commentContent, setCommentContent] = useState('')
    const [muted, setMuted] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [showShareSheet, setShowShareSheet] = useState(false)
    const [shareTarget, setShareTarget] = useState(null)
    const [followingList, setFollowingList] = useState([])
    const [shareSending, setShareSending] = useState(false)
    const [showHeartAnimation, setShowHeartAnimation] = useState(false)
    const containerRef = useRef(null)
    const videoRefs = useRef([])
    const lastTapRef = useRef(0)
    const { getToken } = useAuth()
    const navigate = useNavigate()
    const { reelId } = useParams()
    const currentUser = useSelector((state) => state.user.value)

    useEffect(() => {
        fetchReels()
        fetchFollowing()
    }, [])

    // Scroll to specific reel if reelId is provided
    useEffect(() => {
        if (reelId && reels.length > 0) {
            const index = reels.findIndex(reel => reel._id === reelId)
            if (index !== -1) {
                setCurrentReelIndex(index)
                // Use immediate scroll without animation
                if (containerRef.current) {
                    const reelHeight = containerRef.current.clientHeight
                    containerRef.current.scrollTop = index * reelHeight
                }
            }
        }
    }, [reelId, reels])

    const fetchFollowing = async () => {
        try {
            const token = await getToken()
            const { data } = await api.get('/api/user/connections', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setFollowingList(data.following || [])
            }
        } catch (error) {
            console.log('Following fetch error:', error)
        }
    }

    const fetchReels = async () => {
        try {
            setLoading(true)
            const token = await getToken()
            const { data } = await api.get('/api/reel/get', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setReels(data.reels)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('Failed to load reels')
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return

            const container = containerRef.current
            const scrollTop = container.scrollTop
            const reelHeight = container.clientHeight
            const newIndex = Math.round(scrollTop / reelHeight)

            if (newIndex !== currentReelIndex && newIndex < reels.length) {
                setCurrentReelIndex(newIndex)
                setShowComments(false)
            }
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener('scroll', handleScroll)
            return () => container.removeEventListener('scroll', handleScroll)
        }
    }, [currentReelIndex, reels.length])

    useEffect(() => {
        // Play current video and pause others
        videoRefs.current.forEach((video, index) => {
            if (video) {
                if (index === currentReelIndex) {
                    video.play().catch(err => console.log('Video play error:', err))
                    // Add view
                    if (reels[index]) {
                        addView(reels[index]._id)
                    }
                } else {
                    video.pause()
                    video.currentTime = 0
                }
            }
        })
    }, [currentReelIndex, reels])

    const addView = async (reelId) => {
        try {
            const token = await getToken()
            await api.post('/api/reel/view', 
                { reelId },
                { headers: { Authorization: `Bearer ${token}` } }
            )
        } catch (error) {
            console.log('View error:', error)
        }
    }

    const handleLike = async (reelId, index) => {
        try {
            const token = await getToken()
            const { data } = await api.post('/api/reel/like',
                { reelId },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (data.success) {
                setReels(prev => prev.map((reel, i) => {
                    if (i === index) {
                        const currentUserId = currentUser._id?.toString()
                        const isLiked = reel.likes.some(like => {
                            const likeId = typeof like === 'object' ? like._id?.toString() : like?.toString()
                            return likeId === currentUserId
                        })
                        return {
                            ...reel,
                            likes: isLiked 
                                ? reel.likes.filter(like => {
                                    const likeId = typeof like === 'object' ? like._id?.toString() : like?.toString()
                                    return likeId !== currentUserId
                                  })
                                : [...reel.likes, currentUser._id]
                        }
                    }
                    return reel
                }))
            }
        } catch (error) {
            toast.error('Failed to like reel')
            console.log(error)
        }
    }

    const handleComment = async (reelId, index) => {
        if (!commentContent.trim()) return

        try {
            const token = await getToken()
            const { data } = await api.post('/api/reel/comment',
                { reelId, content: commentContent },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (data.success) {
                setReels(prev => prev.map((reel, i) => 
                    i === index ? { ...reel, comments: data.comments } : reel
                ))
                setCommentContent('')
                toast.success('Comment added')
            }
        } catch (error) {
            toast.error('Failed to comment')
            console.log(error)
        }
    }

    const urlToFile = async (url, filename) => {
        const res = await fetch(url)
        const blob = await res.blob()
        const inferredType = blob.type || 'image/jpeg'
        return new File([blob], filename, { type: inferredType })
    }

    const openShareSheet = (reel, index) => {
        setShareTarget({ reel, index })
        setShowShareSheet(true)
        if (followingList.length === 0) {
            fetchFollowing()
        }
    }

    const handleShareToUser = async (user) => {
        if (!shareTarget) return
        try {
            setShareSending(true)
            const token = await getToken()
            const shareUrl = `${window.location.origin}/reels/${shareTarget.reel._id}`
            const thumbUrl = shareTarget.reel.thumbnail_url || shareTarget.reel.video_url

            // Send as direct message with thumbnail image and video URL in text
            const formData = new FormData()
            formData.append('to_user_id', user._id)
            formData.append('text', shareTarget.reel.video_url)

            if (thumbUrl) {
                const file = await urlToFile(thumbUrl, 'reel-thumbnail.jpg')
                formData.append('image', file)
            }

            await api.post('/api/message/send', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })

            // Increment share count
            await api.post('/api/reel/share',
                { reelId: shareTarget.reel._id },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            setReels(prev => prev.map((reel, i) =>
                i === shareTarget.index
                    ? { ...reel, shares_count: (reel.shares_count || 0) + 1 }
                    : reel
            ))

            toast.success(`Shared with ${user.full_name || user.username || 'user'}`)
            setShowShareSheet(false)
        } catch (error) {
            toast.error('Failed to share')
            console.log('Share error:', error)
        } finally {
            setShareSending(false)
        }
    }

    const isReelLiked = (reel) => {
        if (!currentUser || !reel.likes) return false
        const currentUserId = currentUser._id?.toString()
        return reel.likes.some(like => {
            const likeId = typeof like === 'object' ? like._id?.toString() : like?.toString()
            return likeId === currentUserId
        })
    }

    const handleVideoDoubleTap = () => {
        const now = Date.now()
        const lastTap = lastTapRef.current
        const isDoubleTap = now - lastTap < 300

        lastTapRef.current = now

        if (isDoubleTap) {
            const reel = reels[currentReelIndex]
            if (reel) {
                handleLike(reel._id, currentReelIndex)
                setShowHeartAnimation(true)
                setTimeout(() => setShowHeartAnimation(false), 600)
            }
        }
    }

    if (loading) {
        return (
            <div className='h-screen flex items-center justify-center bg-black'>
                <div className='w-16 h-16 rounded-full border-4 border-white border-t-transparent animate-spin'></div>
            </div>
        )
    }

    if (reels.length === 0) {
        return (
            <div className='h-screen flex items-center justify-center bg-black'>
                <div className='text-white text-xl'>No reels available</div>
            </div>
        )
    }

    return (
        <div className='fixed inset-0 overflow-hidden bg-black lg:flex lg:items-center lg:justify-center'>
            <div 
                ref={containerRef}
                className='h-screen w-full lg:h-screen lg:w-[480px] overflow-y-scroll snap-y snap-mandatory bg-black hide-scrollbar'
                style={{ scrollBehavior: reelId ? 'auto' : 'smooth' }}
        >
            {reels.map((reel, index) => (
                <div 
                    key={reel._id} 
                    className='h-screen w-full snap-start snap-always relative flex flex-col bg-black'
                >
                    {/* Top Controls - Back & Upload Buttons */}
                    <div className='absolute top-2 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-40 flex items-center justify-between'>
                        <button
                            onClick={() => navigate(-1)}
                            className='text-white p-2 sm:p-3 rounded-full bg-transparent hover:bg-white/10 transition'
                        >
                            <ArrowLeft className='w-5 sm:w-6 h-5 sm:h-6' />
                        </button>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className='text-white p-2 sm:p-3 rounded-full bg-transparent hover:bg-white/10 transition'
                        >
                            <Plus className='w-5 sm:w-6 h-5 sm:h-6' />
                        </button>
                    </div>

                    {/* Video Container - fills available space */}
                    <div className='flex-1 flex items-center justify-center overflow-hidden'>
                        <video
                            ref={el => videoRefs.current[index] = el}
                            src={reel.video_url}
                            className='w-full h-full object-cover cursor-pointer'
                            loop
                            muted={muted}
                            playsInline
                            onDoubleClick={handleVideoDoubleTap}
                        />

                        {/* Heart Animation */}
                        {showHeartAnimation && currentReelIndex === index && (
                            <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                                <Heart className='w-16 sm:w-24 fill-white text-white animate-ping ' />
                            </div>
                        )}
                    </div>

                    {/* User Info Overlay on Video */}
                    <div className='absolute bottom-13 sm:bottom-14 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 sm:px-4 py-2 sm:py-3'>
                        <div className='flex-1'>
                            <div 
                                onClick={() => navigate(`/profile/${reel.user._id}`)}
                                className='flex items-center gap-2 mb-2 sm:mb-3 cursor-pointer w-fit'
                            >
                                <img 
                                    src={reel.user.profile_picture || DEFAULT_PROFILE_PICTURE} 
                                    alt={reel.user.full_name}
                                    className='w-8 sm:w-10 h-8 sm:h-10 rounded-full border-2 border-white'
                                />
                                <span className='text-white font-semibold text-xs sm:text-sm'>
                                    @{reel.user.username}
                                </span>
                            </div>
                            {reel.caption && (
                                <p className='text-white text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2'>{reel.caption}</p>
                            )}
                            <div className='flex items-center gap-4 text-white text-xs sm:text-sm'>
                                <span>{reel.views_count || 0} views</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Like, Comment, Share */}
                    <div className='absolute right-3 sm:right-4 bottom-24 sm:bottom-28 flex flex-col items-center gap-4 sm:gap-6 z-20'>
                        <div className='flex flex-col items-center'>
                            <button 
                                onClick={() => handleLike(reel._id, index)}
                                className='text-white hover:scale-110 transition'
                            >
                                <Heart 
                                    className={`w-6 sm:w-7 h-6 sm:h-7 ${isReelLiked(reel) ? 'fill-red-500 text-red-500' : ''}`}
                                />
                            </button>
                            <span className='text-white text-xs mt-1'>
                                {reel.likes?.length || 0}
                            </span>
                        </div>

                        <div className='flex flex-col items-center'>
                            <button 
                                onClick={() => setShowComments(!showComments)}
                                className='text-white hover:scale-110 transition'
                            >
                                <MessageCircle className='w-6 sm:w-7 h-6 sm:h-7' />
                            </button>
                            <span className='text-white text-xs mt-1'>
                                {reel.comments?.length || 0}
                            </span>
                        </div>

                        <button 
                            onClick={() => openShareSheet(reel, index)}
                            className='text-white hover:scale-110 transition'
                        >
                            <Share2 className='w-6 sm:w-7 h-6 sm:h-7' />
                        </button>
                    </div>

                    {/* Fixed Bottom Navbar */}
                    <div className='fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:w-[480px]'>
                        <div className='flex items-center justify-around py-2'>
                            <NavLink to='/' end className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`}>
                                <Home className='w-5 sm:w-6 h-5 sm:h-6' />
                            </NavLink>
                            <NavLink to='/reels' className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`}>
                                <Film className='w-5 sm:w-6 h-5 sm:h-6' />
                            </NavLink>
                            <NavLink to='/connections' className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`}>
                                <Users className='w-5 sm:w-6 h-5 sm:h-6' />
                            </NavLink>
                            <NavLink to='/discover' className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`}>
                                <Search className='w-5 sm:w-6 h-5 sm:h-6' />
                            </NavLink>
                            <NavLink to='/profile' className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`}>
                                <UserIcon className='w-5 sm:w-6 h-5 sm:h-6' />
                            </NavLink>
                        </div>
                    </div>

                    {/* Comments Section - Fixed at bottom when active */}
                    {showComments && currentReelIndex === index && (
                        <div className='fixed bottom-16 left-0 right-0 max-h-[calc(100vh-64px)] bg-black/95 backdrop-blur-lg overflow-y-auto z-40 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:w-[480px]'>
                            <div className='flex items-center justify-between px-4 py-3 sticky top-0 bg-black/80 border-b border-gray-700'>
                                <h3 className='text-white font-semibold text-sm sm:text-base'>Comments</h3>
                                <button 
                                    onClick={() => setShowComments(false)}
                                    className='text-white text-lg'
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className='space-y-3 p-4 mb-4'>
                                {reel.comments?.map((comment, i) => (
                                    <div key={i} className='flex gap-2'>
                                        <img 
                                            src={comment.user?.profile_picture || DEFAULT_PROFILE_PICTURE}
                                            className='w-7 sm:w-8 h-7 sm:h-8 rounded-full flex-shrink-0'
                                            alt={comment.user?.full_name}
                                        />
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-white text-xs sm:text-sm'>
                                                <span className='font-semibold'>{comment.user?.username}</span>
                                                {' '}{comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className='flex gap-2'>
                                <input
                                    type='text'
                                    placeholder='Add a comment...'
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    className='flex-1 bg-white/10 text-white px-4 py-2 rounded-full outline-none border border-white/20'
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleComment(reel._id, index)
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => handleComment(reel._id, index)}
                                    className='px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition'
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Upload Reel Modal */}
            {showUploadModal && (
                <UploadReelModal 
                    setShowModal={setShowUploadModal} 
                    onReelUploaded={fetchReels}
                />
            )}

            {/* Share Bottom Sheet */}
            {showShareSheet && (
                <div className='fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm' onClick={() => setShowShareSheet(false)}>
                    <div className='bg-white rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
                        <div className='flex items-center justify-between mb-4'>
                            <h3 className='text-lg font-semibold'>Share with</h3>
                            <button className='text-sm text-gray-500' onClick={() => setShowShareSheet(false)}>Close</button>
                        </div>

                        {followingList.length === 0 ? (
                            <p className='text-sm text-gray-500'>You are not following anyone yet.</p>
                        ) : (
                            <div className='space-y-3'>
                                {followingList.map(user => (
                                    <div key={user._id} className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <img 
                                                src={user.profile_picture || DEFAULT_PROFILE_PICTURE}
                                                alt={user.full_name}
                                                className='w-10 h-10 rounded-full'
                                            />
                                            <div className='flex flex-col'>
                                                <span className='font-semibold text-gray-900'>{user.full_name || 'User'}</span>
                                                <span className='text-sm text-gray-500'>@{user.username}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleShareToUser(user)}
                                            disabled={shareSending}
                                            className='px-3 py-1 rounded-full bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60'
                                        >
                                            {shareSending ? 'Sharing...' : 'Share'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}            </div>        </div>
    )
}

export default Reels
