import React, { useState, useEffect } from 'react';
import CustomHeader from './CustomHeader';
import Footer from './Footer';
import i18n from '../i18n';
import logoLight from '@/assets/logo-icon.png';
import LogoText from '@/assets/AQTRA-LOGO-TEXT.png';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [langChanging, setLangChanging] = useState(false);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerElement = document.querySelector('.navbar') as HTMLElement;
      if (headerElement) {
        setHeaderHeight(headerElement.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  useEffect(() => {
    const handleLangChange = () => {
      setLangChanging(true);
      window.setTimeout(() => setLangChanging(false), 700);
    };
    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, []);

  return (
    <>
      {langChanging && (
        <div className="lang-overlay">
          <div className="lang-overlay__card">
            <div className="d-flex align-items-center gap-2">
              <img src={logoLight} alt="AQTRA" className="lang-overlay__logo" />
              <img src={LogoText} alt="AQTRA" className="lang-overlay__logo-text" />
            </div>
            <div className="lang-overlay__spinner" aria-hidden="true" />
          </div>
        </div>
      )}
      {/* Header */}
      <CustomHeader />
      <div className="d-flex flex-column min-vh-100" style={{ marginTop: headerHeight }}>
        {/* Main Content */}
        <main className="flex-grow-1 body-bg-light" >
          {children}
        </main>

        {/* Footer */}
          <Footer />
      </div>
    </>
  );
};

export default Layout;