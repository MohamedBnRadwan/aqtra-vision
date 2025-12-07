import React from 'react';
import './ParallaxImageSection.css';

interface ParallaxImageSectionProps {
  imageUrl: string;
  heading: string;
  summary: string;
}

const ParallaxImageSection: React.FC<ParallaxImageSectionProps> = ({ imageUrl, heading, summary }) => {
  return (
    <section className="parallax-image-section">
      <div className="image-wrapper" style={{ backgroundImage: `url(${imageUrl})` }}></div>
      <div className="text-overlay">
        <h2>{heading}</h2>
        <p>{summary}</p>
      </div>
    </section>
  );
};

export default ParallaxImageSection;