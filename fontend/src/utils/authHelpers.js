// Utility to handle fetch with automatic token expiration redirect
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      
      // Redirect based on current path
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin')) {
        window.location.href = '/admin/login';
      } else if (currentPath.includes('/viewer')) {
        window.location.href = '/viewer/login';
      } else {
        window.location.href = '/login';
      }
      
      throw new Error('Session expired. Please login again.');
    }

    return response;
  } catch (error) {
    throw error;
  }
};

// Check if token is expired before making request
export const isTokenExpired = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return true;

  try {
    // Decode JWT token (simple base64 decode of payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    return true;
  }
};

// Redirect to appropriate login if token is expired
export const checkTokenAndRedirect = () => {
  if (isTokenExpired()) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    
    const currentPath = window.location.pathname;
    if (currentPath.includes('/admin')) {
      window.location.href = '/admin/login';
    } else if (currentPath.includes('/viewer')) {
      window.location.href = '/viewer/login';
    } else {
      window.location.href = '/login';
    }
    return true;
  }
  return false;
};
