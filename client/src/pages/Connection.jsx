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
      <div className='max-w-6xl mx-auto p-6'>
        {/* title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Connections</h1>
          <p className='text-slate-600'>Manage your network and discover new connections</p>
        </div>
        {/* Countes */}
        <div className='mb-8 flex flex-wrap gap-6'>
          {dataArray.map((item, index)=> (
            <div key={index} className={`flex flex-col items-center justify-center gap-1 border h-20 w-40 border-gray-200 bg-white shadow rounded-md transition-all ${loading ? 'animate-pulse bg-gray-100' : ''}`}>
              <b className={loading ? 'w-6 h-4 bg-gray-200 rounded' : ''}>{!loading && item.value.length}</b>
              <p className={`text-slate-600 ${loading ? 'w-16 h-3 bg-gray-200 rounded' : ''}`}>{!loading && item.label}</p>
            </div>
          ))}
        </div>
        {/* Tabs */}
        <div className='inline-flex flex-wrap items-center border border-gray-200 rounded-md p-1 bg-white shadow-sm'>
          {
            dataArray.map((tab)=> (
              <button onClick={()=> setCurrentTab(tab.label)} key={tab} className={`flex cursor-pointer items-center px-3 py-1 text-sm rounded-md transition-colors ${currentTab===tab.label ? "bg-white font-medium text-black" : "text-gray-500 hover:text-black"}`}>
                <tab.icon className='w-4 h-4' />
                <span className='ml-1'>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className='ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full'>{tab.count}</span>
                )}
              </button>
            ))
          }
        </div>

        {/* connections */}
        <div className='flex flex-wrap gap-6 mt-6'>
          {!loading ? (
            dataArray.find((item)=> item.label === currentTab).value.length > 0 ? (
              dataArray.find((item)=> item.label === currentTab).value.map((user)=> (
                <div key={user._id} className='w-full max-w-88 flex gap-5 p-6 cursor-pointer bg-white shadow rounded-md hover:shadow-lg transition-shadow'>
                  <img onClick={()=> navigate(`/profile/${user._id}`)} src={user.profile_picture || DEFAULT_PROFILE_PICTURE} className='rounded-full w-12 h-12 shadow-md mx-auto' alt="" />
                  <div className='flex-1'>
                    <p onClick={()=> navigate(`/profile/${user._id}`)}  className='font-medium cursor-pointer text-slate-700'>{user.full_name}</p>
                    <p className='text-slate-500'>@{user.username}</p>
                    <p className='text-sm text-gray-600'>{user.bio}</p>
                    <div className='flex max-sm:flex-col gap-2 mt-4'>
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
                <p className='text-gray-500 text-lg'>No {currentTab.toLowerCase()} yet</p>
              </div>
            )
          ) : (
            // Skeleton loaders
            Array(3).fill(0).map((_, i) => (
              <div key={i} className='w-full max-w-88 flex gap-5 p-6 bg-white shadow rounded-md animate-pulse'>
                <div className='rounded-full w-12 h-12 bg-gray-200 mx-auto flex-shrink-0'></div>
                <div className='flex-1'>
                  <div className='h-4 bg-gray-200 rounded w-32 mb-2'></div>
                  <div className='h-3 bg-gray-100 rounded w-20 mb-2'></div>
                  <div className='h-3 bg-gray-100 rounded w-full mb-3'></div>
                  <div className='flex max-sm:flex-col gap-2'>
                    <div className='w-full h-8 bg-gray-200 rounded'></div>
                    <div className='w-full h-8 bg-gray-200 rounded'></div>
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