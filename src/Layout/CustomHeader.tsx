import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import * as Brands from '@fortawesome/free-brands-svg-icons';
import { useTranslation } from 'react-i18next';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import logoLight from '@/assets/logo-icon.png';
import LogoText from '@/assets/AQTRA-LOGO-TEXT.png';
import { Link, useLocation } from 'react-router-dom';

import './CustomHeader.css';

declare global {
  interface Window {
    bootstrap?: typeof import('bootstrap');
  }
}

const CustomHeader: React.FC = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse?.classList.contains('show')) {
      const bsCollapse = window.bootstrap?.Collapse.getInstance(navbarCollapse);
      if (bsCollapse) {
      bsCollapse.hide();
      } else {
      navbarCollapse.classList.remove('show');
      }
    }
  },[location.pathname]);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPosition = window.scrollY;
      setIsScrolled(currentScrollPosition > 50);

      if (currentScrollPosition > 300 && currentScrollPosition > lastScrollPosition) {
        setIsNavbarVisible(false); // Hide navbar on scroll down if scrolled more than 300px
      } else if (currentScrollPosition <= 300 || currentScrollPosition < lastScrollPosition) {
        setIsNavbarVisible(true); // Show navbar on scroll up or if scrolled less than 300px
      }
      setLastScrollPosition(currentScrollPosition);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollPosition]);
//style={{ transition: 'visibility 0.3s, opacity 0.3s', opacity: isNavbarVisible ? 1 : 0 }}
  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top ${isScrolled ? 'navbar-scrolled' : 'navbar-transparent'
        } ${isNavbarVisible ? 'nav-visible' : 'nav-invisible'}`}
      
    >
      <div className="container">
        {/* Logo and Website Name */}
        <Link to="/" className="navbar-brand d-flex align-items-center" >
          <img
            src={logoLight}
            alt="AQTRA Logo"
            style={{ height: '30px', width: '30px' }}
            className="w-auto logo-icon"
          />
          <span className="vr" ></span>
          <img
            src={LogoText}
            alt="AQTRA Logo"
            style={{ height: '39px' }}
            className="w-auto logo-txt"
          />
        </Link>

        {/* Toggler for Mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Center Navigation */}
        <div className="collapse w-100 navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link
                to="/"
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                {t('nav.home')}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/about-us"
                className={`nav-link ${location.pathname === '/about-us' ? 'active' : ''}`}
              >
                {t('nav.about')}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="services"
                className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}
              >
                {t('nav.services')}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="portfolio"
                className={`nav-link ${location.pathname === '/portfolio' ? 'active' : ''}`}
              >
                {t('nav.portfolio')}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="contact"
                className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
              >
                {t('nav.contact')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Right Buttons */}
        <div className="w-100 justify-content-center d-flex gap-3 ">
          <div className='d-none d-xl-flex'>
            <a href="tel:+966562405666" className="d-flex text-decoration-none text-primary align-items-center gap-2">
              <FontAwesomeIcon icon={faPhone} size="lg" /> +966 (056) 240 5666
            </a>
          </div>
          <a href="tel:+966562405666" style={{width: '40px'}} title='+966 (056) 240 5666' className="d-xl-none text-decoration-none btn btn-outline-success rounded-circle d-flex align-items-center justify-content-center">
            <FontAwesomeIcon icon={faPhone} size='sm' />
          </a>
          <span className="vr"></span>
          <a href="https://wa.me/966562405666" target="_blank" rel="noopener noreferrer" className="btn btn-success rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px' }}>
            <FontAwesomeIcon icon={Brands.faWhatsapp} size="lg" />
          </a>
          <a
            href="https://www.instagram.com/aqtra.co/" target="_blank" rel="noopener noreferrer"
            className="btn btn-outline-success rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px' }}          >
            <FontAwesomeIcon icon={Brands.faInstagram} size="lg" />
          </a>
          <a href="https://www.linkedin.com/company/aqtraco/" target="_blank" rel="noopener noreferrer"
            className="btn btn-outline-success rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px' }}
          >
            <FontAwesomeIcon icon={Brands.faLinkedinIn} size="lg" />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default CustomHeader;
