import React from 'react'
import { dummyUserData, DEFAULT_PROFILE_PICTURE } from '../assets/assets'
import { MapPin, MessageCircle, Plus, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux'
import { useAuth } from '../context/AuthProvider.jsx';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { fetchUser } from '../features/user/userSlice';

const Usercart = ({user}) => {

    const currentUser = useSelector((state)=> state.user.value);
    const navigate = useNavigate();
    const {getToken}  = useAuth()
    const dispatch = useDispatch()

    const isConnected = () => {
        if (!currentUser || !currentUser.connections) return false
        return currentUser.connections.some(connId => connId && connId.toString() === user._id?.toString())
    }

    const isFollowing = currentUser?.following?.some(fId => fId && fId.toString() === user._id?.toString())
    const isSelf = currentUser?._id?.toString() === user._id?.toString()

    const handleFollow = async ()=> {
        try {
            const {data} = await api.post('/api/user/follow', {id: user._id}, {
                headers: {Authorization: `Bearer ${await getToken()}`}
            })

            if(data.success){
                toast.success(data.message)
                dispatch(fetchUser(await getToken()))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleConnectionRequest = async ()=> {
        if(isConnected()){
            return navigate('/messages/' + user._id)
        }
        try {
            const {data} = await api.post('/api/user/connect', {id: user._id}, {
                headers: {Authorization: `Bearer ${await getToken()}`}
            })

            if(data.success){
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

  return (
    <div key={user._id} className='p-3 sm:p-4 pt-4 sm:pt-6 flex flex-col justify-between w-full sm:w-80 shadow border border-gray-200 rounded-md'>
        <div className='text-center'>
            <img onClick={()=> navigate(`/profile/${user._id}`)}  src={user.profile_picture || DEFAULT_PROFILE_PICTURE} alt="" className='rounded-full cursor-pointer w-14 sm:w-16 shadow-md mx-auto' />
            <p onClick={()=> navigate(`/profile/${user._id}`)}  className='mt-3 sm:mt-4 font-semibold text-sm sm:text-base line-clamp-1'>{user.full_name}</p>
            {user.username && <p className='text-gray-500 cursor-pointer font-light text-xs sm:text-sm'>@{user.username}</p>}
            {user.bio && <p className='text-gray-600 mt-2 text-center text-xs sm:text-sm px-2 sm:px-4 line-clamp-2'>{user.bio}</p>}
        </div>

        <div className='flex flex-col gap-1.5 sm:gap-2 mt-3 sm:mt-4 text-[11px] sm:text-xs text-gray-600'>
            <div className='flex items-center justify-center gap-1 border border-gray-300 rounded-full px-2 sm:px-3 py-1'>
                <MapPin className='w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0'/> <span className='truncate'>{user.location}</span>
            </div>

            <div className='flex items-center justify-center gap-1 border border-gray-300 rounded-full px-2 sm:px-3 py-1'>
                <span>{user.followers.length}</span> <span className='hidden xs:inline'>Followers</span>
            </div>
        </div>
        
        <div className='flex mt-3 sm:mt-4 gap-1.5 sm:gap-2'>
            {/* Follow Button - hidden if already following or self */}
            {(!isFollowing && !isSelf) && (
                <button onClick={handleFollow} className='flex-1 py-1.5 sm:py-2 rounded-md flex justify-center items-center gap-1 sm:gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer text-xs sm:text-sm'>
                    <UserPlus className='w-3 sm:w-4 h-3 sm:h-4'/> <span className='hidden xs:inline'>Follow</span>
                </button>
            )}

            {/* Connection Request button - hidden if already connected or self */}
            {(!isConnected() && !isSelf) && (
                <button onClick={handleConnectionRequest} className='flex items-center justify-center py-1.5 sm:py-2 px-2 sm:px-3 border border-gray-300 text-slate-500 group rounded-md cursor-pointer active:scale-95 transition hover:bg-slate-50'>
                    <Plus className='w-4 sm:w-5 h-4 sm:h-5 group-hover:scale-105 transition'/>
                </button>
            )}
        </div>
    </div>
  )
}

export default Usercart