/**
 * API Configuration
 * This file centralizes all API endpoint configuration
 */

// Production backend URL (Render deployment)
const PRODUCTION_API_URL = 'https://farm-management-backend-j0g2.onrender.com/api';

// Development backend URL
const DEVELOPMENT_API_URL = 'http://localhost:5000/api';

/**
 * Get the API base URL based on environment
 * Priority:
 * 1. REACT_APP_API_URL environment variable
 * 2. Production URL if in production mode
 * 3. Development URL as fallback
 */
export const getApiBaseUrl = (): string => {
  // Check environment variable first
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Use production URL if NODE_ENV is production
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_API_URL;
  }

  // Default to development URL
  return DEVELOPMENT_API_URL;
};

// Export the API base URL
export const API_BASE_URL = getApiBaseUrl();

// Log the API URL being used (for debugging)
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', process.env.NODE_ENV);
