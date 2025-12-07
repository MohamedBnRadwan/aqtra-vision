import React from 'react';
import './ParallaxVideoSection.css';

interface ParallaxVideoSectionProps {
  videoUrl: string;
  text: string;
}

const ParallaxVideoSection: React.FC<ParallaxVideoSectionProps> = ({ videoUrl, text }) => {
  return (
    <section className="parallax-video-section">
      <div className="video-wrapper">
        <video src={videoUrl} autoPlay muted loop className="parallax-video"></video>
      </div>
      <div className="text-overlay">
        <p>{text}</p>
      </div>
    </section>
  );
};

export default ParallaxVideoSection;