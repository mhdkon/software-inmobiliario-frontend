import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage, responsive, placeholder } from '@cloudinary/react';
import toast, { Toaster } from 'react-hot-toast';
import './App.css'; // Asegúrate de importar el CSS

// Configuración de Cloudinary (opcional, si no la usas, las imágenes se guardan como blob)
const CLOUD_NAME = 'YOUR_CLOUD_NAME';
const UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET';
const cld = new Cloudinary({ cloud: { cloudName: CLOUD_NAME } });

// Fix para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
// COMPONENTES DE VISTA (fuera de App para evitar recreaciones)
// ========================================================

// LoginView
const LoginView = ({ loginForm, setLoginForm, handleLogin, errorMessage, setView }) => (
  <div className="login-container">
    <div className="login-card">
      <h1 className="logo">🏠 idealista</h1>
      <h2>Bienvenido</h2>
      <p>Inicia sesión o regístrate</p>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="email@ejemplo.com"
            value={loginForm.email}
            onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={loginForm.password}
            onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
            required
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit" className="login-button">Iniciar sesión</button>
      </form>
      <p className="register-link">¿No tienes cuenta? <button onClick={() => setView('register')} className="link-button">Regístrate</button></p>
      <div className="demo-box">
        <p><strong>Demo admin:</strong> admin@inmobiliaria.com / admin123</p>
        <p><strong>Demo usuario:</strong> usuario@ejemplo.com / 123456 (regístrate)</p>
      </div>
    </div>
  </div>
);

// RegisterView
const RegisterView = ({ registerForm, setRegisterForm, handleRegister, errorMessage, setView }) => (
  <div className="login-container">
    <div className="login-card">
      <h1 className="logo">🏠 idealista</h1>
      <h2>Crear cuenta</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={registerForm.name}
            onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="email@ejemplo.com"
            value={registerForm.email}
            onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={registerForm.password}
            onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
            required
            minLength="6"
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit" className="login-button">Registrarse</button>
      </form>
      <p className="register-link">¿Ya tienes cuenta? <button onClick={() => setView('login')} className="link-button">Inicia sesión</button></p>
    </div>
  </div>
);

// UploadView (formulario de subida/edición)
const UploadView = ({
  propertyForm, setPropertyForm, handlePropertySubmit, isEditing, isUploading,
  handleImageUpload, removeImage, resetPropertyForm, setView, provincesSpain, citiesByProvinceSpain
}) => (
  <div className="upload-container">
    <h2>{isEditing ? 'Editar propiedad' : 'Publicar propiedad'}</h2>
    <form onSubmit={handlePropertySubmit}>
      <div className="form-group">
        <label>Título *</label>
        <input
          type="text"
          placeholder="Ej: Casa moderna en Madrid"
          value={propertyForm.title}
          onChange={(e) => setPropertyForm({...propertyForm, title: e.target.value})}
          required
        />
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <textarea
          placeholder="Describe la propiedad..."
          value={propertyForm.description}
          onChange={(e) => setPropertyForm({...propertyForm, description: e.target.value})}
          required
          rows="4"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Provincia *</label>
          <select
            value={propertyForm.province}
            onChange={(e) => setPropertyForm({...propertyForm, province: e.target.value, city: ''})}
            required
          >
            <option value="">Selecciona provincia</option>
            {provincesSpain.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Ciudad *</label>
          <select
            value={propertyForm.city}
            onChange={(e) => setPropertyForm({...propertyForm, city: e.target.value})}
            required
            disabled={!propertyForm.province}
          >
            <option value="">Selecciona ciudad</option>
            {propertyForm.province && citiesByProvinceSpain[propertyForm.province]?.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Calle y número *</label>
        <input
          type="text"
          placeholder="Ej: Gran Vía 25"
          value={propertyForm.street}
          onChange={(e) => setPropertyForm({...propertyForm, street: e.target.value})}
          required
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Tipo de propiedad</label>
          <select
            value={propertyForm.propertyType}
            onChange={(e) => setPropertyForm({...propertyForm, propertyType: e.target.value})}
          >
            <option value="casa">Casa</option><option value="piso">Piso</option><option value="ático">Ático</option>
            <option value="estudio">Estudio</option><option value="loft">Loft</option><option value="local">Local</option>
            <option value="garaje">Plaza de garaje</option>
          </select>
        </div>
        <div className="form-group">
          <label>Precio (€) *</label>
          <input
            type="number"
            placeholder="250000"
            value={propertyForm.price}
            onChange={(e) => setPropertyForm({...propertyForm, price: e.target.value})}
            required
          />
        </div>
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
        <label>Fotos</label>
        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="file-input" disabled={isUploading} />
        {isUploading && <p className="upload-status">Subiendo imágenes...</p>}
        {propertyForm.images.length > 0 && (
          <div className="image-preview">
            {propertyForm.images.map((url, idx) => (
              <div key={idx} className="image-preview-item">
                <AdvancedImage cldImg={cld.image(url)} plugins={[responsive(), placeholder()]} />
                <button type="button" onClick={() => removeImage(idx)} className="remove-image">✕</button>
              </div>
            ))}
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

// PropertiesList
const PropertiesView = ({
  filters, setFilters, filteredProperties, currentPage, setCurrentPage, totalPages,
  favorites, toggleFavorite, setSelectedProperty, setView, currentUser, editProperty, confirmDelete,
  provincesSpain, citiesByProvinceSpain, formatPrice
}) => {
  const paginatedProperties = filteredProperties.slice((currentPage - 1) * 6, currentPage * 6);
  return (
    <div className="properties-page">
      <div className="filters-section">
        <h3>Filtros</h3>
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
              <option value="casa">Casa</option><option value="piso">Piso</option><option value="ático">Ático</option>
              <option value="loft">Loft</option><option value="local">Local</option><option value="garaje">Garaje</option>
            </select>
          </div>
          <div className="form-group"><label>Precio mínimo (€)</label><input type="number" value={filters.priceMin} onChange={(e) => setFilters({...filters, priceMin: e.target.value})} placeholder="0" /></div>
          <div className="form-group"><label>Precio máximo (€)</label><input type="number" value={filters.priceMax} onChange={(e) => setFilters({...filters, priceMax: e.target.value})} placeholder="9999999" /></div>
          <div className="form-group"><label>Habitaciones (mín)</label><input type="number" value={filters.bedrooms} onChange={(e) => setFilters({...filters, bedrooms: e.target.value})} placeholder="0" /></div>
          <div className="form-group"><label>Baños (mín)</label><input type="number" value={filters.bathrooms} onChange={(e) => setFilters({...filters, bathrooms: e.target.value})} placeholder="0" /></div>
          <div className="form-group"><label>Ocupado</label><select value={filters.occupied} onChange={(e) => setFilters({...filters, occupied: e.target.value})}><option value="">Todos</option><option value="false">No</option><option value="true">Sí</option></select></div>
          <div className="form-group"><label>REO</label><select value={filters.reo} onChange={(e) => setFilters({...filters, reo: e.target.value})}><option value="">Todos</option><option value="false">No</option><option value="true">Sí</option></select></div>
          <div className="form-group">
            <button onClick={() => setFilters({province: '', city: '', propertyType: '', priceMin: '', priceMax: '', bedrooms: '', bathrooms: '', occupied: '', reo: ''})} className="reset-filters-btn">
              Limpiar filtros
            </button>
          </div>
        </div>
        <p className="results-count">{filteredProperties.length} propiedades encontradas</p>
      </div>

      <div className="properties-grid">
        {paginatedProperties.map(property => (
          <div key={property.id} className="property-card" onClick={() => { setSelectedProperty(property); setView('detail'); }}>
            <div className="card-image">
              {property.images && property.images[0] ? (
                <AdvancedImage cldImg={cld.image(property.images[0])} plugins={[responsive(), placeholder()]} />
              ) : (
                <img src="https://via.placeholder.com/400x200?text=Sin+imagen" alt="placeholder" />
              )}
              <button className={`favorite-btn ${favorites.includes(property.id) ? 'active' : ''}`} onClick={(e) => toggleFavorite(e, property.id)}>
                {favorites.includes(property.id) ? '❤️' : '🤍'}
              </button>
              <span className="property-type">{property.propertyType}</span>
              {currentUser?.role === 'admin' && (
                <div className="card-actions">
                  <button onClick={(e) => { e.stopPropagation(); editProperty(property); }} className="edit-btn">✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); confirmDelete(property); }} className="delete-btn">🗑️</button>
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
                {property.occupied && <span>🔒 Ocupado</span>}
                {property.reo && <span>🏦 REO</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {Math.ceil(filteredProperties.length / 6) > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>Anterior</button>
          <span>Página {currentPage} de {Math.ceil(filteredProperties.length / 6)}</span>
          <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredProperties.length / 6), p+1))} disabled={currentPage === Math.ceil(filteredProperties.length / 6)}>Siguiente</button>
        </div>
      )}
    </div>
  );
};

// DetailView
const DetailView = ({ selectedProperty, setView, formatPrice }) => (
  selectedProperty && (
    <div className="detail-page">
      <button className="back-btn" onClick={() => setView('properties')}>← Volver</button>
      <div className="detail-content">
        <div className="detail-gallery">
          {selectedProperty.images && selectedProperty.images[0] ? (
            <AdvancedImage cldImg={cld.image(selectedProperty.images[0])} plugins={[responsive(), placeholder()]} className="detail-image" />
          ) : (
            <img src="https://via.placeholder.com/800x400?text=Sin+imagen" alt="placeholder" className="detail-image" />
          )}
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
          {selectedProperty.features && selectedProperty.features.length > 0 && (
            <>
              <h3>Características</h3>
              <ul className="features-list">
                {selectedProperty.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </>
          )}
          {selectedProperty.lat && selectedProperty.lng && (
            <div className="detail-map">
              <h3>Ubicación</h3>
              <MapContainer center={[selectedProperty.lat, selectedProperty.lng]} zoom={13} style={{ height: '300px', width: '100%', borderRadius: '8px' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                <Marker position={[selectedProperty.lat, selectedProperty.lng]}>
                  <Popup>{selectedProperty.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
          <div className="agent-info">
            <img src={selectedProperty.agent.photo} alt={selectedProperty.agent.name} />
            <div><p><strong>{selectedProperty.agent.name}</strong></p><p>{selectedProperty.agent.phone}</p></div>
          </div>
          <p className="detail-date">Publicado: {selectedProperty.createdAt}</p>
        </div>
      </div>
    </div>
  )
);

// AdminUsersView
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
              <td>
                {user.role !== 'admin' && (
                  <button onClick={() => deleteUser(user.id)} className="delete-user-btn">Eliminar</button>
                )}
              </td>
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
  // Estados de autenticación y datos
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState('login');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtros
  const [filters, setFilters] = useState({
    province: '', city: '', propertyType: '', priceMin: '', priceMax: '',
    bedrooms: '', bathrooms: '', occupied: '', reo: ''
  });

  // Formularios
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [propertyForm, setPropertyForm] = useState({
    id: null, title: '', description: '', price: '', province: '', city: '', street: '',
    bedrooms: '', bathrooms: '', area: '', propertyType: 'casa', occupied: false, reo: false,
    lat: '', lng: '', images: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Datos mock iniciales
  const mockProperties = [
    {
      id: 1,
      title: "Ático dúplex con terraza 50m² en Madrid Centro",
      description: "Espectacular ático en pleno centro de Madrid, con terraza y vistas.",
      price: 550000,
      province: "Madrid",
      city: "Madrid",
      street: "Gran Vía 25",
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      propertyType: "ático",
      occupied: false,
      reo: false,
      images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
      features: ["Terraza", "Piscina comunitaria", "Parking"],
      agent: { name: "Administrador", phone: "+34 91 123 4567", photo: "https://randomuser.me/api/portraits/lego/1.jpg" },
      createdAt: "2025-01-15",
      lat: 40.4168,
      lng: -3.7038
    },
    {
      id: 2,
      title: "Loft industrial en Poblenou, Barcelona",
      description: "Loft moderno con acabados industriales, cerca del mar.",
      price: 380000,
      province: "Barcelona",
      city: "Barcelona",
      street: "Carrer de Pujades 123",
      bedrooms: 2,
      bathrooms: 1,
      area: 110,
      propertyType: "loft",
      occupied: false,
      reo: false,
      images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
      features: ["Ascensor", "Aire acondicionado"],
      agent: { name: "Administrador", phone: "+34 93 234 5678", photo: "https://randomuser.me/api/portraits/lego/1.jpg" },
      createdAt: "2025-02-10",
      lat: 41.3989,
      lng: 2.1896
    }
  ];

  // Cargar datos desde localStorage
  useEffect(() => {
    // Usuarios
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      const defaultUsers = [{ id: 1, name: 'Administrador', email: 'admin@inmobiliaria.com', password: 'admin123', role: 'admin' }];
      setUsers(defaultUsers);
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    // Propiedades
    const storedProperties = localStorage.getItem('properties');
    if (storedProperties) {
      setProperties(JSON.parse(storedProperties));
      setFilteredProperties(JSON.parse(storedProperties));
    } else {
      setProperties(mockProperties);
      setFilteredProperties(mockProperties);
      localStorage.setItem('properties', JSON.stringify(mockProperties));
    }

    // Sesión actual
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
      setView('properties');
      const favKey = `favorites_${user.id}`;
      const storedFav = localStorage.getItem(favKey);
      if (storedFav) setFavorites(JSON.parse(storedFav));
    }
  }, []);

  // Persistencia
  useEffect(() => {
    if (properties.length) localStorage.setItem('properties', JSON.stringify(properties));
  }, [properties]);
  useEffect(() => {
    if (currentUser) {
      const favKey = `favorites_${currentUser.id}`;
      localStorage.setItem(favKey, JSON.stringify(favorites));
    }
  }, [favorites, currentUser]);

  // Filtrado
  const applyFilters = useCallback(() => {
    let filtered = [...properties];
    if (filters.province) filtered = filtered.filter(p => p.province === filters.province);
    if (filters.city) filtered = filtered.filter(p => p.city === filters.city);
    if (filters.propertyType) filtered = filtered.filter(p => p.propertyType === filters.propertyType);
    if (filters.priceMin) filtered = filtered.filter(p => p.price >= Number(filters.priceMin));
    if (filters.priceMax) filtered = filtered.filter(p => p.price <= Number(filters.priceMax));
    if (filters.bedrooms) filtered = filtered.filter(p => p.bedrooms >= Number(filters.bedrooms));
    if (filters.bathrooms) filtered = filtered.filter(p => p.bathrooms >= Number(filters.bathrooms));
    if (filters.occupied !== '') filtered = filtered.filter(p => p.occupied === (filters.occupied === 'true'));
    if (filters.reo !== '') filtered = filtered.filter(p => p.reo === (filters.reo === 'true'));
    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [filters, properties]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Autenticación
  const handleLogin = useCallback((e) => {
    e.preventDefault();
    const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setView('properties');
      setErrorMessage('');
      const favKey = `favorites_${user.id}`;
      const storedFav = localStorage.getItem(favKey);
      setFavorites(storedFav ? JSON.parse(storedFav) : []);
    } else {
      setErrorMessage('Email o contraseña incorrectos');
    }
  }, [users, loginForm]);

  const handleRegister = useCallback((e) => {
    e.preventDefault();
    if (users.find(u => u.email === registerForm.email)) {
      setErrorMessage('Ya existe un usuario con ese email');
      return;
    }
    const newUser = {
      id: Date.now(),
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password,
      role: 'user'
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast.success('Registro exitoso. Ahora inicia sesión.');
    setView('login');
    setRegisterForm({ name: '', email: '', password: '' });
  }, [users, registerForm]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setFavorites([]);
    setView('login');
    setLoginForm({ email: '', password: '' });
  };

  // CRUD propiedades
  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    if (!propertyForm.title || !propertyForm.price || !propertyForm.province || !propertyForm.city) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    const newProperty = {
      id: isEditing ? propertyForm.id : Date.now(),
      ...propertyForm,
      price: Number(propertyForm.price),
      bedrooms: Number(propertyForm.bedrooms),
      bathrooms: Number(propertyForm.bathrooms),
      area: Number(propertyForm.area),
      lat: propertyForm.lat ? Number(propertyForm.lat) : null,
      lng: propertyForm.lng ? Number(propertyForm.lng) : null,
      features: propertyForm.features || [],
      agent: { name: currentUser.name, phone: "+34 600 000 000", photo: "https://randomuser.me/api/portraits/lego/1.jpg" },
      createdAt: new Date().toLocaleDateString('es-ES')
    };
    let updatedProperties;
    if (isEditing) {
      updatedProperties = properties.map(p => p.id === newProperty.id ? newProperty : p);
      toast.success('Propiedad actualizada');
    } else {
      updatedProperties = [...properties, newProperty];
      toast.success('Propiedad publicada');
    }
    setProperties(updatedProperties);
    setFilteredProperties(updatedProperties);
    setView('properties');
    resetPropertyForm();
  };

  const resetPropertyForm = () => {
    setPropertyForm({
      id: null, title: '', description: '', price: '', province: '', city: '', street: '',
      bedrooms: '', bathrooms: '', area: '', propertyType: 'casa', occupied: false, reo: false,
      lat: '', lng: '', images: []
    });
    setIsEditing(false);
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
      propertyType: property.propertyType,
      occupied: property.occupied,
      reo: property.reo,
      lat: property.lat || '',
      lng: property.lng || '',
      images: property.images || []
    });
    setIsEditing(true);
    setView('upload');
  };

  const confirmDelete = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const deleteProperty = () => {
    const updated = properties.filter(p => p.id !== propertyToDelete.id);
    setProperties(updated);
    setFilteredProperties(updated);
    setShowDeleteModal(false);
    setPropertyToDelete(null);
    toast.success('Propiedad eliminada');
  };

  // Favoritos
  const toggleFavorite = (e, propertyId) => {
    e.stopPropagation();
    if (favorites.includes(propertyId)) {
      setFavorites(favorites.filter(id => id !== propertyId));
    } else {
      setFavorites([...favorites, propertyId]);
    }
  };

  // Gestión de usuarios
  const deleteUser = (userId) => {
    if (userId === currentUser?.id) {
      toast.error('No puedes eliminarte a ti mismo');
      return;
    }
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    toast.success('Usuario eliminado');
  };

  // Subida de imágenes
  const uploadImage = async (file) => {
    if (!CLOUD_NAME || CLOUD_NAME === 'YOUR_CLOUD_NAME') {
      return URL.createObjectURL(file);
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      toast.error('Error al subir la imagen');
      return null;
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    toast.loading('Subiendo imágenes...', { id: 'upload' });
    const uploadedUrls = [];
    for (const file of files) {
      const url = await uploadImage(file);
      if (url) uploadedUrls.push(url);
    }
    setIsUploading(false);
    toast.dismiss('upload');
    if (uploadedUrls.length > 0) {
      toast.success(`${uploadedUrls.length} imagen(es) subida(s)`);
      setPropertyForm(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    } else if (files.length > 0) {
      toast.error('No se pudieron subir las imágenes');
    }
  };

  const removeImage = (indexToRemove) => {
    setPropertyForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const formatPrice = (price) => `€${price.toLocaleString('es-ES')}`;

  // Paginación (totalPages usado en PropertiesView)
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  return (
    <div className="app">
      <Toaster position="top-right" />
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo" onClick={() => isLoggedIn && setView('properties')}>🏠 idealista</h1>
          {isLoggedIn && (
            <div className="nav-buttons">
              {currentUser?.role === 'admin' && (
                <>
                  <button onClick={() => { resetPropertyForm(); setView('upload'); }} className="publish-btn">Publicar</button>
                  <button onClick={() => setView('adminUsers')} className="admin-users-btn">Usuarios</button>
                </>
              )}
              <button onClick={handleLogout} className="logout-btn">Salir</button>
            </div>
          )}
        </div>
      </nav>
      <main>
        {!isLoggedIn && view === 'login' && (
          <LoginView
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            handleLogin={handleLogin}
            errorMessage={errorMessage}
            setView={setView}
          />
        )}
        {!isLoggedIn && view === 'register' && (
          <RegisterView
            registerForm={registerForm}
            setRegisterForm={setRegisterForm}
            handleRegister={handleRegister}
            errorMessage={errorMessage}
            setView={setView}
          />
        )}
        {isLoggedIn && view === 'upload' && (
          <UploadView
            propertyForm={propertyForm}
            setPropertyForm={setPropertyForm}
            handlePropertySubmit={handlePropertySubmit}
            isEditing={isEditing}
            isUploading={isUploading}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
            resetPropertyForm={resetPropertyForm}
            setView={setView}
            provincesSpain={provincesSpain}
            citiesByProvinceSpain={citiesByProvinceSpain}
          />
        )}
        {isLoggedIn && view === 'properties' && (
          <PropertiesView
            filters={filters}
            setFilters={setFilters}
            filteredProperties={filteredProperties}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            setSelectedProperty={setSelectedProperty}
            setView={setView}
            currentUser={currentUser}
            editProperty={editProperty}
            confirmDelete={confirmDelete}
            provincesSpain={provincesSpain}
            citiesByProvinceSpain={citiesByProvinceSpain}
            formatPrice={formatPrice}
          />
        )}
        {isLoggedIn && view === 'detail' && (
          <DetailView
            selectedProperty={selectedProperty}
            setView={setView}
            formatPrice={formatPrice}
          />
        )}
        {isLoggedIn && view === 'adminUsers' && currentUser?.role === 'admin' && (
          <AdminUsersView
            users={users}
            deleteUser={deleteUser}
            setView={setView}
          />
        )}
      </main>
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar propiedad?</h3>
            <p>¿Estás seguro de que quieres eliminar "{propertyToDelete?.title}"? Esta acción no se puede deshacer.</p>
            <div className="modal-buttons">
              <button onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button onClick={deleteProperty} className="btn-danger">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;