import React, { useState, useEffect } from 'react';
import CustomHeader from './CustomHeader';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [headerHeight, setHeaderHeight] = useState(0);

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

  return (
    <>
      {/* Header */}
      <CustomHeader />
      <div className="d-flex flex-column min-vh-100" style={{ marginTop: headerHeight }}>
        {/* Main Content */}
        <main className="flex-grow-1 body-bg-light" >
          {children}
        </main>

        {/* Footer */}
        <div style={{ position: 'relative' }}>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Layout;