import React, { useEffect, useState, useRef } from 'react'
import { dummyConnectionsData } from '../assets/assets';
import { Search } from 'lucide-react';
import Usercart from '../components/Usercart';
import Loading from '../components/Loading';
import api from '../api/axios';
import { useAuth } from '../context/AuthProvider.jsx';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { fetchUser } from '../features/user/userSlice';


const Discover = () => {

  const dispatch = useDispatch()
  const [input, setInput] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const {getToken} = useAuth()
  const debounceTimer = useRef(null);

  const handleSearch = async (searchInput)=> {
    try {
      if (!searchInput.trim()) {
        // Load recent users if search is cleared
        loadRecentUsers()
        return
      }
      setLoading(true)
      const {data} = await api.post('/api/user/discover', {input: searchInput}, {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })
      data.success ? setUsers(data.users) : toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentUsers = async () => {
    try {
      setLoading(true)
      const {data} = await api.get('/api/user/recent', {
        headers: {Authorization: `Bearer ${await getToken()}`}
      })
      data.success ? setUsers(data.users) : toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInput(value)
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    // Set new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      handleSearch(value)
    }, 300)
  }

  useEffect(()=> {
    getToken().then((token)=> {
      dispatch(fetchUser(token))
    })
    // Load recent users on mount
    loadRecentUsers()
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className='max-w-7xl mx-auto px-3 py-4 sm:p-6 lg:px-8'>
        {/* Title */}
        <div className='mb-4 sm:mb-6 lg:mb-8'>
          <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-1 sm:mb-2'>Discover People</h1>
          <p className='text-xs sm:text-sm md:text-base text-slate-600'>Connect with amazing people and grow your network</p>
        </div>
        {/* Search */}
        <div className='mb-4 sm:mb-6 lg:mb-8 shadow-md rounded-lg border border-slate-200/60 bg-white/80'>
          <div className='p-3 sm:p-4 md:p-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5'/>
              <input type="text" placeholder='Search people by name, username...' className='pl-9 sm:pl-10 md:pl-12 pr-3 py-2 sm:py-2.5 w-full border border-gray-300 rounded-md text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition' name="" id="" onChange={handleInputChange} value={input} />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <Loading height='60vh'/>
        ) : (
          <>
            {input && (
              <p className='text-slate-600 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base px-1'>Search results for "{input}"</p>
            )}
            {!input && (
              <p className='text-slate-600 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base px-1'>Recently joined users</p>
            )}
            <div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 xl:gap-6'>
              {users.length > 0 ? (
                users.map((user)=> (
                  <Usercart user={user} key={user._id}/>
                ))
              ) : (
                <div className='w-full text-center py-8 sm:py-10 col-span-full'>
                  <p className='text-gray-500 text-sm sm:text-base md:text-lg px-4'>{input ? 'No users found matching your search' : 'No users available at the moment'}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Discover