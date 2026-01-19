import React, { useState } from 'react'
import { dummyUserData, DEFAULT_PROFILE_PICTURE } from '../assets/assets'
import { Image, X } from 'lucide-react'
import toast from 'react-hot-toast'
import {useSelector} from 'react-redux'
import { useAuth } from '../context/AuthProvider.jsx'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { useButtonLoader } from '../hooks/useButtonLoader'

const CreatePost = () => {

  const navigate = useNavigate()

  const [content, setContent] = useState('')
  const [images, setImages] = useState([])

  const user = useSelector((state)=> state.user.value);
  const {getToken} = useAuth()
  
  const handlePostSubmit = async () => {
    if(!images.length && !content){
      throw new Error("Please add at least one image or text")
    }

    const postType = images.length && content ? 'text_with_image' : images.length ? 'image' : 'text'

    try {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('post_type', postType)
      images.map((image)=> {
        formData.append('images', image)
      })

      const {data} = await api.post('/api/post/add', formData, {headers: {
        Authorization: `Bearer ${await getToken()}`
      }})
      if(data.success){
        toast.success('Post published successfully!')
        navigate('/')
      } else{
        throw new Error(data.message)
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  const { loading, handleClick: handlePublish } = useButtonLoader(
    handlePostSubmit,
    {
      minDuration: 800,
      onError: (error) => toast.error(error.message)
    }
  )

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className='max-w-6xl mx-auto p-3 sm:p-6'>
        {/* Title  */}
        <div className='mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2'>Create Post</h1>
          <p className='text-sm sm:text-base text-slate-600'>Share your thoughts with the world</p>
        </div>

        {/* Form  */}
        <div className="max-w-2xl bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-md space-y-4">
          {/* Header */}
          <div className='flex items-center gap-3'>
            <img src={user.profile_picture || DEFAULT_PROFILE_PICTURE} className='w-10 sm:w-12 h-10 sm:h-12 rounded-full shadow' alt="" />
            <div className='min-w-0'>
              <h2 className='font-semibold text-sm sm:text-base truncate'>{user.full_name}</h2>
              <p className='text-xs sm:text-sm text-gray-500 truncate'>@{user.username}</p>
            </div>
          </div>
          {/* text area  */}
          <textarea className='w-full resize-none max-h-24 sm:max-h-32 mt-4 text-sm outline-none placeholder-gray-400 border border-gray-200 rounded-lg p-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200' placeholder="What's happening?" onChange={(e) => setContent(e.target.value)} value={content} />

          {/* images  */}
          {
            images.length > 0 && <div className='flex flex-wrap gap-2 mt-4'>
              {images.map((image, i) => (
                <div key={i} className='relative group'>
                  <img src={URL.createObjectURL(image) || ""} className='h-16 sm:h-20 rounded-md object-cover' alt="" />
                  <div onClick={() => setImages(images.filter((_, index) => index !== i))} className='absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer'>
                    <X className='w-5 sm:w-6 h-5 sm:h-6 text-white' />
                  </div>
                </div>
              ))}
            </div>
          }

          {/* Bottom bar  */}
          <div className='flex items-center justify-between pt-4 sm:pt-6 border-t border-gray-300'>
            <label htmlFor="images" className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer'>
              <Image className={`size-5 sm:size-6 ${loading ? 'opacity-50' : ''}`} />
              <span className='hidden sm:inline'>Add Photos</span>
            </label>

            <input type="file" name="" id="images" accept='image/*' hidden multiple onChange={(e) => setImages([...images, ...Array.from(e.target.files)])} disabled={loading} />

            <Button
              variant='primary'
              size='md'
              loading={loading}
              onClick={handlePublish}
              disabled={!images.length && !content}
              className='text-xs sm:text-sm'
            >
              Publish Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost