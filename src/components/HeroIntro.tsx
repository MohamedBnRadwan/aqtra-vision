import React from 'react';
import Marquee from './Marquee';
import './HeroIntro.css';

import BgVideo from '@/assets/intro-bg.mp4';

const HeroIntro: React.FC = () => {
  return (
    <section className="hero-intro">
      <video className="hero-video" autoPlay loop muted>
        <source src={BgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="hero-content">
        <h1 className="hero-title">Welcome to Our Vision</h1>
        <p className="hero-subtitle">Innovating the future, one step at a time</p>
      </div>
      {/* <div className="hero-marquee">
        <Marquee />
      </div> */}
    </section>
  );
};

export default HeroIntro;