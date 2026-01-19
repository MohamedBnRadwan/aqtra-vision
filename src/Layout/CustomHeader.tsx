import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import * as Brands from '@fortawesome/free-brands-svg-icons';
import { useTranslation } from 'react-i18next';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { socialLinks, phoneLink, contactPhone, whatsappLink, whatsAppNumber } from '@/Data/CompanyInfo';
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
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const location = useLocation();

  const [isLangLoading, setIsLangLoading] = useState(false);

  const instagram = socialLinks.find(link => link.title === "Instagram");
  const linkedin = socialLinks.find(link => link.title === "LinkedIn");

  const toggleLanguage = () => {
    if (isLangLoading) return;
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
    setIsLangLoading(true);
    i18n.changeLanguage(nextLang).finally(() => setIsLangLoading(false));
  };

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
  }, [location.pathname]);

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

  // get data form CompanyInfo.json

  //style={{ transition: 'visibility 0.3s, opacity 0.3s', opacity: isNavbarVisible ? 1 : 0 }}
  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top ${isScrolled ? 'navbar-scrolled' : 'navbar-transparent'
        } ${isNavbarVisible ? 'nav-visible' : 'nav-invisible'}`}
    >
      <div className="container-fluid px-3 px-md-4 d-flex align-items-center justify-content-between gap-2 flex-nowrap">
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

        {/* Center Navigation */}
        <div className="collapse navbar-collapse flex-grow-1 justify-content-center" id="navbarNav">
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
        <div className="justify-content-center d-none d-lg-flex gap-3 align-items-center ms-auto">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-2"
            onClick={toggleLanguage}
            aria-label={t('nav.changeLanguage')}
            disabled={isLangLoading}
          >
            <span className="fw-bold">{i18n.language === 'ar' ? 'E' : 'ع'}</span>
            {isLangLoading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />}
          </button>
          <Link to="/contact" className="btn btn-primary rounded-pill px-3" aria-label={t('nav.freeQuote')}>
            {t('nav.freeQuote')}
          </Link>
          <div className='d-none dir-ltr d-xl-flex'>
            <a href={phoneLink} className="d-flex text-decoration-none text-primary align-items-center gap-2">
              <FontAwesomeIcon icon={faPhone} size="lg" /> {contactPhone}
            </a>
          </div>
          <a href={phoneLink} style={{ width: '40px', height: '40px' }} title={contactPhone} className="d-xl-none text-decoration-none btn btn-outline-success rounded-circle d-flex align-items-center justify-content-center">
            <FontAwesomeIcon icon={faPhone} size='sm' />
          </a>
          <span className="vr"></span>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-success rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px' }}>
            <FontAwesomeIcon icon={Brands.faWhatsapp} size="lg" />
          </a>
          {instagram &&
            <a
              href={instagram.href} target="_blank" rel="noopener noreferrer"
              className="btn btn-outline-success rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px' }}          >
              <FontAwesomeIcon icon={instagram.icon} size="lg" />
            </a>}
          {linkedin &&
            <a href={linkedin.href} target="_blank" rel="noopener noreferrer"
              className="btn btn-outline-success rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px' }}
            >
              <FontAwesomeIcon icon={linkedin.icon} size="lg" />
            </a>}
        </div>

        {/* Mobile controls at end */}
        <div className="d-flex align-items-center gap-2 ms-2 d-lg-none">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-2"
            onClick={toggleLanguage}
            aria-label={t('nav.changeLanguage')}
            disabled={isLangLoading}
          >
            <span className="fw-bold">{i18n.language === 'ar' ? 'E' : 'ع'}</span>
            {isLangLoading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />}
          </button>
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
        </div>
      </div>
    </nav>
  );
};

export default CustomHeader;
