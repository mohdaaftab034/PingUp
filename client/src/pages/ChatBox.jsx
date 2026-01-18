import React, { useEffect, useRef, useState } from 'react'
import { dummyMessagesData, dummyUserData, DEFAULT_PROFILE_PICTURE } from '../assets/assets'
import { ImageIcon, SendHorizonal, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider.jsx';
import api from '../api/axios';
import { addMessages, fetchMessages, resetMessages } from '../features/messages/messagesSlice';
import toast from 'react-hot-toast';
import moment from 'moment';
import { formatMessageTime } from '../../lib/utils.js';

const ChatBox = () => {

  const { messages } = useSelector((state) => state.messages);
  const currentUser = useSelector((state) => state.user.value);
  const { userId } = useParams()
  const { getToken } = useAuth()
  const dispatch = useDispatch()
  const [text, setText] = useState('')
  const [user, setUser] = useState(null)
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [activeImage, setActiveImage] = useState(null)
  const messagesEndRef = useRef(null)

  const {connections} = useSelector((state) => state.connections)

  const fetchUserMessages = async () => {
    try {
      setLoading(true)
      const token = await getToken()

      dispatch(fetchMessages({ token, userId }))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    try {
      if (!text && !image) return;

      setSending(true)
      const token = await getToken()
      const formData = new FormData()

      formData.append('to_user_id', userId)
      formData.append('text', text)
      image && formData.append('image', image)

      const { data } = await api.post('/api/message/send', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setText('')
        setImage(null)
        dispatch(addMessages(data.message))
      } else {
        throw new Error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (connections.length > 0) {
      const user = connections.find(connection => connection._id === userId)
      setUser(user)
    }
  }, [connections, userId])

  useEffect(() => {
    fetchUserMessages()

    return () => {
      dispatch(resetMessages())
    }
  }, [userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return user ? (
    <div className='flex flex-col h-screen overflow-hidden max-sm:fixed max-sm:inset-0 max-sm:bg-white max-sm:pt-14 max-sm:pb-20 overflow-x-hidden'>
      <div className='flex items-center gap-2 p-2 md:px-10 xl:pl-24 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300'>
        <img src={user.profile_picture || DEFAULT_PROFILE_PICTURE} className='size-8 rounded-full' alt="" />
        <div>
          <p className='font-medium'>{user.full_name}</p>
          <p className='text-sm text-gray-500 -mt-1.5'>@{user.username}</p>
        </div>
      </div>
      <div className='flex-1 overflow-y-auto overflow-x-hidden p-5 md:px-10'>
        <div className='space-y-4 max-w-4xl mx-auto w-full'>
          {loading ? (
            // Skeleton loaders for messages
            Array(5).fill(0).map((_, i) => (
              <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 max-w-sm rounded-lg animate-pulse ${
                  i % 2 === 0 
                    ? 'bg-gray-300 rounded-br-none w-32 h-10' 
                    : 'bg-gray-200 rounded-bl-none w-40 h-10'
                }`}></div>
                <div className='h-3 bg-gray-200 rounded mt-1 w-16 animate-pulse'></div>
              </div>
            ))
          ) : (
            messages.toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((message, index) => {
              // Handle both cases: from_user_id as string or object
              const fromUserId = typeof message.from_user_id === 'object' ? message.from_user_id._id : message.from_user_id;
              const currentUserId = currentUser?._id;
              const isSentByCurrentUser = fromUserId?.toString() === currentUserId?.toString();
              
              return (
                <div key={index} className={`flex flex-col ${isSentByCurrentUser ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 text-sm max-w-sm rounded-lg shadow break-words ${
                    isSentByCurrentUser 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-none' 
                      : 'bg-gray-200 text-slate-800 rounded-bl-none'
                  }`}>
                    {
                      message.message_type === 'image' && (
                        <img 
                          src={message.media_url} 
                          alt="" 
                          className='w-full max-w-sm rounded-lg mb-1 cursor-pointer hover:brightness-95 transition'
                          onClick={() => {
                            const isUrl = message.text && /^https?:\/\//.test(message.text)
                            if (isUrl) {
                              window.open(message.text, '_blank')
                            } else {
                              setActiveImage(message.media_url)
                            }
                          }}
                        />
                      )
                    }
                    {message.text && <p>{message.text}</p>}
                  </div>
                  <p className={`text-gray-500 text-[12px] p-[3px] font-medium ${isSentByCurrentUser ? 'text-right' : 'text-left'}`}>{formatMessageTime(message.createdAt)}</p>
                </div>
              )
            })
          )}
          {sending && (
            <div className='flex flex-col items-end'>
              <div className='p-3 text-sm max-w-sm rounded-lg shadow bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-none flex items-center gap-2'>
                <span className='inline-flex'>
                  <span className='animate-bounce' style={{ animationDelay: '0s' }}>.</span>
                  <span className='animate-bounce' style={{ animationDelay: '0.2s' }}>.</span>
                  <span className='animate-bounce' style={{ animationDelay: '0.4s' }}>.</span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className='px-4'>
        <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5'>
          <input type="text" className='flex-1 outline-none text-slate-700' placeholder='Type a message...' name="" id="" onKeyDown={e =>e.key === 'Enter' && !sending && sendMessage()} onChange={(e) => setText(e.target.value)} value={text} disabled={sending} />
          <label htmlFor="image">
            {
              image ? <img src={URL.createObjectURL(image)} className='h-8 rounded' alt="" /> : <ImageIcon className={`size-7 cursor-pointer ${sending ? 'text-gray-300' : 'text-gray-400'}`} />
            }
            <input type="file" id='image' accept='image/*' hidden onChange={(e) => setImage(e.target.files[0])} disabled={sending} />
          </label>
          <button onClick={sendMessage} disabled={sending} className={`cursor-pointer p-2 rounded-full transition-all ${
            sending 
              ? 'bg-gray-300 text-gray-500' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 text-white'
          }`}>
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>

      {activeImage && (
        <div className='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4' onClick={() => setActiveImage(null)}>
          <div className='relative max-w-5xl w-full max-h-[90vh] bg-black rounded-xl overflow-hidden' onClick={(e) => e.stopPropagation()}>
            <button aria-label='Close image' onClick={() => setActiveImage(null)} className='absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow cursor-pointer'>
              <X className='w-5 h-5' />
            </button>
            <img src={activeImage} alt='Expanded chat image' className='w-full h-full object-contain bg-black' />
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className='flex items-center justify-center h-screen'>
      <div className='text-center'>
        <div className='w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto mb-4'></div>
        <p className='text-gray-500'>Loading chat...</p>
      </div>
    </div>
  )
}

export default ChatBox