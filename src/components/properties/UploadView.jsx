import React from 'react';
import { getImageUrl } from '../../services/api';
import { provincesSpain, citiesByProvinceSpain } from '../../utils/constants';

const UploadView = ({
  propertyForm, setPropertyForm, handlePropertySubmit, isEditing, isUploading,
  handleImageUpload, removeImage, resetPropertyForm, setView
}) => {
  const totalImages = (propertyForm.images?.length || 0);
  const remainingSlots = 10 - totalImages;

  return (
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
            disabled={isUploading || remainingSlots <= 0}
          />
          {isUploading && <p className="upload-status">Subiendo imágenes...</p>}
          {propertyForm.images && propertyForm.images.length > 0 && (
            <div className="image-preview">
              <p>Imágenes: {totalImages}/10</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                {propertyForm.images.map((url, idx) => (
                  <div key={idx} className="image-preview-item" style={{ position: 'relative' }}>
                    <img 
                      src={getImageUrl(url)} 
                      alt={`preview-${idx}`} 
                      style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} 
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=Error';
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)} 
                      className="remove-image" 
                      style={{ position: 'absolute', top: '5px', right: '5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
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
};

export default UploadView;