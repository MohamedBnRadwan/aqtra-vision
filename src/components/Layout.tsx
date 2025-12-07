import React from 'react';
import CustomHeader from './CustomHeader';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
        {/* Header */}
        <CustomHeader />
      <div className="d-flex flex-column min-vh-100">

        {/* Main Content */}
        <main className="flex-grow-1 body-bg-light">
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