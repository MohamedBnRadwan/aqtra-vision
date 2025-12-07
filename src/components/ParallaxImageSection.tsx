import React from 'react';
import './ParallaxImageSection.css';

interface ParallaxImageSectionProps {
  imageUrl: string;
  heading: string;
  summary: string;
  overlay?: boolean;
}

const ParallaxImageSection: React.FC<ParallaxImageSectionProps> = ({ imageUrl, heading, summary, overlay }) => {
  return (
    <section className="parallax-image-section">
      <div className="image-wrapper" style={{ backgroundImage: `url(${imageUrl})` }}></div>
      {overlay && <div className="overlay"></div>}
      
      <div className="text-overlay">
        <h2>{heading}</h2>
        <p>{summary}</p>
      </div>
    </section>
  );
};

export default ParallaxImageSection;