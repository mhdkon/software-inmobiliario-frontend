const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-inmobiliaria-19rx.onrender.com/api';

export const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No autenticado. Por favor, inicia sesión nuevamente.');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };
  
  const config = { ...options, headers };
  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }
  
  return response.json();
};

export const getImageUrl = (src) => {
  if (!src) return 'https://via.placeholder.com/400x200?text=Sin+imagen';
  if (src.startsWith('data:image')) return src;
  if (src.startsWith('/uploads/')) {
    const baseUrl = API_BASE.replace('/api', '');
    return `${baseUrl}${src}`;
  }
  if (src.startsWith('http')) return src;
  return 'https://via.placeholder.com/400x200?text=Sin+imagen';
};