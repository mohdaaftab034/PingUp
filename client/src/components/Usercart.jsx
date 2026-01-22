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
    <div key={user._id} className='p-3 sm:p-4 md:p-5 pt-4 sm:pt-5 md:pt-6 flex flex-col justify-between w-full shadow-md hover:shadow-lg border border-gray-200 rounded-lg transition-all duration-300 bg-white'>
        <div className='text-center'>
            <img onClick={()=> navigate(`/profile/${user._id}`)}  src={user.profile_picture || DEFAULT_PROFILE_PICTURE} alt="" className='rounded-full cursor-pointer w-12 sm:w-14 md:w-16 shadow-md mx-auto hover:scale-105 transition-transform' />
            <p onClick={()=> navigate(`/profile/${user._id}`)}  className='mt-2 sm:mt-3 md:mt-4 font-semibold text-xs sm:text-sm md:text-base line-clamp-1 cursor-pointer hover:text-indigo-600 transition-colors'>{user.full_name}</p>
            {user.username && <p className='text-gray-500 cursor-pointer font-light text-[10px] sm:text-xs md:text-sm truncate px-2'>@{user.username}</p>}
            {user.bio && <p className='text-gray-600 mt-1 sm:mt-2 text-center text-[10px] sm:text-xs md:text-sm px-1 sm:px-2 md:px-3 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]'>{user.bio}</p>}
        </div>

        <div className='flex flex-col gap-1.5 sm:gap-2 mt-2 sm:mt-3 md:mt-4 text-[10px] sm:text-[11px] md:text-xs text-gray-600'>
            <div className='flex items-center justify-center gap-1 border border-gray-300 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-50'>
                <MapPin className='w-2.5 sm:w-3 md:w-4 h-2.5 sm:h-3 md:h-4 flex-shrink-0'/> <span className='truncate max-w-[120px] sm:max-w-full'>{user.location}</span>
            </div>

            <div className='flex items-center justify-center gap-1 border border-gray-300 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-50'>
                <span className='font-medium'>{user.followers.length}</span> <span>Followers</span>
            </div>
        </div>
        
        <div className='flex mt-2 sm:mt-3 md:mt-4 gap-1.5 sm:gap-2'>
            {/* Follow Button - hidden if already following or self */}
            {(!isFollowing && !isSelf) && (
                <button onClick={handleFollow} className='flex-1 py-1.5 sm:py-2 rounded-lg flex justify-center items-center gap-1 sm:gap-1.5 md:gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition-all text-white cursor-pointer text-[10px] sm:text-xs md:text-sm font-medium shadow-sm'>
                    <UserPlus className='w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4'/> <span>Follow</span>
                </button>
            )}

            {/* Connection Request button - hidden if already connected or self */}
            {(!isConnected() && !isSelf) && (
                <button onClick={handleConnectionRequest} className='flex items-center justify-center py-1.5 sm:py-2 px-2 sm:px-2.5 md:px-3 border border-gray-300 text-slate-500 group rounded-lg cursor-pointer active:scale-95 transition-all hover:bg-slate-50 hover:border-indigo-400 shadow-sm'>
                    <Plus className='w-3.5 sm:w-4 md:w-5 h-3.5 sm:h-4 md:h-5 group-hover:scale-110 transition-transform'/>
                </button>
            )}
        </div>
    </div>
  )
}

export default Usercart