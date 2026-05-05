import React, { useState } from 'react';
import { getImageUrl } from '../../services/api';

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

export default GalleryCarousel;