import React, { useEffect, useState } from 'react'
import { UsersIcon, UserPlus, UserCheck, UserRoundPen, MessageSquare, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '../context/AuthProvider.jsx'
import { fetchConnection } from '../features/connections/connectionsSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { DEFAULT_PROFILE_PICTURE } from '../assets/assets'
import Button from '../components/Button'
import { useButtonLoader } from '../hooks/useButtonLoader'

const Connection = () => {

  const [currentTab, setCurrentTab] = useState('Followers')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const navigate = useNavigate();
  const {getToken} = useAuth()
  const dispatch = useDispatch()
  const { connections, pendingConnections, followers, following} = useSelector((state)=> state.connections)

  const dataArray = [
    { label: 'Followers', value: followers, icon: Users },
    { label: 'Following', value: following, icon: UserCheck },
    { label: 'Pending', value: pendingConnections, icon: UserRoundPen },
    { label: 'Connections', value: connections, icon: UserPlus }
  ]

  const handleUnfollow = async (userId)=> {
    try {
      const {data} = await api.post('/api/user/unfollow', {id: userId}, {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })
      if(data.success){
        toast.success(data.message)
        dispatch(fetchConnection(await getToken()))
      } else{
        throw new Error(data.message)
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  const acceptConnection = async (userId)=> {
    try {
      const {data} = await api.post('/api/user/accept', {id: userId}, {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })
      if(data.success){
        toast.success(data.message)
        dispatch(fetchConnection(await getToken()))
      } else{
        throw new Error(data.message)
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  useEffect(()=> {
    getToken().then((token)=> {
      dispatch(fetchConnection(token))
      // Simulate loading
      setTimeout(() => setLoading(false), 300)
    })
  }, [])

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='max-w-6xl mx-auto p-3 sm:p-6'>
        {/* title */}
        <div className='mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2'>Connections</h1>
          <p className='text-sm sm:text-base text-slate-600'>Manage your network and discover new connections</p>
        </div>
        {/* Countes */}
        <div className='mb-6 sm:mb-8 flex flex-wrap gap-2 sm:gap-6 justify-start sm:justify-start'>
          {dataArray.map((item, index)=> (
            <div key={index} className={`flex flex-col items-center justify-center gap-1 border h-20 w-28 sm:w-40 border-gray-200 bg-white shadow rounded-md transition-all ${loading ? 'animate-pulse bg-gray-100' : ''}`}>
              <b className={loading ? 'w-6 h-4 bg-gray-200 rounded' : 'text-base sm:text-xl'}>{!loading && item.value.length}</b>
              <p className={`text-[11px] sm:text-sm text-slate-600 text-center px-1 ${loading ? 'w-14 h-3 bg-gray-200 rounded' : ''}`}>{!loading && item.label}</p>
            </div>
          ))}
        </div>
        {/* Tabs */}
        <div className='w-full flex flex-wrap items-center gap-1 border border-gray-200 rounded-md p-1 bg-white shadow-sm'>
          {
            dataArray.map((tab)=> (
              <button onClick={()=> setCurrentTab(tab.label)} key={tab} className={`flex flex-1 sm:flex-none cursor-pointer items-center justify-center sm:justify-start px-1 sm:px-3 py-2 text-[11px] sm:text-sm rounded-md transition-colors min-w-fit ${currentTab===tab.label ? "bg-indigo-600 font-medium text-white" : "text-gray-500 hover:text-black hover:bg-gray-100"}`}>
                <tab.icon className='w-3 sm:w-4 h-3 sm:h-4' />
                <span className='ml-1 hidden xs:inline text-[11px] sm:text-sm'>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className='ml-1 text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full'>{tab.count}</span>
                )}
              </button>
            ))
          }
        </div>

        {/* connections */}
        <div className='flex flex-col gap-3 sm:gap-4 mt-6'>
          {!loading ? (
            dataArray.find((item)=> item.label === currentTab).value.length > 0 ? (
              dataArray.find((item)=> item.label === currentTab).value.map((user)=> (
                <div key={user._id} className='w-full flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-6 cursor-pointer bg-white shadow rounded-md hover:shadow-lg transition-shadow'>
                  <img onClick={()=> navigate(`/profile/${user._id}`)} src={user.profile_picture || DEFAULT_PROFILE_PICTURE} className='rounded-full w-12 h-12 shadow-md mx-auto sm:mx-0 flex-shrink-0' alt="" />
                  <div className='flex-1 text-center sm:text-left'>
                    <p onClick={()=> navigate(`/profile/${user._id}`)}  className='font-medium cursor-pointer text-slate-700 text-xs sm:text-base line-clamp-1'>{user.full_name}</p>
                    <p className='text-slate-500 text-[11px] sm:text-sm line-clamp-1'>@{user.username}</p>
                    <p className='text-[11px] sm:text-sm text-gray-600 line-clamp-1 hidden sm:block'>{user.bio}</p>
                    <div className='flex flex-col sm:flex-row gap-1.5 sm:gap-2 mt-3 sm:mt-2'>
                      {
                        <Button 
                          variant='primary'
                          size='sm'
                          onClick={() => navigate(`/profile/${user._id}`)}
                        >
                          View Profile
                        </Button>
                      }
                      {
                        currentTab === 'Following' && (
                          <Button 
                            variant='secondary'
                            size='sm'
                            loading={actionLoading[user._id]}
                            onClick={async () => {
                              setActionLoading(prev => ({...prev, [user._id]: true}))
                              try {
                                await handleUnfollow(user._id)
                              } catch (error) {
                                toast.error(error.message)
                              } finally {
                                setActionLoading(prev => ({...prev, [user._id]: false}))
                              }
                            }}
                          >
                            Unfollow
                          </Button>
                        )
                      }
                      {
                        currentTab === 'Pending' && (
                          <Button 
                            variant='secondary'
                            size='sm'
                            loading={actionLoading[user._id]}
                            onClick={async () => {
                              setActionLoading(prev => ({...prev, [user._id]: true}))
                              try {
                                await acceptConnection(user._id)
                              } catch (error) {
                                toast.error(error.message)
                              } finally {
                                setActionLoading(prev => ({...prev, [user._id]: false}))
                              }
                            }}
                          >
                            Accept
                          </Button>
                        )
                      }
                      {
                        currentTab === 'Connections' && (
                          <Button 
                            variant='secondary'
                            size='sm'
                            onClick={() => navigate(`/messages/${user._id}`)}
                          >
                            <MessageSquare className='w-4 h-4'/>
                            Message
                          </Button>
                        )
                      }
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='w-full text-center py-10'>
                <p className='text-gray-500 text-base sm:text-lg'>No {currentTab.toLowerCase()} yet</p>
              </div>
            )
          ) : (
            // Skeleton loaders
            Array(3).fill(0).map((_, i) => (
              <div key={i} className='w-full flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-6 bg-white shadow rounded-md animate-pulse'>
                <div className='rounded-full w-12 h-12 bg-gray-200 mx-auto sm:mx-0 flex-shrink-0'></div>
                <div className='flex-1'>
                  <div className='h-3 sm:h-4 bg-gray-200 rounded w-28 mb-1.5 mx-auto sm:mx-0'></div>
                  <div className='h-2.5 bg-gray-100 rounded w-16 mb-2 mx-auto sm:mx-0'></div>
                  <div className='h-2.5 bg-gray-100 rounded w-full mb-2 hidden sm:block'></div>
                  <div className='flex flex-col sm:flex-row gap-1.5 sm:gap-2'>
                    <div className='w-full h-7 bg-gray-200 rounded'></div>
                    <div className='w-full h-7 bg-gray-200 rounded hidden sm:block'></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Connection