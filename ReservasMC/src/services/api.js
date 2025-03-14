export const fetchWithToken = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No token found');
  }

  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // ignore
    }
    if (response.status === 403) {
      localStorage.removeItem('token');
      throw new Error('Token inválido o expirado');
    }
    throw new Error(errorData.message || `Error en la petición: ${response.status}`);
  }

  return response.json();
};
