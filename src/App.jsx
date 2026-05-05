import React, { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import './App.css';

// Servicios y utilidades
import { authFetch, getImageUrl } from './services/api';
import { provincesSpain, citiesByProvinceSpain, formatPrice } from './utils/constants';

// Componentes
import LoginView from './components/auth/LoginView';
import RegisterView from './components/auth/RegisterView';
import UploadView from './components/properties/UploadView';
import PropertiesView from './components/properties/PropertiesView';
import DetailView from './components/properties/DetailView';
import AdminUsersView from './components/admin/AdminUsersView';
import LogoutConfirmModal from './components/common/LogoutConfirmModal';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState('login');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [filters, setFilters] = useState({
    province: '', city: '', propertyType: '', priceMin: '', priceMax: '',
    bedrooms: '', bathrooms: '', occupied: '', reo: ''
  });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [propertyForm, setPropertyForm] = useState({
    id: null, title: '', description: '', price: '', province: '', city: '', street: '',
    bedrooms: '', bathrooms: '', area: '', propertyType: 'casa', occupied: false, reo: false,
    lat: '', lng: '', images: [], imageFiles: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-inmobiliaria-19rx.onrender.com/api';

  useEffect(() => {
    setView('login');
  }, []);

  // ========================================================
  // API CALLS
  // ========================================================
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filters.province && { province: filters.province }),
        ...(filters.city && { city: filters.city }),
        ...(filters.propertyType && { propertytype: filters.propertyType }),
        ...(filters.priceMin && { priceMin: filters.priceMin }),
        ...(filters.priceMax && { priceMax: filters.priceMax }),
        ...(filters.bedrooms && { bedrooms: filters.bedrooms }),
        ...(filters.bathrooms && { bathrooms: filters.bathrooms }),
        ...(filters.occupied !== '' && { occupied: filters.occupied }),
        ...(filters.reo !== '' && { reo: filters.reo }),
      }).toString();
      
      const response = await fetch(`${API_BASE}/properties?${params}`);
      if (!response.ok) throw new Error('Error al cargar propiedades');
      const data = await response.json();
      
      const propertiesArray = Array.isArray(data) ? data : data.data || [];
      setProperties(propertiesArray);
      
      const itemsPerPage = 6;
      setTotalPages(Math.ceil(propertiesArray.length / itemsPerPage));
      setCurrentPage(1);
    } catch (error) {
      console.error('Error en fetchProperties:', error);
      toast.error(error.message);
      setProperties([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchFavorites = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await authFetch('/favorites');
      const favArray = Array.isArray(data) ? data : [];
      setFavorites(favArray.map(p => p.id));
    } catch (error) {
      console.error('Error al cargar favoritos:', error.message);
    }
  }, [currentUser]);

  const fetchUsers = useCallback(async () => {
    if (currentUser?.role !== 'admin') return;
    try {
      const data = await authFetch('/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    }
  }, [currentUser]);

  useEffect(() => {
    if (isLoggedIn && view === 'properties') {
      fetchProperties();
      fetchFavorites();
    }
  }, [isLoggedIn, view, filters, fetchProperties, fetchFavorites]);

  useEffect(() => {
    if (isLoggedIn && currentUser?.role === 'admin' && view === 'adminUsers') {
      fetchUsers();
    }
  }, [isLoggedIn, currentUser, view, fetchUsers]);

  // ========================================================
  // AUTENTICACIÓN
  // ========================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      const { token, user } = await response.json();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      setIsLoggedIn(true);
      setView('properties');
      setErrorMessage('');
      setLoginForm({ email: '', password: '' });
      toast.success(`Bienvenido ${user.name}`);
    } catch (error) {
      setErrorMessage(error.message);
      toast.error(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      toast.success('Registro exitoso. Ahora inicia sesión.');
      setView('login');
      setRegisterForm({ name: '', email: '', password: '' });
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
      toast.error(error.message);
    }
  };

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setFavorites([]);
    setView('login');
    setLoginForm({ email: '', password: '' });
    setShowLogoutConfirm(false);
    setProperties([]);
    setUsers([]);
    toast.success('Sesión cerrada correctamente');
  };
  const handleLogoutCancel = () => setShowLogoutConfirm(false);

  // ========================================================
  // MANEJO DE IMÁGENES (CORREGIDO)
  // ========================================================
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const currentImageCount = (propertyForm.images || []).length;
    if (currentImageCount + files.length > 10) {
      toast.error(`Máximo 10 imágenes. Ya tienes ${currentImageCount}`);
      return;
    }
    
    const toastId = toast.loading('Comprimiendo imágenes...', { duration: 0 });
    
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          const compressed = await imageCompression(file, options);
          return compressed;
        })
      );
      
      const base64Promises = compressedFiles.map(file => 
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      );
      const base64Images = await Promise.all(base64Promises);
      
      setPropertyForm(prev => ({ 
        ...prev, 
        images: [...(prev.images || []), ...base64Images],
        imageFiles: [...(prev.imageFiles || []), ...compressedFiles]
      }));
      
      toast.success(`${files.length} imagen(es) comprimida(s) y cargada(s)`, { id: toastId });
      e.target.value = '';
    } catch (error) {
      console.error('Error en handleImageUpload:', error);
      toast.error('Error al comprimir imágenes', { id: toastId });
    }
  };

  // Función mejorada para eliminar imagen (CORREGIDA para usar el endpoint DELETE)
  const removeImage = async (indexToRemove) => {
    const currentImages = [...propertyForm.images];
    const removedImage = currentImages[indexToRemove];
    
    // Determinar si la imagen es del servidor (ya guardada) o es nueva (base64 local)
    // Las imágenes del servidor suelen ser URLs absolutas (http/https) o relativas (uploads/...)
    const isServerImage = removedImage && 
      (removedImage.startsWith('http') || removedImage.startsWith('/uploads/') || removedImage.includes('cloudinary'));

    // Si es una imagen existente en el servidor y estamos editando una propiedad ya guardada
    if (isServerImage && isEditing && propertyForm.id) {
      try {
        // Llamar al endpoint DELETE del backend con el formato correcto: { imageUrl: "url" }
        await authFetch(`/properties/${propertyForm.id}/images`, {
          method: 'DELETE',
          body: JSON.stringify({ imageUrl: removedImage }) // ← clave corregida
        });
        
        // Actualizar estado local eliminando la imagen
        currentImages.splice(indexToRemove, 1);
        setPropertyForm(prev => ({
          ...prev,
          images: currentImages,
          imageFiles: prev.imageFiles // mantener las nuevas sin cambios
        }));
        toast.success('Imagen eliminada correctamente');
      } catch (error) {
        console.error('Error al eliminar imagen del servidor:', error);
        toast.error(error.message || 'Error al eliminar la imagen');
      }
    } else {
      // Es una imagen nueva (aún no subida al servidor) -> solo borrar del estado local
      setPropertyForm(prev => ({
        ...prev,
        images: prev.images.filter((_, idx) => idx !== indexToRemove),
        imageFiles: prev.imageFiles.filter((_, idx) => idx !== indexToRemove)
      }));
      toast.success('Imagen removida');
    }
  };

  const resetPropertyForm = () => {
    setPropertyForm({
      id: null, title: '', description: '', price: '', province: '', city: '', street: '',
      bedrooms: '', bathrooms: '', area: '', propertyType: 'casa', occupied: false, reo: false,
      lat: '', lng: '', images: [], imageFiles: []
    });
    setIsEditing(false);
  };

  // ========================================================
  // PROPIEDADES
  // ========================================================
  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('title', propertyForm.title);
    formData.append('description', propertyForm.description);
    formData.append('price', propertyForm.price);
    formData.append('province', propertyForm.province);
    formData.append('city', propertyForm.city);
    formData.append('street', propertyForm.street);
    formData.append('bedrooms', propertyForm.bedrooms);
    formData.append('bathrooms', propertyForm.bathrooms);
    formData.append('area', propertyForm.area);
    formData.append('propertytype', propertyForm.propertyType);
    formData.append('occupied', propertyForm.occupied);
    formData.append('reo', propertyForm.reo);
    formData.append('lat', propertyForm.lat || '0');
    formData.append('lng', propertyForm.lng || '0');
    
    // Enviar SOLO las imágenes nuevas (las que están en imageFiles)
    if (propertyForm.imageFiles && propertyForm.imageFiles.length > 0) {
      propertyForm.imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    }
    // Nota: Las imágenes existentes (ya en el servidor) NO se envían de nuevo.
    // Las eliminaciones ya se manejaron vía DELETE en removeImage.
    
    const token = localStorage.getItem('token');
    const url = isEditing ? `${API_BASE}/properties/${propertyForm.id}` : `${API_BASE}/properties`;
    const method = isEditing ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Error ${response.status}`);
      }
      
      toast.success(isEditing ? 'Propiedad actualizada' : 'Propiedad publicada');
      setView('properties');
      await fetchProperties();
      await fetchFavorites();
      resetPropertyForm();
    } catch (error) {
      console.error('Error en handlePropertySubmit:', error);
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const editProperty = (property) => {
    const images = typeof property.images === 'string' 
      ? JSON.parse(property.images || '[]')
      : (Array.isArray(property.images) ? property.images : []);
    
    setPropertyForm({
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      province: property.province,
      city: property.city,
      street: property.street,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      propertyType: property.propertytype || property.propertyType,
      occupied: property.occupied,
      reo: property.reo,
      lat: property.lat || '',
      lng: property.lng || '',
      images: images,
      imageFiles: []
    });
    setIsEditing(true);
    setView('upload');
  };

  const confirmDelete = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const deleteProperty = async () => {
    try {
      await authFetch(`/properties/${propertyToDelete.id}`, { method: 'DELETE' });
      toast.success('Propiedad eliminada');
      await fetchProperties();
      await fetchFavorites();
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleFavorite = async (e, propertyId) => {
    e.stopPropagation();
    const isFav = favorites.includes(propertyId);
    try {
      if (isFav) {
        await authFetch(`/favorites/${propertyId}`, { method: 'DELETE' });
        setFavorites(favorites.filter(id => id !== propertyId));
        toast.success('Eliminado de favoritos');
      } else {
        await authFetch(`/favorites/${propertyId}`, { method: 'POST' });
        setFavorites([...favorites, propertyId]);
        toast.success('Añadido a favoritos');
      }
    } catch (error) {
      if (error.message.includes('404') && isFav) {
        setFavorites(favorites.filter(id => id !== propertyId));
      } else {
        console.error('Error al actualizar favorito:', error);
      }
    }
  };

  const deleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      toast.error('No puedes eliminarte a ti mismo');
      return;
    }
    try {
      await authFetch(`/users/${userId}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== userId));
      toast.success('Usuario eliminado');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ========================================================
  // RENDER
  // ========================================================
  return (
    <div className="app">
      <Toaster position="top-right" reverseOrder={false} />
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo" onClick={() => isLoggedIn && setView('properties')}>CasaDirecta360</h1>
          {isLoggedIn && (
            <div className="nav-buttons">
              <button onClick={() => { resetPropertyForm(); setView('upload'); }} className="publish-btn">Publicar</button>
              {currentUser?.role === 'admin' && (
                <button onClick={() => setView('adminUsers')} className="admin-users-btn">Usuarios</button>
              )}
              <button onClick={handleLogoutClick} className="logout-btn">Salir</button>
            </div>
          )}
        </div>
      </nav>
      <main>
        {!isLoggedIn && view === 'login' && (
          <LoginView loginForm={loginForm} setLoginForm={setLoginForm} handleLogin={handleLogin} errorMessage={errorMessage} setView={setView} />
        )}
        {!isLoggedIn && view === 'register' && (
          <RegisterView registerForm={registerForm} setRegisterForm={setRegisterForm} handleRegister={handleRegister} errorMessage={errorMessage} setView={setView} />
        )}
        {isLoggedIn && view === 'upload' && (
          <UploadView
            propertyForm={propertyForm} setPropertyForm={setPropertyForm} handlePropertySubmit={handlePropertySubmit}
            isEditing={isEditing} isUploading={isUploading} handleImageUpload={handleImageUpload} removeImage={removeImage}
            resetPropertyForm={resetPropertyForm} setView={setView}
          />
        )}
        {isLoggedIn && view === 'properties' && (
          <PropertiesView
            filters={filters} setFilters={setFilters} properties={properties} loading={loading}
            currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages}
            favorites={favorites} toggleFavorite={toggleFavorite} setSelectedProperty={setSelectedProperty}
            setView={setView} currentUser={currentUser} editProperty={editProperty} confirmDelete={confirmDelete}
          />
        )}
        {isLoggedIn && view === 'detail' && selectedProperty && (
          <DetailView selectedProperty={selectedProperty} setView={setView} />
        )}
        {isLoggedIn && view === 'adminUsers' && currentUser?.role === 'admin' && (
          <AdminUsersView users={users} deleteUser={deleteUser} setView={setView} />
        )}
      </main>
      {showDeleteModal && propertyToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar propiedad?</h3>
            <p>¿Estás seguro de que quieres eliminar "{propertyToDelete.title}"?</p>
            <div className="modal-buttons">
              <button onClick={() => setShowDeleteModal(false)} className="btn-cancel">Cancelar</button>
              <button onClick={deleteProperty} className="btn-danger">Eliminar</button>
            </div>
          </div>
        </div>
      )}
      {showLogoutConfirm && (
        <LogoutConfirmModal onConfirm={handleLogoutConfirm} onCancel={handleLogoutCancel} />
      )}
    </div>
  );
}

export default App;