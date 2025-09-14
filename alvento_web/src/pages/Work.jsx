import React, { useState } from 'react';
import CircularGallery from '../components/CircularGallery';

const Work = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleCardClick = (videoData, index, event) => {
    // First apply zoom and blur to gallery
    setIsZoomed(true);
    
    // Then show modal after zoom animation
    setTimeout(() => {
      setSelectedVideo(videoData);
      setIsAnimating(false);
      
      // Trigger modal slide-up animation
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);
    }, 100);
  };

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setSelectedVideo(null);
      setIsZoomed(false);
    }, 400);
  };

  return (
    <div className="work-page">
      <div style={{ height: '600px', position: 'relative' }}>
        <CircularGallery 
          bend={3} 
          textColor="#ffffff" 
          borderRadius={0.05} 
          scrollEase={0.02}
          onCardClick={handleCardClick}
          className={isZoomed ? 'zoomed' : ''}
        />
      </div>
      
      <div className="work-content">
        <div className="work-description">
        </div>
      </div>

      {selectedVideo && (
        <div 
          className="video-info-modal" 
          data-enlarging={isAnimating} 
          onClick={closeModal}
        >
          <div className="scrim"></div>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>&times;</button>
            <div className="modal-split">
              <div className="video-player-section">
                <video 
                  src={selectedVideo.image} 
                  controls 
                  autoPlay 
                  muted 
                  loop
                  className="modal-video"
                />
              </div>
              <div className="video-info-section">
                <div className="video-info">
                  <h2>{selectedVideo.title}</h2>
                  <div className="video-meta">
                    <span className="client">Client: {selectedVideo.client}</span>
                    <span className="year">Year: {selectedVideo.year}</span>
                  </div>
                  <p className="description">{selectedVideo.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Work;
