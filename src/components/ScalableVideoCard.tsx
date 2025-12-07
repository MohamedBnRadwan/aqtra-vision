import React, { useEffect, useState } from 'react';
import './ScalableVideoCard.css';

interface ScalableVideoCardProps {
  VideoUrl: string;
}

const ScalableVideoCard: React.FC<ScalableVideoCardProps> = ({VideoUrl}) => {
  const [videoDimensions, setVideoDimensions] = useState({ width: '100%', height: '100%' });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newWidth = Math.max(50, 100 - scrollY / 10) + '%';
      const newHeight = Math.max(50, 100 - scrollY / 10) + '%';
      setVideoDimensions({ width: newWidth, height: newHeight });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <>
      <div className="d-flex justify-content-center align-items-center px-2">
        <section className="hero-intro d-flex justify-content-center align-items-center" style={{ width: videoDimensions.width, height: videoDimensions.height }}>
          <div className="hero-overlay"></div>
          <video className="hero-video" autoPlay loop muted>
            <source src={VideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </section>
      </div>
    </>
  );
};

export default ScalableVideoCard;