import React, { act, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Eye } from 'lucide-react'
import Loading from '../components/Loading';
import UserProfileInfo from '../components/UserProfileInfo';
import PostCard from '../components/PostCard';
import moment from 'moment';
import ProfileModel from '../components/ProfileModel';
import { useAuth } from '../context/AuthProvider.jsx';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux'
import api from '../api/axios.js';

const Profile = () => {

  const { getToken } = useAuth()
  const { profileId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [showEdit, setShowEdit] = useState(false);
  const currentUser = useSelector((state) => state.user.value)

  const fetchUser = async (profileId) => {
    try {
      setLoading(true)
      const token = await getToken()
      const { data } = await api.post(`/api/user/profiles`, { profileId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        setUser(data.profile)
        setPosts(data.posts)
        setReels(data.reels || [])
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profileId) {
      fetchUser(profileId)
    } else {
      fetchUser(currentUser._id)
    }
  }, [profileId, currentUser])

  return !loading ? (
    user ? (
      <div className='relative h-full overflow-y-scroll bg-gray-50 p-3 sm:p-6'>
        <div className='max-w-4xl mx-auto'>
          {/* Profile Card */}
          <div className='bg-white rounded-2xl shadow overflow-hidden'>
            {/* Cover Photo */}
            <div className='h-32 sm:h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200'>
              {user.cover_photo && <img src={user.cover_photo} alt='' className='w-full h-full object-cover' />}
            </div>
            {/* User Info */}
            <UserProfileInfo user={user} posts={posts} profileId={profileId} setShowEdit={setShowEdit} />
          </div>
          {/* Tabs  */}
          <div className="mt-4 sm:mt-6">
            <div className="bg-white rounded-xl shadow p-1 flex flex-wrap sm:flex-nowrap gap-1 sm:gap-0 sm:max-w-md mx-auto">
              {["posts", "media", "reels"].map((tab) => (
                <button onClick={() => setActiveTab(tab)} key={tab} className={`flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === tab ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            {/* Posts  */}
            {activeTab === 'posts' && (
              <div className='mt-4 sm:mt-6 flex flex-col items-center gap-4 sm:gap-6'>
                {posts.length > 0 ? posts.map((post) => <PostCard key={post._id} post={post} />) : (
                  <div className='text-center py-10'>
                    <p className='text-gray-500'>No posts yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Media  */}
            {activeTab === 'media' && (
              <div className='flex flex-wrap gap-1 sm:gap-2 mt-4 sm:mt-6'>
                {
                  posts.filter((post) => post.image_urls.length > 0).map((post) => (
                    <>
                      {
                        post.image_urls.map((image, index) => (
                          <Link target='_blank' to={image} key={index} className='relative group'>
                            <img src={image} key={index} className='w-24 sm:w-40 md:w-48 lg:w-64 aspect-video object-cover rounded' alt="" />
                            <p className='absolute bottom-0 right-0 text-xs p-1 px-2 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300 rounded'>Posted {moment(post.createdAt).fromNow()}</p>
                          </Link>
                        ))
                      }
                    </>
                  ))
                }
              </div>
            )}

            {/* Reels  */}
            {activeTab === 'reels' && (
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-2 md:gap-3 mt-4 sm:mt-6'>
                {
                  reels.length > 0 ? (
                    reels.map((reel) => (
                      <Link to={`/reels/${reel._id}`} key={reel._id} className='relative group aspect-[9/16] rounded-lg overflow-hidden cursor-pointer bg-gray-100'>
                        <video src={reel.video_url} className='w-full h-full object-cover' />
                        <div className='absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60'>
                          <div className='absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2'>
                            <p className='text-white text-xs line-clamp-2 mb-1 hidden sm:block'>
                              {reel.caption || 'No caption'}
                            </p>
                            <div className='flex items-center gap-1 text-white text-xs'>
                              <Eye className='w-3 h-3' />
                              <span>{reel.views_count || 0}</span>
                            </div>
                          </div>
                          <p className='absolute top-1 sm:top-2 right-1 sm:right-2 text-xs p-1 px-2 backdrop-blur-xl bg-black/50 text-white rounded opacity-0 group-hover:opacity-100 transition'>{moment(reel.createdAt).fromNow()}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className='col-span-2 sm:col-span-3 lg:col-span-4 xl:col-span-5 text-center py-10'>
                      <p className='text-gray-500'>No reels yet</p>
                    </div>
                  )
                }
              </div>
            )}
          </div>
        </div>
        {/* Edit profile model  */}
        {showEdit && <ProfileModel setShowEdit={setShowEdit} />}
      </div>
    ) : (
      <div className='text-center py-10'>
        <p className='text-gray-500 text-lg'>User profile not found.</p>
      </div>
    )
  ) : (
    <Loading />
  )
}

export default Profile