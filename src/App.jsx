import React, { useState, useEffect, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

// ========================================================
// CONFIGURACIÓN DE LA API - USA VARIABLE DE ENTORNO
// ========================================================
const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-inmobiliaria-19rx.onrender.com/api';

const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const config = { ...options, headers };
  const response = await fetch(`${API_BASE}${endpoint}`, config);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }
  return response.json();
};

// ========================================================
// DATOS ESTÁTICOS DE ESPAÑA
// ========================================================
const provincesSpain = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'
];
const citiesByProvinceSpain = {
  'Madrid': ['Madrid', 'Alcalá de Henares', 'Móstoles', 'Getafe'],
  'Barcelona': ['Barcelona', 'Hospitalet de Llobregat', 'Badalona', 'Sabadell'],
  'Valencia': ['Valencia', 'Alicante', 'Elche', 'Castellón de la Plana'],
  'Sevilla': ['Sevilla', 'Dos Hermanas', 'Alcalá de Guadaíra'],
  'Zaragoza': ['Zaragoza', 'Utebo', 'Cuarte de Huerva'],
  'Málaga': ['Málaga', 'Marbella', 'Fuengirola', 'Torremolinos'],
  'Murcia': ['Murcia', 'Cartagena', 'Lorca'],
  'Palma': ['Palma de Mallorca', 'Manacor', 'Inca'],
  'Las Palmas': ['Las Palmas de Gran Canaria', 'Telde', 'Santa Lucía'],
  'Bilbao': ['Bilbao', 'Barakaldo', 'Getxo', 'Portugalete']
};

// ========================================================
// FUNCIÓN PARA OBTENER URL DE IMAGEN
// ========================================================
const getImageUrl = (src) => {
  if (!src) return 'https://via.placeholder.com/400x200?text=Sin+imagen';
  if (src.startsWith('data:image')) return src;
  if (src.startsWith('/uploads/')) {
    const baseUrl = API_BASE.replace('/api', '');
    return `${baseUrl}${src}`;
  }
  if (src.startsWith('http')) return src;
  return 'https://via.placeholder.com/400x200?text=Sin+imagen';
};

// ========================================================
// COMPONENTE DE MAPA GRATUITO CON IFRAME
// ========================================================
const MapaIframe = ({ lat, lng, direccion }) => {
  let mapSrc = '';
  if (lat && lng) {
    mapSrc = `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
  } else if (direccion) {
    const addressEncoded = encodeURIComponent(direccion);
    mapSrc = `https://www.google.com/maps?q=${addressEncoded}&output=embed`;
  } else {
    return <div className="map-placeholder">Ubicación no disponible</div>;
  }
  return (
    <div className="detail-map">
      <h3>Ubicación</h3>
      <iframe
        title="mapa"
        src={mapSrc}
        width="100%"
        height="300"
        style={{ border: 0, borderRadius: '8px' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};

// ========================================================
// MODAL DE CONFIRMACIÓN DE LOGOUT
// ========================================================
const LogoutConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal logout-modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Confirmar cierre de sesión</h3>
      </div>
      <div className="modal-body">
        <p>¿Estás seguro de que deseas cerrar sesión? Tendrás que iniciar sesión nuevamente para acceder.</p>
      </div>
      <div className="modal-buttons logout-buttons">
        <button onClick={onCancel} className="btn-cancel">Cancelar</button>
        <button onClick={onConfirm} className="btn-logout">Cerrar sesión</button>
      </div>
    </div>
  </div>
);

// ========================================================
// COMPONENTES DE VISTA
// ========================================================

const LoginView = ({ loginForm, setLoginForm, handleLogin, errorMessage, setView }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-animated">●</div>
          <h1 className="logo-text">CasaDirecta360</h1>
          <p className="logo-subtitle">La mejor plataforma de inmuebles</p>
        </div>

        <div className="login-form-section">
          <h2>Iniciar sesión</h2>
          <p className="login-description">Accede a tu cuenta para continuar</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className={`form-group-enhanced ${emailFocused ? 'focused' : ''} ${loginForm.email ? 'filled' : ''}`}>
              <div className="input-wrapper">
                <span className="input-icon">✓</span>
                <input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  className="input-field"
                />
                <label className="input-label">Email</label>
              </div>
              <div className="input-line"></div>
            </div>

            <div className={`form-group-enhanced ${passwordFocused ? 'focused' : ''} ${loginForm.password ? 'filled' : ''}`}>
              <div className="input-wrapper">
                <span className="input-icon">◆</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  className="input-field"
                />
                <label className="input-label">Contraseña</label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '●' : '○'}
                </button>
              </div>
              <div className="input-line"></div>
            </div>

            {errorMessage && (
              <div className="error-alert">
                <span className="error-icon">!</span>
                <p>{errorMessage}</p>
              </div>
            )}

            <button type="submit" className="login-button-enhanced">
              <span className="button-text">Iniciar sesión</span>
              <span className="button-icon">→</span>
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p>¿No tienes cuenta? <button onClick={() => setView('register')} className="link-button-enhanced">Regístrate aquí</button></p>
        </div>
      </div>
    </div>
  );
};

const RegisterView = ({ registerForm, setRegisterForm, handleRegister, errorMessage, setView }) => {
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-animated">●</div>
          <h1 className="logo-text">CasaDirecta360</h1>
          <p className="logo-subtitle">La mejor plataforma de inmuebles</p>
        </div>

        <div className="login-form-section">
          <h2>Crear cuenta</h2>
          <p className="login-description">Únete a nuestra comunidad inmobiliaria</p>

          <form onSubmit={handleRegister} className="login-form">
            <div className={`form-group-enhanced ${nameFocused ? 'focused' : ''} ${registerForm.name ? 'filled' : ''}`}>
              <div className="input-wrapper">
                <span className="input-icon">▪</span>
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  required
                  className="input-field"
                />
                <label className="input-label">Nombre</label>
              </div>
              <div className="input-line"></div>
            </div>

            <div className={`form-group-enhanced ${emailFocused ? 'focused' : ''} ${registerForm.email ? 'filled' : ''}`}>
              <div className="input-wrapper">
                <span className="input-icon">✓</span>
                <input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  className="input-field"
                />
                <label className="input-label">Email</label>
              </div>
              <div className="input-line"></div>
            </div>

            <div className={`form-group-enhanced ${passwordFocused ? 'focused' : ''} ${registerForm.password ? 'filled' : ''}`}>
              <div className="input-wrapper">
                <span className="input-icon">◆</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  minLength="6"
                  className="input-field"
                />
                <label className="input-label">Contraseña</label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '●' : '○'}
                </button>
              </div>
              <div className="input-line"></div>
            </div>

            {errorMessage && (
              <div className="error-alert">
                <span className="error-icon">!</span>
                <p>{errorMessage}</p>
              </div>
            )}

            <button type="submit" className="login-button-enhanced">
              <span className="button-text">Registrarse</span>
              <span className="button-icon">→</span>
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p>¿Ya tienes cuenta? <button onClick={() => setView('login')} className="link-button-enhanced">Inicia sesión aquí</button></p>
        </div>
      </div>
    </div>
  );
};

const UploadView = ({
  propertyForm, setPropertyForm, handlePropertySubmit, isEditing, isUploading,
  handleImageUpload, removeImage, resetPropertyForm, setView, provincesSpain, citiesByProvinceSpain
}) => (
  <div className="upload-container">
    <h2>{isEditing ? 'Editar propiedad' : 'Publicar propiedad'}</h2>
    <form onSubmit={handlePropertySubmit}>
      <div className="form-group">
        <label>Título *</label>
        <input type="text" placeholder="Ej: Casa moderna en Madrid" value={propertyForm.title} onChange={(e) => setPropertyForm({...propertyForm, title: e.target.value})} required />
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <textarea placeholder="Describe la propiedad..." value={propertyForm.description} onChange={(e) => setPropertyForm({...propertyForm, description: e.target.value})} required rows="4" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Provincia *</label>
          <select value={propertyForm.province} onChange={(e) => setPropertyForm({...propertyForm, province: e.target.value, city: ''})} required>
            <option value="">Selecciona provincia</option>
            {provincesSpain.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Ciudad *</label>
          <select value={propertyForm.city} onChange={(e) => setPropertyForm({...propertyForm, city: e.target.value})} required disabled={!propertyForm.province}>
            <option value="">Selecciona ciudad</option>
            {propertyForm.province && citiesByProvinceSpain[propertyForm.province]?.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Calle y número *</label>
        <input type="text" placeholder="Ej: Gran Vía 25" value={propertyForm.street} onChange={(e) => setPropertyForm({...propertyForm, street: e.target.value})} required />
      </div>
      <div className="form-row">
        <div className="form-group"><label>Tipo</label><select value={propertyForm.propertyType} onChange={(e) => setPropertyForm({...propertyForm, propertyType: e.target.value})}><option value="casa">Casa</option><option value="piso">Piso</option><option value="ático">Ático</option><option value="estudio">Estudio</option><option value="loft">Loft</option><option value="local">Local</option><option value="garaje">Plaza de garaje</option></select></div>
        <div className="form-group"><label>Precio (€) *</label><input type="number" placeholder="250000" value={propertyForm.price} onChange={(e) => setPropertyForm({...propertyForm, price: e.target.value})} required /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Área (m²)</label><input type="number" placeholder="120" value={propertyForm.area} onChange={(e) => setPropertyForm({...propertyForm, area: e.target.value})} required /></div>
        <div className="form-group"><label>Habitaciones</label><input type="number" placeholder="3" value={propertyForm.bedrooms} onChange={(e) => setPropertyForm({...propertyForm, bedrooms: e.target.value})} required /></div>
        <div className="form-group"><label>Baños</label><input type="number" placeholder="2" value={propertyForm.bathrooms} onChange={(e) => setPropertyForm({...propertyForm, bathrooms: e.target.value})} required /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>¿Ocupado?</label><select value={propertyForm.occupied} onChange={(e) => setPropertyForm({...propertyForm, occupied: e.target.value === 'true'})}><option value={false}>No</option><option value={true}>Sí</option></select></div>
        <div className="form-group"><label>¿REO?</label><select value={propertyForm.reo} onChange={(e) => setPropertyForm({...propertyForm, reo: e.target.value === 'true'})}><option value={false}>No</option><option value={true}>Sí</option></select></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Latitud (opcional)</label><input type="number" step="any" placeholder="40.4168" value={propertyForm.lat} onChange={(e) => setPropertyForm({...propertyForm, lat: e.target.value})} /></div>
        <div className="form-group"><label>Longitud (opcional)</label><input type="number" step="any" placeholder="-3.7038" value={propertyForm.lng} onChange={(e) => setPropertyForm({...propertyForm, lng: e.target.value})} /></div>
      </div>
      <div className="form-group">
        <label>Fotos (máximo 10 imágenes)</label>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleImageUpload} 
          className="file-input" 
          disabled={isUploading || (propertyForm.images && propertyForm.images.length >= 10)}
        />
        {isUploading && <p className="upload-status">Subiendo imágenes...</p>}
        {propertyForm.images && propertyForm.images.length > 0 && (
          <div className="image-preview">
            <p>✅ Imágenes cargadas: {propertyForm.images.length}/10</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
              {propertyForm.images.map((url, idx) => (
                <div key={idx} className="image-preview-item" style={{ position: 'relative' }}>
                  <img src={getImageUrl(url)} alt={`preview-${idx}`} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                  <button type="button" onClick={() => removeImage(idx)} className="remove-image" style={{ position: 'absolute', top: '5px', right: '5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="form-actions">
        <button type="button" onClick={() => { resetPropertyForm(); setView('properties'); }} className="cancel-btn">Cancelar</button>
        <button type="submit" className="submit-btn" disabled={isUploading}>{isEditing ? 'Actualizar' : 'Publicar'}</button>
      </div>
    </form>
  </div>
);

const PropertiesView = ({
  filters, setFilters, properties, loading, currentPage, setCurrentPage, totalPages,
  favorites, toggleFavorite, setSelectedProperty, setView, currentUser, editProperty, confirmDelete,
  provincesSpain, citiesByProvinceSpain, formatPrice
}) => {
  const [showFilters, setShowFilters] = useState(false);
  
  const safeProperties = Array.isArray(properties) ? properties : [];
  const paginatedProperties = safeProperties.slice((currentPage - 1) * 6, currentPage * 6);
  
  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== false);
  
  return (
    <div className="properties-page">
      <div className="filters-section">
        <button 
          className="filters-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <span className="toggle-icon">{showFilters ? '▲' : '▼'}</span>
          <span>Filtros</span>
          {hasActiveFilters && <span className="filter-badge">●</span>}
        </button>
        
        {showFilters && (
          <div className="filters-grid">
            <div className="form-group">
              <label>Provincia</label>
              <select value={filters.province} onChange={(e) => setFilters({...filters, province: e.target.value, city: ''})}>
                <option value="">Todas</option>
                {provincesSpain.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Ciudad</label>
              <select value={filters.city} onChange={(e) => setFilters({...filters, city: e.target.value})} disabled={!filters.province}>
                <option value="">Todas</option>
                {filters.province && citiesByProvinceSpain[filters.province]?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select value={filters.propertyType} onChange={(e) => setFilters({...filters, propertyType: e.target.value})}>
                <option value="">Todos</option>
                <option value="casa">Casa</option>
                <option value="piso">Piso</option>
                <option value="ático">Ático</option>
                <option value="loft">Loft</option>
                <option value="local">Local</option>
                <option value="garaje">Garaje</option>
              </select>
            </div>
            <div className="form-group">
              <label>Precio min</label>
              <input type="number" value={filters.priceMin} onChange={(e) => setFilters({...filters, priceMin: e.target.value})} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Precio max</label>
              <input type="number" value={filters.priceMax} onChange={(e) => setFilters({...filters, priceMax: e.target.value})} placeholder="9999999" />
            </div>
            <div className="form-group">
              <label>Habitaciones</label>
              <input type="number" value={filters.bedrooms} onChange={(e) => setFilters({...filters, bedrooms: e.target.value})} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Baños</label>
              <input type="number" value={filters.bathrooms} onChange={(e) => setFilters({...filters, bathrooms: e.target.value})} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Ocupado</label>
              <select value={filters.occupied} onChange={(e) => setFilters({...filters, occupied: e.target.value})}>
                <option value="">Todos</option>
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>
            <div className="form-group">
              <label>REO</label>
              <select value={filters.reo} onChange={(e) => setFilters({...filters, reo: e.target.value})}>
                <option value="">Todos</option>
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </div>
            <div className="form-group">
              <button onClick={() => setFilters({province: '', city: '', propertyType: '', priceMin: '', priceMax: '', bedrooms: '', bathrooms: '', occupied: '', reo: ''})} className="reset-filters-btn">
                Limpiar todo
              </button>
            </div>
          </div>
        )}
        
        {loading && <p className="loading-text">Cargando propiedades...</p>}
        <div className="results-count">
          {safeProperties.length} propiedades encontradas
          {hasActiveFilters && (
            <button className="clear-filters-link" onClick={() => setFilters({province: '', city: '', propertyType: '', priceMin: '', priceMax: '', bedrooms: '', bathrooms: '', occupied: '', reo: ''})}>
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <div className="properties-grid">
        {paginatedProperties.length > 0 ? (
          paginatedProperties.map(property => (
            <div key={property.id} className="property-card" onClick={() => { setSelectedProperty(property); setView('detail'); }}>
              <div className="card-image">
                <img src={getImageUrl(property.images?.[0])} alt={property.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <button className={`favorite-btn ${favorites.includes(property.id) ? 'active' : ''}`} onClick={(e) => toggleFavorite(e, property.id)}>
                  {favorites.includes(property.id) ? '♥' : '♡'}
                </button>
                <span className="property-type">{property.propertyType}</span>
                {(currentUser?.role === 'admin' || currentUser?.id === property.user_id) && (
                  <div className="card-actions">
                    <button onClick={(e) => { e.stopPropagation(); editProperty(property); }} className="edit-btn">✎</button>
                    <button onClick={(e) => { e.stopPropagation(); confirmDelete(property); }} className="delete-btn">✕</button>
                  </div>
                )}
              </div>
              <div className="card-content">
                <h3>{property.title}</h3>
                <p className="location">{property.city}, {property.province}</p>
                <p className="price">{formatPrice(property.price)}</p>
                <div className="features">
                  <span>{property.bedrooms} hab</span>
                  <span>{property.bathrooms} baños</span>
                  <span>{property.area} m²</span>
                  {property.occupied && <span>Ocupado</span>}
                  {property.reo && <span>REO</span>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>No hay propiedades disponibles</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>Anterior</button>
          <span>Página {currentPage} de {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>Siguiente</button>
        </div>
      )}
    </div>
  );
};

// Componente de galería con carrusel (definido antes de DetailView)
const GalleryCarousel = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!images || images.length === 0) {
    return (
      <div className="gallery-carousel">
        <img src="https://via.placeholder.com/600x400?text=Sin+imagen" alt="placeholder" />
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="gallery-carousel">
      <div className="carousel-container">
        <img 
          src={getImageUrl(images[currentImageIndex])} 
          alt={`Imagen ${currentImageIndex + 1}`}
          className="carousel-image"
        />
        
        {images.length > 1 && (
          <>
            <button className="carousel-btn prev-btn" onClick={handlePrevious}>
              ❮
            </button>
            <button className="carousel-btn next-btn" onClick={handleNext}>
              ❯
            </button>
            
            <div className="carousel-indicators">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  className={`indicator ${idx === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  title={`Imagen ${idx + 1}`}
                />
              ))}
            </div>
            
            <div className="carousel-counter">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      
      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="carousel-thumbnails">
          {images.map((img, idx) => (
            <button
              key={idx}
              className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(idx)}
            >
              <img src={getImageUrl(img)} alt={`Thumb ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const DetailView = ({ selectedProperty, setView, formatPrice }) => {
  if (!selectedProperty) {
    return <div>Propiedad no encontrada</div>;
  }
  
  const direccion = `${selectedProperty.street}, ${selectedProperty.city}, ${selectedProperty.province}`;
  
  // Parsear imágenes si es string
  const images = typeof selectedProperty.images === 'string' 
    ? JSON.parse(selectedProperty.images || '[]')
    : (Array.isArray(selectedProperty.images) ? selectedProperty.images : []);
  
  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => setView('properties')}>← Volver</button>
      <div className="detail-content">
        <div className="detail-gallery">
          <GalleryCarousel images={images} />
        </div>
        <div className="detail-info">
          <h1>{selectedProperty.title}</h1>
          <p className="detail-location">{selectedProperty.street}, {selectedProperty.city}, {selectedProperty.province}</p>
          <p className="detail-price">{formatPrice(selectedProperty.price)}</p>
          <div className="detail-features">
            <div className="feature"><span className="feature-label">Habitaciones</span><span className="feature-value">{selectedProperty.bedrooms}</span></div>
            <div className="feature"><span className="feature-label">Baños</span><span className="feature-value">{selectedProperty.bathrooms}</span></div>
            <div className="feature"><span className="feature-label">Superficie</span><span className="feature-value">{selectedProperty.area} m²</span></div>
            <div className="feature"><span className="feature-label">Ocupado</span><span className="feature-value">{selectedProperty.occupied ? 'Sí' : 'No'}</span></div>
            <div className="feature"><span className="feature-label">REO</span><span className="feature-value">{selectedProperty.reo ? 'Sí' : 'No'}</span></div>
          </div>
          <h3>Descripción</h3>
          <p className="detail-description">{selectedProperty.description}</p>
          <MapaIframe lat={selectedProperty.lat} lng={selectedProperty.lng} direccion={direccion} />
          <p className="detail-date">Publicado: {new Date(selectedProperty.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

const AdminUsersView = ({ users, deleteUser, setView }) => (
  <div className="admin-users-container">
    <h2>Gestión de usuarios</h2>
    <button className="back-btn" onClick={() => setView('properties')}>← Volver</button>
    <div className="users-table">
      <table>
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role === 'admin' ? 'Administrador' : 'Usuario'}</td>
              <td>{user.role !== 'admin' && <button onClick={() => deleteUser(user.id)} className="delete-user-btn">Eliminar</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ========================================================
// COMPONENTE PRINCIPAL App
// ========================================================
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
      console.error('Error en fetchFavorites:', error);
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
      toast.success(`Bienvenido ${user.name}`);
    } catch (error) {
      setErrorMessage(error.message);
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
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setFavorites([]);
    setView('login');
    setLoginForm({ email: '', password: '' });
    setShowLogoutConfirm(false);
    toast.success('Sesión cerrada correctamente');
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  // ========================================================
  // MANEJO DE IMÁGENES
  // ========================================================
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const currentImageCount = (propertyForm.images || []).length;
    if (currentImageCount + files.length > 10) {
      toast.error(`Máximo 10 imágenes. Ya tienes ${currentImageCount}`);
      return;
    }
    
    try {
      const base64Promises = files.map(file => 
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
        imageFiles: [...(prev.imageFiles || []), ...files]
      }));
      
      console.log(`✅ ${files.length} imagen(es) cargada(s)`);
      console.log(`   Total imágenes: ${currentImageCount + files.length}/10`);
      toast.success(`${files.length} imagen(es) cargada(s)`);
    } catch (error) {
      console.error('❌ Error en handleImageUpload:', error);
      toast.error('Error al cargar imágenes');
    }
  };

  const removeImage = (indexToRemove) => {
    setPropertyForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove),
      imageFiles: (prev.imageFiles || []).filter((_, idx) => idx !== indexToRemove)
    }));
    console.log(`🗑️ Imagen ${indexToRemove} eliminada`);
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
    
    console.log('📤 Iniciando envío de propiedad...');
    console.log(`   Imágenes en preview: ${propertyForm.images.length}`);
    console.log(`   Archivos reales: ${propertyForm.imageFiles.length}`);
    
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
    
    if (propertyForm.imageFiles && propertyForm.imageFiles.length > 0) {
      console.log(`📁 Añadiendo ${propertyForm.imageFiles.length} archivo(s) a FormData:`);
      propertyForm.imageFiles.forEach((file, idx) => {
        console.log(`   ${idx + 1}. ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        formData.append('images', file);
      });
    } else {
      console.warn('⚠️ ¡ATENCIÓN! No hay archivos para enviar');
    }
    
    const token = localStorage.getItem('token');
    const url = isEditing ? `${API_BASE}/properties/${propertyForm.id}` : `${API_BASE}/properties`;
    const method = isEditing ? 'PUT' : 'POST';
    
    try {
      console.log(`📤 Enviando ${method} a: ${url}`);
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Error del servidor:', error);
        throw new Error(error.error || `Error ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('✅ Respuesta del servidor:', responseData);
      
      if (responseData.images) {
        console.log(`📸 Imágenes subidas a Cloudinary:`);
        const imageArray = Array.isArray(responseData.images) ? responseData.images : JSON.parse(responseData.images || '[]');
        imageArray.forEach((url, idx) => {
          console.log(`   ${idx + 1}. ${url}`);
        });
      } else {
        console.warn('⚠️ No hay imágenes en la respuesta');
      }
      
      toast.success(isEditing ? 'Propiedad actualizada' : 'Propiedad publicada');
      setView('properties');
      fetchProperties();
      resetPropertyForm();
    } catch (error) {
      console.error('❌ Error en handlePropertySubmit:', error);
      toast.error(error.message);
    }
  };

  const editProperty = (property) => {
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
      images: property.images || [],
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
      fetchProperties();
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
      } else {
        await authFetch(`/favorites/${propertyId}`, { method: 'POST' });
        setFavorites([...favorites, propertyId]);
      }
    } catch (error) {
      toast.error(error.message);
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

  const formatPrice = (price) => {
    if (typeof price !== 'number') price = parseFloat(price);
    return `€${price.toLocaleString('es-ES')}`;
  };

  // ========================================================
  // RENDER
  // ========================================================
  return (
    <div className="app">
      <Toaster position="top-right" />
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
            resetPropertyForm={resetPropertyForm} setView={setView} provincesSpain={provincesSpain} citiesByProvinceSpain={citiesByProvinceSpain}
          />
        )}
        {isLoggedIn && view === 'properties' && (
          <PropertiesView
            filters={filters} setFilters={setFilters} properties={properties} loading={loading}
            currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages}
            favorites={favorites} toggleFavorite={toggleFavorite} setSelectedProperty={setSelectedProperty}
            setView={setView} currentUser={currentUser} editProperty={editProperty} confirmDelete={confirmDelete}
            provincesSpain={provincesSpain} citiesByProvinceSpain={citiesByProvinceSpain} formatPrice={formatPrice}
          />
        )}
        {isLoggedIn && view === 'detail' && selectedProperty && (
          <DetailView selectedProperty={selectedProperty} setView={setView} formatPrice={formatPrice} />
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
              <button onClick={() => setShowDeleteModal(false)}>Cancelar</button>
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