/**
 * User-friendly error messages for the app
 */

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: "Can't connect to server. Please check your internet connection.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  OFFLINE: "You're offline. Changes will be synced when you're back online.",
  
  // Authentication errors
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  UNAUTHORIZED: "You don't have permission to perform this action.",
  
  // Task errors
  TASK_NOT_FOUND: "Task not found. It may have been deleted.",
  TASK_UPDATE_FAILED: "Failed to update task. Please try again.",
  TASK_LOAD_FAILED: "Failed to load tasks. Pull down to refresh.",
  
  // Permission errors
  CAMERA_PERMISSION_DENIED: "Camera permission is required. Please enable it in Settings.",
  MICROPHONE_PERMISSION_DENIED: "Microphone permission is required. Please enable it in Settings.",
  LOCATION_PERMISSION_DENIED: "Location permission is required for check-in/out.",
  
  // Upload errors
  PHOTO_UPLOAD_FAILED: "Failed to upload photo. It will be uploaded when you're back online.",
  VOICE_UPLOAD_FAILED: "Failed to upload voice note. It will be uploaded when you're back online.",
  FILE_TOO_LARGE: "File is too large. Please choose a smaller file.",
  
  // Leave request errors
  LEAVE_REQUEST_FAILED: "Failed to submit leave request. Please try again.",
  LEAVE_DELETE_FAILED: "Failed to delete leave request. Please try again.",
  INVALID_DATE_RANGE: "End date must be after start date.",
  
  // Schedule errors
  SCHEDULE_LOAD_FAILED: "Failed to load schedule. Pull down to refresh.",
  
  // Profile errors
  CHECK_IN_FAILED: "Failed to check in. Please try again.",
  CHECK_OUT_FAILED: "Failed to check out. Please try again.",
  PROFILE_LOAD_FAILED: "Failed to load profile. Please try again.",
  
  // General errors
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  MAINTENANCE: "The app is under maintenance. Please try again later.",
};

/**
 * Get a user-friendly error message from an error object
 */
export const getErrorMessage = (error: any): string => {
  // Network errors
  if (error?.message?.includes('Network Error') || error?.code === 'ERR_NETWORK') {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT_ERROR;
  }
  
  // HTTP status codes
  const status = error?.response?.status;
  if (status) {
    switch (status) {
      case 401:
        return ERROR_MESSAGES.INVALID_CREDENTIALS;
      case 403:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return ERROR_MESSAGES.TASK_NOT_FOUND;
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        break;
    }
  }
  
  // Use error message if available and user-friendly
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message && !error.message.includes('Error:')) {
    return error.message;
  }
  
  // Default fallback
  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Get a specific error message for a context
 */
export const getContextualError = (context: string, error: any): string => {
  const contextErrors: { [key: string]: string } = {
    'task_load': ERROR_MESSAGES.TASK_LOAD_FAILED,
    'task_update': ERROR_MESSAGES.TASK_UPDATE_FAILED,
    'check_in': ERROR_MESSAGES.CHECK_IN_FAILED,
    'check_out': ERROR_MESSAGES.CHECK_OUT_FAILED,
    'photo_upload': ERROR_MESSAGES.PHOTO_UPLOAD_FAILED,
    'voice_upload': ERROR_MESSAGES.VOICE_UPLOAD_FAILED,
    'leave_request': ERROR_MESSAGES.LEAVE_REQUEST_FAILED,
    'leave_delete': ERROR_MESSAGES.LEAVE_DELETE_FAILED,
    'schedule_load': ERROR_MESSAGES.SCHEDULE_LOAD_FAILED,
    'profile_load': ERROR_MESSAGES.PROFILE_LOAD_FAILED,
  };
  
  // Return context-specific error if available
  if (contextErrors[context]) {
    return contextErrors[context];
  }
  
  // Otherwise, parse the error
  return getErrorMessage(error);
};
