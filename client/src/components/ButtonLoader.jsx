import React from 'react'

const ButtonLoader = ({ size = 'sm', color = 'currentColor' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3 border-1.5',
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-3',
  }

  const loaderClass = sizeClasses[size] || sizeClasses.sm

  return (
    <div
      className={`${loaderClass} rounded-full border-transparent border-t-current animate-spin`}
      style={{ 
        color: color,
        borderTopColor: 'currentColor'
      }}
    ></div>
  )
}

export default ButtonLoader
