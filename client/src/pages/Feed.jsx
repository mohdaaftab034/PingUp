import React, { useEffect, useState } from 'react'
import { assets, dummyPostsData } from '../assets/assets'
import Loading from '../components/Loading'
import Storiesbar from '../components/Storiesbar'
import PostCard from '../components/PostCard'
import RecentMessages from '../components/RecentMessages'
import { useAuth } from '../context/AuthProvider.jsx'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Feed = () => {

  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const {getToken} = useAuth()

  const fetchFeeds = async () => {
    try {
      setLoading(true)
      const {data} = await api.get('/api/post/feed', {headers: {
        Authorization: `Bearer ${await getToken()}`
      }})

      if(data.success){
        setFeeds(data.posts)
      } else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchFeeds()
  }, [])

  return (
    <div className='h-full overflow-y-scroll no-scrollbar py-10 flex items-start justify-center gap-8'>
      {/* stories and post list */}
      <div className='w-full max-w-2xl'>
        {!loading && <Storiesbar/>}
        <div className='p-4 space-y-6'>
          {!loading ? (
            feeds.length > 0 ? (
              feeds.map((post)=> (
                <PostCard key={post._id} post={post}/>
              ))
            ) : (
              <div className='text-center py-10'>
                <p className='text-gray-500 text-lg'>No posts yet. Start following people to see their posts!</p>
              </div>
            )
          ) : (
            // Skeleton loaders
            Array(3).fill(0).map((_, i) => (
              <div key={i} className='bg-white rounded-lg shadow p-4 space-y-3 animate-pulse'>
                <div className='flex gap-3'>
                  <div className='w-10 h-10 rounded-full bg-gray-200'></div>
                  <div className='flex-1'>
                    <div className='h-4 bg-gray-200 rounded w-32 mb-2'></div>
                    <div className='h-3 bg-gray-100 rounded w-20'></div>
                  </div>
                </div>
                <div className='h-4 bg-gray-200 rounded w-full'></div>
                <div className='h-4 bg-gray-200 rounded w-5/6'></div>
                <div className='h-40 bg-gray-200 rounded-lg'></div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* right sideBaer */}
      <div className='hidden lg:block sticky top-10 w-xs'>
        {!loading && (
          <>
            <div className='w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow'>
              <h3 className='text-slate-800 font-semibold'>Sponsored</h3>
              <img src={assets.sponsored_img} className='w-full h-auto rounded-md' alt="" />
              <p className='text-slate-600'>Email marketing</p>
              <p className='text-slate-400'>Supercharge your marketing with a powerful, easy-to-use platform built for results.</p>
            </div>
            <RecentMessages/>
          </>
        )}
      </div>
    </div>
  )
}

export default Feed