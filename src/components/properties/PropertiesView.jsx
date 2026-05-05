import React, { useState } from 'react';
import { getImageUrl } from '../../services/api';
import { provincesSpain, citiesByProvinceSpain, formatPrice } from '../../utils/constants';

const PropertiesView = ({
  filters, setFilters, properties, loading, currentPage, setCurrentPage, totalPages,
  favorites, toggleFavorite, setSelectedProperty, setView, currentUser, editProperty, confirmDelete
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

export default PropertiesView;