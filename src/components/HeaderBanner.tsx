import React from 'react';
import './HeaderBanner.css'

interface HeaderBannerProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

const HeaderBanner: React.FC<HeaderBannerProps> = ({ title, subtitle, backgroundImage }) => {
  const bannerStyle: React.CSSProperties = {
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundPosition: backgroundImage && backgroundImage.includes('#position=') ? backgroundImage.split('#position=')[1].split(',')[0] + ' ' + backgroundImage.split('#position=')[1].split(',')[1]    : 'center',

  };

  return (
    <div className={"header-banner" + (backgroundImage ? "" : " banner-light")} style={bannerStyle}>
      <div className="overlay"></div>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h1 className="display-4">{title}</h1>
        {subtitle && <p className="lead mt-3">{subtitle}</p>}
      </div>
    </div>
  );
};

export default HeaderBanner;