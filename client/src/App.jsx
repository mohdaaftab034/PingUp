import React, { useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connection from './pages/Connection'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import Reels from './pages/Reels'
import Layout from './pages/Layout'
import toast, { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice'
import { fetchConnection } from './features/connections/connectionsSlice'
import { addMessages } from './features/messages/messagesSlice'
import Toast from './components/Toast'
import Notification from './components/Notification'
import { useAuth } from './context/AuthProvider.jsx'
import Loading from './components/Loading'

const App = () => {
  const {user, getToken, loading} = useAuth()
  const {pathname} = useLocation()
  const pathnameref = useRef(pathname)
  const dispatch = useDispatch()
  useEffect(()=> {
    const fetchData = async ()=> {
      if(user){
        const token = await getToken()
        dispatch(fetchUser(token))
        dispatch(fetchConnection(token))
      }
    }
    fetchData()
  }, [user, getToken, dispatch])

  useEffect(()=> {
    pathnameref.current = pathname
  }, [pathname])

  useEffect(()=> {
    if(user){
      const eventSource = new EventSource(import.meta.env.VITE_BASEURL + '/api/message/' + user._id)

      eventSource.onmessage = (event)=> {
        const message = JSON.parse(event.data)

        if(pathnameref.current === ('/messages/' + message.from_user_id._id)){
          dispatch(addMessages(message))
        } else {
          toast.custom((t)=> (
            <Notification t={t} message={message} />
          ), {position: "bottom-right"})
        }
      }
      return ()=> {
        eventSource.close()
      }
    }
  }, [user, dispatch])

  return (
    <>
    <Toaster 
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: '0',
        },
      }}
    />
      {loading ? <Loading/> : (
        <Routes>
          <Route path='/' element={ !user ? <Login/> : <Layout/>}>
              <Route index element={<Feed/>} />
              <Route path='reels' element={<Reels/>} />
              <Route path='messages' element={<Messages/>} />
              <Route path='messages/:userId' element={<ChatBox/>} />
              <Route path='connections' element={<Connection/>} />
              <Route path='discover' element={<Discover/>} />
              <Route path='profile' element={<Profile/>} />
              <Route path='profile/:profileId' element={<Profile/>} />
              <Route path='create-post' element={<CreatePost/>} />
          </Route>
        </Routes>
      )}
    </>
  )
}

export default App