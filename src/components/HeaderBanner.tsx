import React from 'react';

interface HeaderBannerProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

const HeaderBanner: React.FC<HeaderBannerProps> = ({ title, subtitle, backgroundImage }) => {
  const bannerStyle = {
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    padding: '4rem 1rem',
    color: '#fff',
    textAlign: 'center' as const,
  };

  return (
    <div className="header-banner" style={bannerStyle}>
      <h1 className="display-4 fw-bold">{title}</h1>
      {subtitle && <p className="lead mt-3">{subtitle}</p>}
    </div>
  );
};

export default HeaderBanner;