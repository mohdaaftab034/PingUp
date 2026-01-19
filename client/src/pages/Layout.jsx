import { Menu, X, MessageCircle, Home, Users, Search, UserIcon, Film, Plus } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar';
import UploadOptionsModal from '../components/UploadOptionsModal';
import UploadReelModal from '../components/UploadReelModal';
import { assets, dummyUserData } from '../assets/assets';
import Loading from '../components/Loading';
import {useSelector, useDispatch} from 'react-redux'
import { useAuth } from '../context/AuthProvider.jsx'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Layout = () => {

  const user = useSelector((state)=> state.user.value)
  const dispatch = useDispatch()
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showReelUpload, setShowReelUpload] = useState(false);
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isReelsPage = location.pathname === '/reels' || location.pathname.startsWith('/reels/')
  const isMessagesPage = location.pathname === '/messages' || location.pathname.startsWith('/messages/')

  // Poll for new connection request notifications
  useEffect(() => {
    let pollInterval;
    
    const pollNotifications = async () => {
      try {
        const token = await getToken()
        const { data } = await api.get('/api/user/notifications/pending', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (data.success && data.notifications && data.notifications.length > 0) {
          // Show toast notification for each pending connection
          data.notifications.forEach((notification) => {
            if (notification.from_user_id) {
              toast.success(
                `${notification.from_user_id.full_name} sent you a connection request!`,
                { duration: 5000 }
              )
            }
          })
        }
      } catch (error) {
        console.log('Error polling notifications:', error.message)
      }
    }

    // Poll every 10 seconds for new notifications
    pollInterval = setInterval(pollNotifications, 10000)

    // Also check on component mount
    if (user) {
      pollNotifications()
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [user, getToken])

  // Handle page navigation to pause all videos
  useEffect(() => {
    const pauseAllVideos = () => {
      const allVideos = document.querySelectorAll('video')
      allVideos.forEach(video => {
        video.muted = true
        video.pause()
        video.currentTime = 0
      })
    }

    // Pause videos when location changes
    pauseAllVideos()
  }, [location.pathname])

  return user ? (
    <div className='w-screen h-screen flex flex-col sm:flex-row overflow-hidden'>
      {!isReelsPage && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}
      <div className='flex-1 bg-slate-50 relative flex flex-col overflow-hidden'>
        {/* Top Navbar for Mobile */}
        {!isReelsPage && (
          <div className='sm:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 flex items-center justify-between px-3 py-2.5 shadow'>
            <img
              src={assets.logo}
              alt='PingUp logo'
              className='h-7 object-contain cursor-pointer'
              onClick={() => navigate('/')}
            />
            <div className='flex items-center gap-2'>
              <MessageCircle 
                className='p-1.5 bg-slate-100 rounded-md shadow w-8 h-8 text-gray-600 cursor-pointer text-sm' 
                onClick={() => navigate('/messages')} 
              />
              <button 
                className='flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-300 rounded-md shadow text-gray-700 hover:border-indigo-500 hover:bg-indigo-50 text-xs transition'
                onClick={() => setShowUploadOptions(true)}
              >
                <Plus className='w-4 h-4' />
                <span>Create</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navbar for Mobile */}
        {!isReelsPage && !isMessagesPage && (
          <div className='sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg'>
            <div className='flex items-center justify-around py-1.5'>
              <NavLink to='/' end className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`}>
                <Home className='w-5 h-5' />
              </NavLink>
              <NavLink to='/reels' className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`}>
                <Film className='w-5 h-5' />
              </NavLink>
            <NavLink to='/connections' className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`}>
              <Users className='w-5 h-5' />
            </NavLink>
            <NavLink to='/discover' className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`}>
              <Search className='w-5 h-5' />
            </NavLink>
            <NavLink to='/profile' className={({isActive}) => `flex flex-col items-center p-2 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`}>
              <UserIcon className='w-5 h-5' />
            </NavLink>
          </div>
        </div>
        )}

        <div className={`flex-1 overflow-y-auto ${isReelsPage ? '' : 'sm:pt-0 pt-12 sm:pb-0 pb-16'}`}>
          <Outlet/>
        </div>

        {showUploadOptions && (
          <UploadOptionsModal 
            setShowModal={setShowUploadOptions}
            onReelUpload={() => setShowReelUpload(true)}
          />
        )}

        {showReelUpload && (
          <UploadReelModal 
            setShowModal={setShowReelUpload}
            onReelUploaded={() => setShowUploadOptions(false)}
          />
        )}
      </div>
    </div>
  ) : (
    <Loading/>
  )
}

export default Layout