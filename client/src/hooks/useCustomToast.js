import toast from 'react-hot-toast'
import Toast from '../components/Toast'

export const useCustomToast = () => {
  const showSuccess = (message) => {
    toast.custom((t) => (
      <Toast t={t} message={message} type="success" />
    ), {
      duration: 4000,
    })
  }

  const showError = (message) => {
    toast.custom((t) => (
      <Toast t={t} message={message} type="error" />
    ), {
      duration: 4000,
    })
  }

  const showInfo = (message) => {
    toast.custom((t) => (
      <Toast t={t} message={message} type="info" />
    ), {
      duration: 4000,
    })
  }

  return {
    success: showSuccess,
    error: showError,
    info: showInfo,
  }
}

export default useCustomToast
