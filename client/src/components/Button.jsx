import React from 'react'
import ButtonLoader from './ButtonLoader'

const Button = ({
  children,
  onClick,
  loading = false,
  disabled = false,
  loaderSize = 'sm',
  loaderPosition = 'left',
  className = '',
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading

  // Base styles
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'

  // Variant styles
  const variantStyles = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition',
    danger: 'bg-red-500 hover:bg-red-600 active:scale-95 text-white shadow-md',
    outline: 'border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 active:scale-95',
    ghost: 'hover:bg-slate-100 text-slate-700 active:scale-95',
  }

  // Size styles
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant] || variantStyles.primary}
    ${sizeStyles[size] || sizeStyles.md}
    ${className}
  `

  const loaderColor = variant === 'primary' || variant === 'danger' ? 'white' : 'currentColor'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={combinedClassName}
      {...props}
    >
      {loading && loaderPosition === 'left' && (
        <ButtonLoader size={loaderSize} color={loaderColor} />
      )}
      <span>{children}</span>
      {loading && loaderPosition === 'right' && (
        <ButtonLoader size={loaderSize} color={loaderColor} />
      )}
    </button>
  )
}

export default Button
