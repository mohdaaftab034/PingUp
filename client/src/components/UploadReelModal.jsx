import React, { useState } from 'react'
import { X, Upload } from 'lucide-react'
import { useAuth } from '../context/AuthProvider'
import api from '../api/axios'
import toast from 'react-hot-toast'
import Button from './Button'

const UploadReelModal = ({ setShowModal, onReelUploaded }) => {
    const [video, setVideo] = useState(null)
    const [videoPreview, setVideoPreview] = useState(null)
    const [caption, setCaption] = useState('')
    const [uploading, setUploading] = useState(false)
    const { getToken } = useAuth()

    const handleVideoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (!file.type.startsWith('video/')) {
                toast.error('Please select a video file')
                return
            }
            
            if (file.size > 100 * 1024 * 1024) { // 100MB limit
                toast.error('Video size should be less than 100MB')
                return
            }

            setVideo(file)
            setVideoPreview(URL.createObjectURL(file))
        }
    }

    const handleUpload = async () => {
        if (!video) {
            toast.error('Please select a video')
            return
        }

        try {
            setUploading(true)
            const formData = new FormData()
            formData.append('video', video)
            formData.append('caption', caption)

            const token = await getToken()
            const { data } = await api.post('/api/reel/create', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (data.success) {
                toast.success('Reel uploaded successfully!')
                setShowModal(false)
                if (onReelUploaded) {
                    onReelUploaded()
                }
            } else {
                toast.error(data.message || 'Failed to upload reel')
            }
        } catch (error) {
            toast.error('Failed to upload reel')
            console.log(error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
                <div className='p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10'>
                    <h2 className='text-2xl font-bold'>Upload Reel</h2>
                    <button 
                        onClick={() => setShowModal(false)}
                        className='p-2 hover:bg-gray-100 rounded-full transition'
                    >
                        <X className='w-6 h-6' />
                    </button>
                </div>

                <div className='p-6 space-y-6'>
                    {/* Video Upload */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Select Video *
                        </label>
                        {!videoPreview ? (
                            <label className='flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition'>
                                <Upload className='w-12 h-12 text-gray-400 mb-2' />
                                <span className='text-gray-500'>Click to upload video</span>
                                <span className='text-gray-400 text-sm mt-1'>Max size: 100MB</span>
                                <input
                                    type='file'
                                    accept='video/*'
                                    onChange={handleVideoChange}
                                    className='hidden'
                                />
                            </label>
                        ) : (
                            <div className='relative'>
                                <video
                                    src={videoPreview}
                                    controls
                                    className='w-full h-64 object-contain bg-black rounded-lg'
                                />
                                <button
                                    onClick={() => {
                                        setVideo(null)
                                        setVideoPreview(null)
                                    }}
                                    className='absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition'
                                >
                                    <X className='w-4 h-4' />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Caption */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Caption
                        </label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder='Write a caption for your reel...'
                            className='w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-indigo-500 transition resize-none'
                            rows={4}
                            maxLength={500}
                        />
                        <div className='text-right text-sm text-gray-500 mt-1'>
                            {caption.length}/500
                        </div>
                    </div>

                    {/* Upload Button */}
                    <Button
                        onClick={handleUpload}
                        loading={uploading}
                        disabled={!video || uploading}
                        variant='primary'
                        className='w-full'
                    >
                        {uploading ? 'Uploading...' : 'Upload Reel'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default UploadReelModal
