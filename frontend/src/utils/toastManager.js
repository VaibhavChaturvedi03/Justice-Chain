import toast from 'react-hot-toast';
import { playSuccessSound, playErrorSound, playNotificationSound } from './soundManager';

// Custom toast styles for JusticeChain
const toastStyles = {
  success: {
    style: {
      border: '1px solid #10B981',
      padding: '16px',
      color: '#065F46',
      backgroundColor: '#ECFDF5',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#10B981',
      secondary: '#ECFDF5',
    },
  },
  error: {
    style: {
      border: '1px solid #EF4444',
      padding: '16px',
      color: '#7F1D1D',
      backgroundColor: '#FEF2F2',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#EF4444',
      secondary: '#FEF2F2',
    },
  },
  info: {
    style: {
      border: '1px solid #3B82F6',
      padding: '16px',
      color: '#1E3A8A',
      backgroundColor: '#EFF6FF',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#3B82F6',
      secondary: '#EFF6FF',
    },
  },
  warning: {
    style: {
      border: '1px solid #F59E0B',
      padding: '16px',
      color: '#92400E',
      backgroundColor: '#FFFBEB',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#F59E0B',
      secondary: '#FFFBEB',
    },
  },
};

// Toast functions with sound effects
export const showSuccessToast = (message, options = {}) => {
  playSuccessSound();
  return toast.success(message, {
    ...toastStyles.success,
    duration: 4000,
    position: 'top-right',
    ...options,
  });
};

export const showErrorToast = (message, options = {}) => {
  playErrorSound();
  return toast.error(message, {
    ...toastStyles.error,
    duration: 5000,
    position: 'top-right',
    ...options,
  });
};

export const showInfoToast = (message, options = {}) => {
  playNotificationSound();
  return toast(message, {
    ...toastStyles.info,
    duration: 4000,
    position: 'top-right',
    icon: 'ℹ️',
    ...options,
  });
};

export const showWarningToast = (message, options = {}) => {
  playNotificationSound();
  return toast(message, {
    ...toastStyles.warning,
    duration: 5000,
    position: 'top-right',
    icon: '⚠️',
    ...options,
  });
};

// Loading toast with custom styling
export const showLoadingToast = (message = 'Processing...', options = {}) => {
  return toast.loading(message, {
    style: {
      border: '1px solid #6B7280',
      padding: '16px',
      color: '#374151',
      backgroundColor: '#F9FAFB',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#6B7280',
      secondary: '#F9FAFB',
    },
    position: 'top-right',
    ...options,
  });
};

// Promise toast for async operations
export const showPromiseToast = (promise, messages = {}) => {
  const defaultMessages = {
    loading: 'Processing...',
    success: 'Operation completed successfully!',
    error: 'An error occurred. Please try again.',
  };

  const finalMessages = { ...defaultMessages, ...messages };

  return toast.promise(
    promise,
    {
      loading: finalMessages.loading,
      success: (data) => {
        playSuccessSound();
        return finalMessages.success;
      },
      error: (err) => {
        playErrorSound();
        return finalMessages.error;
      },
    },
    {
      style: {
        minWidth: '250px',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      success: toastStyles.success,
      error: toastStyles.error,
      loading: {
        style: {
          border: '1px solid #6B7280',
          padding: '16px',
          color: '#374151',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
      },
      position: 'top-right',
    }
  );
};

// Custom toast for form validation
export const showValidationToast = (field, message) => {
  playErrorSound();
  return toast.error(`${field}: ${message}`, {
    ...toastStyles.error,
    duration: 4000,
    position: 'top-right',
    icon: '❌',
  });
};

// Custom toast for admin actions
export const showAdminToast = (message, type = 'info') => {
  const toastFunctions = {
    success: showSuccessToast,
    error: showErrorToast,
    info: showInfoToast,
    warning: showWarningToast,
  };

  return toastFunctions[type](`🏛️ Admin: ${message}`, {
    duration: 4000,
  });
};

// Custom toast for download actions
export const showDownloadToast = (fileName) => {
  playNotificationSound();
  return toast.success(`📄 Downloading ${fileName}...`, {
    ...toastStyles.success,
    duration: 3000,
    position: 'top-right',
  });
};

// Custom toast for login success
export const showLoginSuccessToast = (userType) => {
  playSuccessSound();
  const userTypeCapitalized = userType.charAt(0).toUpperCase() + userType.slice(1);
  return toast.success(`🔐 ${userTypeCapitalized} login successful!`, {
    ...toastStyles.success,
    duration: 4000,
    position: 'top-right',
  });
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Custom toast for contact form submission
export const showContactSuccessToast = (refNumber) => {
  playSuccessSound();
  return toast.success(`✅ Message sent successfully! Reference: ${refNumber}`, {
    ...toastStyles.success,
    duration: 6000,
    position: 'top-right',
  });
};

export default {
  success: showSuccessToast,
  error: showErrorToast,
  info: showInfoToast,
  warning: showWarningToast,
  loading: showLoadingToast,
  promise: showPromiseToast,
  validation: showValidationToast,
  admin: showAdminToast,
  download: showDownloadToast,
  loginSuccess: showLoginSuccessToast,
  contactSuccess: showContactSuccessToast,
  dismissAll: dismissAllToasts,
};