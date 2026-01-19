import { BadgeCheck, Heart, MessageCircle, Share2, X } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'
import moment from 'moment'
import { DEFAULT_PROFILE_PICTURE } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '../context/AuthProvider.jsx'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Button from './Button'
import { useButtonLoader } from '../hooks/useButtonLoader'

const ReelCard = ({ reel }) => {
    const [likes, setLikes] = useState(reel.likes || [])
    const [showComment, setShowComment] = useState(false)
    const [commentContent, setCommentContent] = useState("")
    const [comments, setComments] = useState(reel.comments || [])
    const [commentLoading, setCommentLoading] = useState(false)
    const [connectionLoading, setConnectionLoading] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const videoRef = useRef(null)
    const currentUser = useSelector((state) => state.user.value)
    const { getToken } = useAuth()
    const navigate = useNavigate()

    // Guard against undefined user
    if (!reel.user) {
        return null
    }

    // Intersection Observer for autoplay/pause
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    if (videoRef.current) {
                        videoRef.current.muted = false
                        videoRef.current.play().catch(err => console.log('Play error:', err))
                    }
                } else {
                    setIsVisible(false)
                    if (videoRef.current) {
                        videoRef.current.muted = true
                        videoRef.current.pause()
                        videoRef.current.currentTime = 0
                    }
                }
            },
            { threshold: 0.5 }
        )

        const currentVideo = videoRef.current
        if (currentVideo) {
            observer.observe(currentVideo)
        }

        return () => {
            if (currentVideo) {
                currentVideo.muted = true
                currentVideo.pause()
                currentVideo.currentTime = 0
                observer.unobserve(currentVideo)
            }
        }
    }, [])

    const isCurrentUserLiked = () => {
        if (!currentUser || !likes) return false
        const currentUserId = currentUser._id?.toString()
        return likes.some(like => {
            const likeId = typeof like === 'object' ? like._id?.toString() : like?.toString()
            return likeId === currentUserId
        })
    }

    const isFollowing = () => {
        if (!currentUser || !currentUser.following) return false
        return currentUser.following.some(userId => userId && userId.toString() === reel.user._id?.toString())
    }

    const handleFollowToggle = async () => {
        try {
            const endpoint = isFollowing() ? '/api/user/unfollow' : '/api/user/follow'
            const { data } = await api.post(endpoint, { id: reel.user._id }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                toast.success(data.message)
            } else {
                throw new Error(data.message)
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }

    const { loading: followLoading, handleClick: handleFollow } = useButtonLoader(
        handleFollowToggle,
        {
            minDuration: 300,
            onError: (error) => toast.error(error.message)
        }
    )

    const handleLike = async () => {
        try {
            const { data } = await api.post(`/api/reel/like`, { reelId: reel._id },
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            )
            if (data.success) {
                toast.success('Liked!')
                setLikes(prev => {
                    const currentUserId = currentUser._id?.toString()
                    const isLiked = prev.some(like => {
                        const likeId = typeof like === 'object' ? like._id?.toString() : like?.toString()
                        return likeId === currentUserId
                    })
                    if (isLiked) {
                        return prev.filter(like => {
                            const likeId = typeof like === 'object' ? like._id?.toString() : like?.toString()
                            return likeId !== currentUserId
                        })
                    } else {
                        return [...prev, currentUser._id]
                    }
                })
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleComment = async (e) => {
        e?.preventDefault()
        if (!commentContent.trim()) return
        try {
            setCommentLoading(true)
            const { data } = await api.post(`/api/reel/comment`, {
                reelId: reel._id,
                content: commentContent.trim(),
            }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                toast.success("Comment added")
                if (data.comments) {
                    setComments(data.comments)
                } else {
                    setComments(prev => [...prev, {
                        _id: Date.now().toString(),
                        content: commentContent.trim(),
                        createdAt: new Date().toISOString(),
                        user: {
                            _id: currentUser?._id,
                            username: currentUser?.username,
                            full_name: currentUser?.full_name,
                            profile_picture: currentUser?.profile_picture,
                        }
                    }])
                }
                setCommentContent("")
            }
        } catch (err) {
            console.error("Failed to post comment:", err)
            toast.error("Could not post comment. Try again.")
        } finally {
            setCommentLoading(false)
        }
    }

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/reels/${reel._id}`
        const shareText = reel.caption ? reel.caption.slice(0, 140) : 'Check out this reel!'
        try {
            if (navigator.share) {
                await navigator.share({
                    title: reel.user?.full_name || 'PingUp Reel',
                    text: shareText,
                    url: shareUrl,
                })
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareUrl)
                toast.success('Link copied to clipboard')
            }
        } catch (err) {
            console.error('Share failed:', err)
        }
    }

    return (
        <div className='bg-white rounded-xl shadow overflow-hidden w-full max-w-2xl'>
            {/* User Info */}
            <div className='p-4 flex items-center justify-between'>
                <div onClick={() => navigate('/profile/' + reel.user._id)} className='inline-flex items-center gap-3 cursor-pointer flex-1'>
                    <img src={reel.user.profile_picture || DEFAULT_PROFILE_PICTURE} className='w-10 h-10 rounded-full shadow' alt="" />
                    <div>
                        <div className='flex items-center space-x-1'>
                            <span>{reel.user.full_name}</span>
                            <BadgeCheck className='w-4 h-4 text-blue-500' />
                        </div>
                        <div className='text-gray-500 text-sm'>@{reel.user.username} . {moment(reel.createdAt).fromNow()}</div>
                    </div>
                </div>
                {currentUser && currentUser._id !== reel.user._id && (
                    <Button 
                        variant='ghost'
                        size='sm'
                        onClick={handleFollow}
                        loading={followLoading}
                    >
                        {isFollowing() ? 'Following' : 'Follow'}
                    </Button>
                )}
            </div>

            {/* Video Container with Black Sides */}
            <div className='w-full bg-black flex items-center justify-center cursor-pointer' onClick={() => navigate(`/reels/${reel._id}`)}>
                <div className='w-full max-w-sm aspect-[9/16] overflow-hidden'>
                    <video
                        ref={videoRef}
                        src={reel.video_url}
                        loop
                        muted
                        playsInline
                        className='w-full h-full object-cover'
                    />
                </div>
            </div>

            {/* Caption */}
            {reel.caption && (
                <div className='px-4 pt-3 text-gray-800 text-sm'>
                    {reel.caption}
                </div>
            )}

            {/* Stats */}
            <div className='px-4 py-2 text-gray-500 text-xs border-b border-gray-200'>
                <span>{reel.views_count || 0} views</span>
            </div>

            {/* Actions */}
            <div className='flex items-center gap-4 text-gray-600 text-sm p-4 border-b border-gray-300'>
                <div className='flex items-center gap-1 cursor-pointer' onClick={handleLike}>
                    <Heart className={`w-4 h-4 ${isCurrentUserLiked() && 'text-red-500 fill-red-500'}`} />
                    <span>{likes?.length || 0}</span>
                </div>
                <div onClick={() => setShowComment(prev => !prev)} className='flex cursor-pointer items-center gap-1'>
                    <MessageCircle className='w-4 h-4' />
                    <span>{comments?.length || 0}</span>
                </div>
                <div className='flex items-center gap-1 cursor-pointer' onClick={handleShare}>
                    <Share2 className='w-4 h-4' />
                    <span>Share</span>
                </div>
            </div>

            {/* Comments Section */}
            {showComment && (
                <div className='p-4 space-y-3'>
                    <form className="w-full flex justify-between items-center gap-2 border-b border-gray-300 pb-2">
                        <input 
                            type="text" 
                            placeholder="Add a comment..." 
                            className='outline-none flex-1 text-sm' 
                            value={commentContent} 
                            onChange={(e) => setCommentContent(e.target.value)} 
                        />
                        <button
                            onClick={handleComment}
                            disabled={commentLoading || !commentContent.trim()}
                            className='px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400'
                        >
                            Post
                        </button>
                    </form>

                    <div className='space-y-3 max-h-48 overflow-y-auto'>
                        {comments.map((com) => {
                            if (!com?.user) return null
                            const commentTime = com.createdAt ? moment(com.createdAt).fromNow() : moment(reel.createdAt).fromNow()

                            return (
                                <div key={com._id} className='flex gap-2'>
                                    <img 
                                        src={com.user.profile_picture || DEFAULT_PROFILE_PICTURE} 
                                        alt={com.user.full_name} 
                                        className='w-8 h-8 rounded-full cursor-pointer'
                                        onClick={() => navigate(`/profile/${com.user._id}`)}
                                    />
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2'>
                                            <span className='font-semibold text-sm cursor-pointer hover:underline' onClick={() => navigate(`/profile/${com.user._id}`)}>
                                                {com.user.full_name || com.user.username}
                                            </span>
                                            <span className='text-xs text-gray-500'>{commentTime}</span>
                                        </div>
                                        <p className='text-sm text-gray-700'>{com.content}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ReelCard
