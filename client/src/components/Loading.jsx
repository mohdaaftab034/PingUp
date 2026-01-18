import React from 'react'

const Loading = ({ height = '100vh', size = 'md', fullScreen = true }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  }

  const loaderClass = sizeClasses[size] || sizeClasses.md

  return (
    <div
      style={{ height: fullScreen ? height : undefined }}
      className={`flex items-center justify-center ${fullScreen ? 'h-screen' : ''}`}
    >
      <div className='flex flex-col items-center gap-4'>
        {/* Spinner */}
        <div
          className={`
            ${loaderClass}
            rounded-full
            border-purple-500
            border-t-transparent
            animate-spin
            shadow-lg
          `}
        ></div>
        {/* Loading text */}
        <p className='text-gray-500 text-sm font-medium tracking-wide'>Loading...</p>
      </div>
    </div>
  )
}

export default Loading