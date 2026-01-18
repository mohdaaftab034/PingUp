import { useState, useCallback } from 'react'

/**
 * Custom hook for managing button loading states
 * @param {Function} callback - The async function to execute
 * @param {Object} options - Optional configuration
 * @param {number} options.minDuration - Minimum duration to show loader (ms)
 * @param {Function} options.onSuccess - Callback on success
 * @param {Function} options.onError - Callback on error
 * @returns {Object} - { loading, handleClick }
 */
export const useButtonLoader = (
  callback,
  {
    minDuration = 300,
    onSuccess = null,
    onError = null,
  } = {}
) => {
  const [loading, setLoading] = useState(false)

  const handleClick = useCallback(
    async (e) => {
      if (loading) return

      setLoading(true)
      const startTime = Date.now()

      try {
        const result = await callback(e)
        
        // Ensure minimum loading duration for better UX
        const elapsed = Date.now() - startTime
        if (elapsed < minDuration) {
          await new Promise(resolve => 
            setTimeout(resolve, minDuration - elapsed)
          )
        }

        if (onSuccess) onSuccess(result)
        return result
      } catch (error) {
        if (onError) onError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [callback, loading, minDuration, onSuccess, onError]
  )

  return { loading, handleClick }
}
