import React from 'react'
import { X, FileText, Film } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const UploadOptionsModal = ({ setShowModal, onReelUpload }) => {
    const navigate = useNavigate()

    const handlePostClick = () => {
        setShowModal(false)
        navigate('/create-post')
    }

    const handleReelClick = () => {
        setShowModal(false)
        onReelUpload()
    }

    return (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4' onClick={() => setShowModal(false)}>
            <div className='bg-white rounded-2xl max-w-md w-full p-6' onClick={(e) => e.stopPropagation()}>
                <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-xl font-bold'>Create</h2>
                    <button 
                        onClick={() => setShowModal(false)}
                        className='p-2 hover:bg-gray-100 rounded-full transition'
                    >
                        <X className='w-5 h-5' />
                    </button>
                </div>

                <div className='space-y-3'>
                    <button
                        onClick={handlePostClick}
                        className='w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition group'
                    >
                        <div className='w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition'>
                            <FileText className='w-6 h-6 text-indigo-600' />
                        </div>
                        <div className='text-left'>
                            <h3 className='font-semibold text-gray-900'>Create Post</h3>
                            <p className='text-sm text-gray-500'>Share photos and thoughts</p>
                        </div>
                    </button>

                    <button
                        onClick={handleReelClick}
                        className='w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition group'
                    >
                        <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition'>
                            <Film className='w-6 h-6 text-purple-600' />
                        </div>
                        <div className='text-left'>
                            <h3 className='font-semibold text-gray-900'>Create Reel</h3>
                            <p className='text-sm text-gray-500'>Upload short videos</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UploadOptionsModal
