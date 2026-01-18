import React from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const Toast = ({ t, message, type = 'success' }) => {
  const icons = {
    success: <CheckCircle className='w-5 h-5 text-green-500 flex-shrink-0' />,
    error: <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0' />,
    info: <Info className='w-5 h-5 text-blue-500 flex-shrink-0' />,
  }

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  }

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  }

  return (
    <div
      className={`
        w-full max-w-md
        ${bgColors[type]} border border-solid
        rounded-lg shadow-lg
        p-4 flex items-start gap-3
        animate-in slide-in-from-top-5 duration-300
        backdrop-blur-sm bg-opacity-95
        hover:shadow-xl transition-shadow
      `}
    >
      <div className='pt-0.5'>
        {icons[type]}
      </div>
      <div className='flex-1 min-w-0'>
        <p className={`${textColors[type]} text-sm font-medium break-words`}>
          {message}
        </p>
      </div>
      <button
        onClick={() => {
          import('react-hot-toast').then(({ default: toast }) => {
            toast.dismiss(t.id)
          })
        }}
        className='text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 pt-0.5'
      >
        <X className='w-4 h-4' />
      </button>
    </div>
  )
}

export default Toast
