import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { Star, Mail, Lock, User, AtSign, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthProvider.jsx'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { setUser } from '../features/user/userSlice.js'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { useButtonLoader } from '../hooks/useButtonLoader'
import { motion, AnimatePresence } from 'framer-motion'

const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { login, register, user } = useAuth()

    const [mode, setMode] = useState('login')
    const [showPassword, setShowPassword] = useState(false)
    const [form, setForm] = useState({
        full_name: '',
        username: '',
        email: '',
        password: '',
    })

    useEffect(() => {
        if (user) navigate('/')
    }, [user, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleAuthSubmit = async (e) => {
        e.preventDefault()

        if (mode === 'register' && (!form.full_name || !form.username)) {
            toast.error('Please provide your name and username')
            throw new Error('Missing fields')
        }

        if (!form.email || !form.password) {
            toast.error('Email and password are required')
            throw new Error('Missing fields')
        }

        const action = mode === 'login' ? login(form.email, form.password) : register(form)
        const result = await action

        if (result.success) {
            dispatch(setUser(result.user))
            navigate('/')
        } else {
            throw new Error(result.message || 'Authentication failed')
        }
    }

    const { loading: authLoading, handleClick: handleSubmit } = useButtonLoader(
        handleAuthSubmit,
        {
            minDuration: 800, // Slightly longer for smooth feel
            onError: (error) => toast.error(error.message)
        }
    )

    // Animation Variants
    const slideUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }

    return (
        <div className='min-h-screen w-screen flex relative overflow-hidden bg-slate-900'>

            {/* --- Animated Background Gradient (CSS Only fallback if image fails) --- */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/30 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/20 blur-[120px] animate-pulse delay-1000" />
                {/* Overlay Image if present, otherwise gradient shows */}
                <img
                    src={assets.bgImage}
                    alt=""
                    className='absolute top-0 left-0 w-full h-full object-cover opacity-40 mix-blend-overlay'
                />
            </div>

            <div className="w-full flex flex-col md:flex-row z-10 relative min-h-screen">

                {/* --- Left Side: Brand Identity (Hidden on mobile) --- */}
                <div className='hidden md:flex flex-1 flex-col justify-center p-8 lg:p-16'>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={slideUp}
                        className="space-y-6 lg:space-y-8"
                    >
                        {/* Logo Area */}
                        <div className='flex items-center gap-3'>
                            <img src={assets.logo} alt="PingUp" className='h-10 w-10 object-contain' />
                            <span className="text-2xl font-bold text-white tracking-tight">PingUp.</span>
                        </div>

                        {/* Hero Text */}
                        <div>
                            <h1 className='text-3xl lg:text-5xl font-extrabold text-white leading-tight mb-4 lg:mb-6'>
                                Connect beyond <br />
                                <span className='text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400'>
                                    the timeline.
                                </span>
                            </h1>
                            <p className='text-sm lg:text-base text-slate-300 max-w-md leading-relaxed'>
                                Join the global community where conversations happen in real-time. Share your world, uncensored and unfiltered.
                            </p>
                        </div>

                        {/* Social Proof */}
                        <div className='flex items-center gap-3 lg:gap-4 pt-2 lg:pt-4'>
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-8 lg:w-10 h-8 lg:h-10 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="w-8 lg:w-10 h-8 lg:h-10 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-[10px] lg:text-xs font-bold text-white">
                                    +12k
                                </div>
                            </div>
                            <div className='flex flex-col'>
                                <div className='flex text-amber-400'>
                                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                </div>
                                <span className='text-xs text-slate-400 font-medium'>Trusted by developers</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* --- Right Side: Auth Form --- */}
                <div className='flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10'>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className='w-full max-w-[420px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 sm:p-8'
                    >
                        <div className='mb-6 sm:mb-8'>
                            <h2 className='text-2xl sm:text-3xl font-bold text-white mb-2'>
                                {mode === 'login' ? 'Welcome back' : 'Join PingUp'}
                            </h2>
                            <p className='text-xs sm:text-sm text-slate-400'>
                                {mode === 'login' ? 'Enter your credentials to access your account.' : 'Start your journey with us today.'}
                            </p>
                        </div>

                        <form className='space-y-4 sm:space-y-5' onSubmit={handleSubmit}>
                            <AnimatePresence mode='wait'>
                                {mode === 'register' && (
                                    <motion.div
                                        key="register-fields"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 sm:space-y-5 overflow-hidden"
                                    >
                                        <div className="group">
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                                <input
                                                    name='full_name'
                                                    value={form.full_name}
                                                    onChange={handleChange}
                                                    className='w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600'
                                                    placeholder='Full Name'
                                                />
                                            </div>
                                        </div>
                                        <div className="group">
                                            <div className="relative">
                                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                                <input
                                                    name='username'
                                                    value={form.username}
                                                    onChange={handleChange}
                                                    className='w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600'
                                                    placeholder='Username'
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="group">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        type='email'
                                        name='email'
                                        value={form.email}
                                        onChange={handleChange}
                                        className='w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600'
                                        placeholder='Email Address'
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name='password'
                                        value={form.password}
                                        onChange={handleChange}
                                        className='w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-10 pr-12 py-2.5 sm:py-3 text-sm sm:text-base outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600'
                                        placeholder='Password'
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {mode === 'login' && (
                                <div className='flex justify-end'>
                                    <a href="#" className='text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 transition-colors'>
                                        Forgot Password?
                                    </a>
                                </div>
                            )}

                            <div className="pt-1 sm:pt-2">
                                <Button
                                    type='submit'
                                    variant='primary'
                                    size='lg'
                                    loading={authLoading}
                                    className='w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 sm:py-3 rounded-xl text-sm sm:text-base shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]'
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                                        {!authLoading && <ArrowRight size={16} />}
                                    </span>
                                </Button>
                            </div>
                        </form>

                        {/* Toggle Mode */}
                        <div className='mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 text-center'>
                            <p className='text-xs sm:text-sm text-slate-400'>
                                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                                <button
                                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                    className='ml-2 text-white font-medium hover:text-indigo-300 underline underline-offset-4 transition-colors'
                                >
                                    {mode === 'login' ? 'Sign up' : 'Log in'}
                                </button>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default Login