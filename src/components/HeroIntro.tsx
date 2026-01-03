import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BgVideo from '@/assets/intro-bg.mp4';
import './HeroIntro.css';

const HeroIntro: React.FC = () => {
  const { t } = useTranslation();
  const [videoDimensions, setVideoDimensions] = useState({ width: '50%', height: '50%' });
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newWidth = Math.min(100, 50 + scrollY / 5) + '%';
      const newHeight = Math.min(100, 50 + scrollY / 5) + '%';

      setVideoDimensions({ width: newWidth, height: newHeight });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>

      <div className="d-flex justify-content-center align-items-center px-2">
        <div className='container mt-5 mb-4 '>
          <div className="row">
            <div className="col-md-6 my-5 text-center hero-text" data-aos="fade-up">
              <h1 className="display-4  text-dark">{t('heroIntro.title')}</h1>
              <p>{t('heroIntro.tagline')}</p>
            </div>
            <div className="col-md-6 my-5 text-center hero-text" data-aos="fade-up">
              <p className="mb-4">{t('heroIntro.body')}</p>
            </div>
          </div>
        </div>
        <section className="hero-intro d-flex justify-content-center align-items-center" style={{ width: videoDimensions.width, height: videoDimensions.height, visibility: isVideoReady ? 'visible' : 'hidden' }}>
          <div className="hero-overlay"></div>
          <video
            className="hero-video"
            autoPlay
            loop
            muted
            playsInline={true}
            onLoadedData={() => setIsVideoReady(true)}
          >
            <source src={BgVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="intro-card d-md-none p-1" data-aos="fade-up">
            <h6 className="fw-bold m-0">AQTRA</h6>
            {/* <img src={LogoIcon} alt="AQTRA Logo" className="intro-card-icon d-md-none" /> */}
          </div>
          <div className="intro-card p-4 rounded d-none d-md-block" data-aos="fade-up">
            {/* <img src={LogoIcon} alt="AQTRA Logo" className="intro-card-icon mb-3" /> */}
            <h5 className="display-6">AQTRA</h5>
            <p className="mb-3">
              Reach out to us for innovative engineering solutions tailored to your needs.
            </p>
            <p>Let’s build the future together.</p>
            <a href="#contact" className="btn btn-primary rounded-pill w-100">{t('heroIntro.cta')}</a>
          </div>
        </section>

      </div>
    </>
  );
};

export default HeroIntro;