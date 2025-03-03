const API_URL = import.meta.env.VITE_API_URL;

export async function login(credentials) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error en el inicio de sesión');
  }

  return data;
}

export async function register(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Error en el registro');
  }

  return data;
}
