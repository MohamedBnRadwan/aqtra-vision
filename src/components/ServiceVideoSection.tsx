import React from 'react';
import './ServiceVideoSection.css';

interface ServiceVideoSectionProps {
  title: string;
  description: string[];
  videoUrl: string;
}

const ServiceVideoSection: React.FC<ServiceVideoSectionProps> = ({ title, description, videoUrl }) => {
  return (
    <section className="service-video-section">
      <div className="container-fluid d-flex">
        {/* Left Side: Text Content */}
        <div className="text-content flex-grow-1">
          <h3>{title}</h3>
          {description.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Right Side: Video Card */}
        <div className="video-card d-flex">
            <video src={videoUrl} className="video" autoPlay muted loop />
        </div>
      </div>
    </section>
  );
};

export default ServiceVideoSection;