import { BadgeCheck, Heart, HeartIcon, LucideSendHorizonal, MessageCircle, SendHorizonal, Share2, Plus, X } from 'lucide-react'
import React, { useState } from 'react'
import moment from 'moment'
import { dummyUserData, DEFAULT_PROFILE_PICTURE } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '../context/AuthProvider.jsx'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { fetchUser } from '../features/user/userSlice'
import Button from './Button'
import { useButtonLoader } from '../hooks/useButtonLoader'

const PostCard = ({ post }) => {

    const [likes, setLikes] = useState(post.likes_count || [])
    const currentUser = useSelector((state) => state.user.value)
    const postWithHashTag = post.content ? post.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>') : ''
    const { getToken } = useAuth()
    const dispatch = useDispatch()

    // Guard against undefined user
    if (!post.user) {
        return null
    }
    const [showComment, setShowComment] = useState(false)
    const [commentContent, setCommentContent] = useState("")
    const [comments, setComments] = useState(post.comment || [])
    const [commentLoading, setCommentLoading] = useState(false)
    const [activeImage, setActiveImage] = useState(null)
    const [connectionLoading, setConnectionLoading] = useState(false)

    const isCurrentUserLiked = () => {
        if (!currentUser || !likes) return false
        return likes.some(id => id && id.toString() === currentUser._id?.toString())
    }

    const isFollowing = () => {
        if (!currentUser || !currentUser.following) return false
        return currentUser.following.some(userId => userId && userId.toString() === post.user._id?.toString())
    }

    const handleFollowToggle = async () => {
        try {
            const endpoint = isFollowing() ? '/api/user/unfollow' : '/api/user/follow'
            const {data} = await api.post(endpoint, {id: post.user._id}, {
                headers: {Authorization: `Bearer ${await getToken()}`}
            })

            if(data.success){
                toast.success(data.message)
                dispatch(fetchUser(await getToken()))
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
            const { data } = await api.post(`/api/post/like`, { postId: post._id },
                { headers: { Authorization: `Bearer ${await getToken()}` } }
            )
            if (data.success) {
                toast.success(data.message)
                setLikes(prev => {
                    const currentLiked = prev.some(id => id.toString() === currentUser._id.toString())
                    if (currentLiked) {
                        return prev.filter(id => id.toString() !== currentUser._id.toString())
                    } else {
                        return [...prev, currentUser._id]
                    }
                })
            } else {
                toast(data.message)
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
            const { data } = await api.post(`/api/post/comment`, {
                postId: post._id,
                content: commentContent.trim(),
            }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                toast.success("Comment added")
                // Prefer backend response; fallback to append locally
                if (data.post?.comment) {
                    setComments(data.post.comment)
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
            } else {
                toast.error(data.message || "Could not add comment")
            }
        } catch (err) {
            console.error("❌ Failed to post comment:", err);
            toast.error("Could not post comment. Try again.")
        } finally {
            setCommentLoading(false)
        }
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/post/${post._id}`
        const shareText = post.content ? post.content.slice(0, 140) : 'Check out this post!'
        try {
            if (navigator.share) {
                await navigator.share({
                    title: post.user?.full_name || 'PingUp Post',
                    text: shareText,
                    url: shareUrl,
                })
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareUrl)
                toast.success('Link copied to clipboard')
            } else {
                toast.error('Sharing is not supported in this browser')
            }
        } catch (err) {
            console.error('Share failed:', err)
            toast.error('Could not share right now')
        }
    }
    const navigate = useNavigate();

    return (
        <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl'>
            {/* User Info */}
            <div className='flex items-center justify-between'>
                <div onClick={() => navigate('/profile/' + post.user._id)} className='inline-flex items-center gap-3 cursor-pointer flex-1'>
                    <img src={post.user.profile_picture || DEFAULT_PROFILE_PICTURE} className='w-10 h-10 rounded-full shadow' alt="" />
                    <div>
                        <div className='flex items-center space-x-1'>
                            <span>{post.user.full_name}</span>
                            <BadgeCheck className='w-4 h-4 text-blue-500' />
                        </div>
                        <div className='text-gray-500 text-sm'>@{post.user.username} . {moment(post.createdAt).fromNow()}</div>
                    </div>
                </div>
                {currentUser && currentUser._id !== post.user._id && (
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
            {/* content */}
            {post.content && <div className='text-gray-800 text-sm whitespace-pre-line' dangerouslySetInnerHTML={{ __html: postWithHashTag }} />}
            {/* images */}
            <div className='grid grid-cols-2 gap-2'>
                {post.image_urls && post.image_urls.map((img, index) => (
                    <img
                        src={img}
                        key={index}
                        onClick={() => setActiveImage(img)}
                        className={`w-full h-48 object-cover rounded-lg cursor-pointer transition hover:brightness-95 ${post.image_urls.length === 1 && 'col-span-2 h-auto'}`}
                        alt={`Post media ${index + 1}`}
                    />
                ))}
            </div>

            {/* Actions */}
            <div className='flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300'>
                <div className='flex items-center gap-1'>
                    <Heart className={`w-4 h-4 cursor-pointer ${isCurrentUserLiked() && 'text-red-500'}`} onClick={handleLike} />
                    <span>{likes.length}</span>
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
            {showComment && <div>
                <form className="w-full flex justify-between items-center border-b-2 border-b-gray-300 p-[10px]" onSubmit={handleComment} >
                    <input type="text" placeholder={"leave a comment"} className='outline-none  border-none flex-1' value={commentContent} onChange={(e) => setCommentContent(e.target.value)} />
                    <Button
                        type='submit'
                        variant='primary'
                        size='sm'
                        loading={commentLoading}
                    >
                        <SendHorizonal size={18} />
                    </Button>
                </form>

                <div className='flex flex-col gap-[10px]'>
                    {comments.map((com) => {
                        if (!com?.user) return null

                        const commentTime = com.createdAt
                            ? moment(com.createdAt).fromNow()
                            : moment(post.createdAt).fromNow()

                        const goToProfile = () => navigate(`/profile/${com.user._id}`)

                        return (
                            <div key={com._id} className='flex flex-col gap-[10px] border-b-2 p-[20px] border-b-gray-300'>
                                <div className="w-full flex justify-start items-center gap-[10px]">
                                    <div
                                        onClick={goToProfile}
                                        className='w-[40px] h-[40px] rounded-full overflow-hidden flex items-center justify-center cursor-pointer'
                                    >
                                        <img src={com.user.profile_picture || DEFAULT_PROFILE_PICTURE} alt={com.user.full_name || "User"} className='h-full w-full object-cover' />
                                    </div>

                                    <div className='flex flex-col'>
                                        <button onClick={goToProfile} className='text-[16px] font-semibold text-left cursor-pointer hover:underline'>
                                            {com.user.full_name || com.user.username}
                                        </button>
                                        <span className='text-sm text-gray-500'>{commentTime}</span>
                                    </div>
                                </div>
                                <div className='pl-[50px]'>{com.content}</div>
                            </div>
                        )
                    })}
                </div>
            </div>}

            {activeImage && (
                <div className='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4' onClick={() => setActiveImage(null)}>
                    <div className='relative max-w-5xl w-full max-h-[90vh] bg-black rounded-xl overflow-hidden' onClick={(e) => e.stopPropagation()}>
                        <button aria-label='Close image' onClick={() => setActiveImage(null)} className='absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow cursor-pointer'>
                            <X className='w-5 h-5' />
                        </button>
                        <img src={activeImage} alt='Expanded post media' className='w-full h-full object-contain bg-black' />
                    </div>
                </div>
            )}
        </div>
    )
}

export default PostCard