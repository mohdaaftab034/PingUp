import React, { useState } from 'react'
import { assets, dummyUserData, DEFAULT_PROFILE_PICTURE } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import MenuItems from './MenuItems'
import { CirclePlus, LogOut } from 'lucide-react'
import {useSelector} from 'react-redux'
import { useAuth } from '../context/AuthProvider.jsx'
import UploadOptionsModal from './UploadOptionsModal'
import UploadReelModal from './UploadReelModal'

const Sidebar = ({sidebarOpen, setSidebarOpen}) => {

    const user = useSelector((state)=> state.user.value)
    const {logout} = useAuth()
    const navigate = useNavigate()
    const [showUploadOptions, setShowUploadOptions] = useState(false)
    const [showReelUpload, setShowReelUpload] = useState(false)

  return (
    <div className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:fixed top-0 bottom-0 z-20 ${sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
        <div className='w-full'>
            <img onClick={()=> navigate('/')} src={assets.logo} className='w-26 ml-7 my-2 cursor-pointer' alt="" />
            <hr className='border-gray-300 mb-8'/>
            <MenuItems setSidebarOpen={setSidebarOpen}/>

            <button 
                onClick={() => setShowUploadOptions(true)}
                className='flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 transition text-white cursor-pointer w-auto'
            >
                <CirclePlus className='w-5 h-5 '/>
                Create
            </button>
        </div>
        <div className='w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between'>
            <div className='flex gap-2 items-center cursor-pointer'>
                {
                    user?.profile_picture ? (
                        <img src={user.profile_picture || DEFAULT_PROFILE_PICTURE} className='w-10 h-10 rounded-full shadow' alt="profile" />
                    ) : (
                        <div className='w-10 h-10 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center font-semibold shadow'>
                            {user?.full_name?.charAt(0) || '?'}
                        </div>
                    )
                }
                <div>
                    <h1 className='text-sm font-medium'>{user.full_name}</h1>
                    <p className='text-xs text-gray-500'>@{user.username}</p>
                </div>
            </div>
            <LogOut onClick={logout} className='w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer'/>
        </div>

        {/* Upload Options Modal */}
        {showUploadOptions && (
            <UploadOptionsModal 
                setShowModal={setShowUploadOptions}
                onReelUpload={() => setShowReelUpload(true)}
            />
        )}

        {/* Upload Reel Modal */}
        {showReelUpload && (
            <UploadReelModal 
                setShowModal={setShowReelUpload}
                onReelUploaded={() => {}}
            />
        )}
    </div>
  )
}

export default Sidebar