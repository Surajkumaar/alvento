import React, { useState } from 'react';
// import CircularGallery from '../components/CircularGallery';
import { ThreeDPhotoCarousel } from '@/components/ui/3d-carousel';

interface VideoData {
  image: string;
  title: string;
  client: string;
  year: string;
  description: string;
}

const Work: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  // const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // const handleCardClick = (videoData: VideoData, index: number, event: React.MouseEvent) => {
  //   // First apply zoom and blur to gallery
  //   setIsZoomed(true);
  //   
  //   // Then show modal after zoom animation
  //   setTimeout(() => {
  //     setSelectedVideo(videoData);
  //     setIsAnimating(false);
  //     
  //     // Trigger modal slide-up animation
  //     setTimeout(() => {
  //       setIsAnimating(true);
  //     }, 10);
  //   }, 100);
  // };

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setSelectedVideo(null);
      // setIsZoomed(false);
    }, 400);
  };

  return (
    <div className="work-page">
      <div className="work-content">
        <div className="work-description">
          <h2>Interactive 3D Photo Carousel</h2>
          <p>
            Experience our stunning 3D photo carousel featuring dynamic image loading from Unsplash. 
            Drag to rotate the carousel and click on any image to view it in full detail. 
            The carousel adapts to different screen sizes and provides smooth animations powered by Framer Motion.
          </p>
          <div className="carousel-container" style={{ marginTop: '2rem', height: '600px', backgroundColor: '#111', borderRadius: '15px', padding: '20px' }}>
            <ThreeDPhotoCarousel />
          </div>
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
