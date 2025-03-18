/**
 * Storage Manager for handling authentication tokens
 * Supports multiple storage types: cookie, localStorage, sessionStorage
 */

// Set token in the specified storage
export const setToken = (token, storageType = 'cookie') => {
  switch (storageType) {
    case 'local':
      localStorage.setItem('token', token);
      break;
    case 'session':
      sessionStorage.setItem('token', token);
      break;
    case 'cookie':
      // Cookies are handled by the server
      break;
    default:
      console.warn(`Unsupported storage type: ${storageType}`);
  }
};

// Get token from the specified storage
export const getToken = (storageType = 'cookie') => {
  switch (storageType) {
    case 'local':
      return localStorage.getItem('token');
    case 'session':
      return sessionStorage.getItem('token');
    case 'cookie':
      // For cookie storage, we don't need to get the token manually
      // as it's automatically sent with requests
      return null;
    default:
      console.warn(`Unsupported storage type: ${storageType}`);
      return null;
  }
};

// Remove token from the specified storage
export const removeToken = (storageType = 'cookie') => {
  switch (storageType) {
    case 'local':
      localStorage.removeItem('token');
      break;
    case 'session':
      sessionStorage.removeItem('token');
      break;
    case 'cookie':
      // For cookie storage, we need to call the logout endpoint
      // which will clear the cookie on the server side
      break;
    default:
      console.warn(`Unsupported storage type: ${storageType}`);
  }
};

// Check if user is authenticated based on storage type
export const isAuthenticated = (storageType = 'cookie') => {
  switch (storageType) {
    case 'local':
      return !!localStorage.getItem('token');
    case 'session':
      return !!sessionStorage.getItem('token');
    case 'cookie':
      // For cookie storage, we need to check with the server
      // This will be handled by the auth context
      return null;
    default:
      console.warn(`Unsupported storage type: ${storageType}`);
      return false;
  }
};

// Parse token from URL query parameters (used for OAuth callbacks)
export const parseTokenFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    // Clean up URL by removing the token
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState({}, document.title, url.toString());
  }
  
  return token;
};