import React from 'react';
import { formatPrice } from '../../utils/constants';
import GalleryCarousel from '../common/GalleryCarousel';

const DetailView = ({ selectedProperty, setView }) => {
  if (!selectedProperty) return <div>Propiedad no encontrada</div>;

  const direccion = `${selectedProperty.street}, ${selectedProperty.city}, ${selectedProperty.province}`;
  const images = typeof selectedProperty.images === 'string'
    ? JSON.parse(selectedProperty.images || '[]')
    : Array.isArray(selectedProperty.images) ? selectedProperty.images : [];

  // Construir URL del mapa estático con OpenStreetMap (siempre usando la dirección)
  const mapUrl = direccion && direccion !== ', , '
    ? `https://www.openstreetmap.org/export/embed.html?bbox=-5.5%2C35.5%2C5.5%2C43.5&layer=mapnik&q=${encodeURIComponent(direccion)}`
    : null;

  // Enlace a Google Maps (se abre al hacer clic en el mapa)
  const googleMapsLink = direccion && direccion !== ', , '
    ? `https://www.google.com/maps?q=${encodeURIComponent(direccion)}`
    : null;

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => setView('properties')}>← Volver</button>
      <div className="detail-content">
        <div className="detail-gallery">
          <GalleryCarousel images={images} />
        </div>
        <div className="detail-info">
          <h1>{selectedProperty.title}</h1>
          <p className="detail-location">{direccion}</p>
          <p className="detail-price">{formatPrice(selectedProperty.price)}</p>
          <div className="detail-features">
            <div className="feature"><span>Habitaciones</span><span>{selectedProperty.bedrooms}</span></div>
            <div className="feature"><span>Baños</span><span>{selectedProperty.bathrooms}</span></div>
            <div className="feature"><span>Superficie</span><span>{selectedProperty.area} m²</span></div>
            <div className="feature"><span>Ocupado</span><span>{selectedProperty.occupied ? 'Sí' : 'No'}</span></div>
            <div className="feature"><span>REO</span><span>{selectedProperty.reo ? 'Sí' : 'No'}</span></div>
          </div>
          <h3>Descripción</h3>
          <p className="detail-description">{selectedProperty.description}</p>

          {/* MAPA: iframe con OpenStreetMap y clic abre Google Maps */}
          {mapUrl && googleMapsLink && (
            <div className="detail-map-section">
              <h3>Ubicación</h3>
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', cursor: 'pointer' }}
              >
                <iframe
                  title="Mapa de ubicación"
                  src={mapUrl}
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '8px', pointerEvents: 'none' }}
                  loading="lazy"
                />
              </a>
            </div>
          )}

          {!mapUrl && (
            <div className="detail-map-section">
              <h3>Ubicación</h3>
              <p>No hay dirección disponible para mostrar el mapa.</p>
            </div>
          )}

          <p className="detail-date">Publicado: {new Date(selectedProperty.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default DetailView;