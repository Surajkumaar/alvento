import React, { useRef } from 'react';
// CORRECTED: Updated the import path to be absolute from the src directory
import useImageTrail from '/src/hooks/useImageTrail.js';

const About = () => {
  const trailContainerRef = useRef(null);

  const imageUrls = [
    '/1.jpg', '/2.jpg', '/3.jpg',
    '/4.jpg', '/5.jpg', '/6.jpg',
    '/7.jpg', '/8.jpg', '/9.jpg',
    '/10.jpg', '/11.jpg', '/12.jpg',
    '/13.jpg'
  ];

  useImageTrail(imageUrls, trailContainerRef);

  return (
    <>
      <div id="trail-container" ref={trailContainerRef}></div>
      <main className="content-wrapper">
        <div className="left-column">
          <p>
            We are a production company with headquarters in Barcelona. We plan and produce creative, high-quality content based on mutual understanding with our clients. We pride ourselves on our philosophy of treating every project as unique. We listen, we understand, we discover, we adapt, we personalize, and we bring it to life.
          </p>
          <p>
            Redwood is the strongest tree, the one that grows higher than the others. Not because the aim is to reach the sky, but because the roots are holding together deep in the soil. Just like the TEAM.
          </p>
          <div className="contact-info">
            <p>Zamora Street 105, 4th-2<br />08018 Barcelona</p>
            <p>+34 933 56 97 93<br />info@redwoodteam.tv</p>
            <p>
              <a href="#">Vimeo</a>
              <a href="#">LinkedIn</a>
              <a href="#">Instagram</a>
            </p>
          </div>
        </div>

        <div className="center-column">
          <h1>ABOUT</h1>
          <h2>Information</h2>
        </div>

        <div className="right-column"></div>
      </main>
    </>
  );
};

export default About;
