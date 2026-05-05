// src/components/properties/DetailView.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Solución a los iconos de Leaflet que no cargan por defecto
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DetailView = ({ selectedProperty, setView }) => {
  if (!selectedProperty) return <div>Cargando...</div>;

  // Validar coordenadas
  const tieneCoordenadasValidas = () => {
    const lat = parseFloat(selectedProperty.lat);
    const lng = parseFloat(selectedProperty.lng);
    return (
      !isNaN(lat) &&
      !isNaN(lng) &&
      !(lat === 0 && lng === 0) &&
      selectedProperty.lat !== null &&
      selectedProperty.lng !== null
    );
  };

  return (
    <div className="detail-container">
      <button onClick={() => setView('properties')} className="back-btn">
        ← Volver
      </button>

      <h1>{selectedProperty.title}</h1>
      <p>{selectedProperty.description}</p>
      <p><strong>Precio:</strong> {selectedProperty.price} €</p>
      <p>
        <strong>Dirección:</strong> {selectedProperty.street}, {selectedProperty.city}, {selectedProperty.province}
      </p>

      {/* MAPA INTEGRADO EN EL MISMO ARCHIVO */}
      <div style={{ margin: '20px 0' }}>
        <h3>Ubicación</h3>
        {!tieneCoordenadasValidas() ? (
          <div
            style={{
              background: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <p>📍 Ubicación no disponible</p>
            <p style={{ fontSize: '12px', color: '#666' }}>
              Esta propiedad no tiene coordenadas válidas.
              {selectedProperty.street && <br />}
              {selectedProperty.street && `Dirección: ${selectedProperty.street}`}
            </p>
          </div>
        ) : (
          <div
            style={{
              height: '400px',
              width: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <MapContainer
              center={[parseFloat(selectedProperty.lat), parseFloat(selectedProperty.lng)]}
              zoom={15}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              <Marker position={[parseFloat(selectedProperty.lat), parseFloat(selectedProperty.lng)]}>
                <Popup>
                  {selectedProperty.street || 'Ubicación de la propiedad'}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>

      {/* El resto de información de la propiedad (dormitorios, baños, etc.) */}
      {/* Puedes agregar más campos aquí según tu modelo */}
    </div>
  );
};

export default DetailView;