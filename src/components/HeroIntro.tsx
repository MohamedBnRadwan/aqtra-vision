import React, { useEffect, useState } from 'react';
import Marquee from './Marquee';
import BgVideo from '@/assets/intro-bg.mp4';
import LogoIcon from '@/assets/logo-icon.png';
import './HeroIntro.css';

const HeroIntro: React.FC = () => {
  const [videoDimensions, setVideoDimensions] = useState({ width: '100%', height: '100%' });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newWidth = Math.max(50, 100 - scrollY / 20) + '%';
      const newHeight = Math.max(50, 100 - scrollY / 20) + '%';
      setVideoDimensions({ width: newWidth, height: newHeight });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <>
      <div className='container mt-5 mb-4 '>
        <div className="row">
          <div className="col-md-6 my-5 text-center hero-text" data-aos="fade-up">
            <h1 className="display-4  text-dark">Accuracy and Quality</h1>
            <p>Innovating the future, one step at a time</p>
          </div>
          <div className="col-md-6 my-5 text-center hero-text" data-aos="fade-up">
            <p className="mb-4">We deliver precise, reliable engineering and construction support services built on efficiency and expertise. Our team is committed to exceptional quality, timely execution, and trusted project results.</p>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center align-items-center px-2">

        <section className="hero-intro d-flex justify-content-center align-items-center" style={{ width: videoDimensions.width, height: videoDimensions.height }}>
          <div className="hero-overlay"></div>
          <video className="hero-video" autoPlay loop muted>
            <source src={BgVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="intro-card d-md-none p-1" data-aos="fade-up">
            <h6 className="fw-bold">AQTRA</h6>
            {/* <img src={LogoIcon} alt="AQTRA Logo" className="intro-card-icon d-md-none" /> */}
          </div>
          <div className="intro-card p-4 rounded d-none d-md-block" data-aos="fade-up">
            <img src={LogoIcon} alt="AQTRA Logo" className="intro-card-icon mb-3" />
            <h3 className="fw-bold">AQTRA</h3>
            <p className="mb-3">
              Reach out to us for innovative engineering solutions tailored to your needs. Let’s build the future together.
            </p>
            <a href="#contact" className="btn btn-primary rounded-0 w-100">Get in Touch</a>
          </div>
        </section>
      </div>
    </>
  );
};

export default HeroIntro;