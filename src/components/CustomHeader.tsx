import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faLinkedinIn, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import logoLight from '@/assets/logo-icon.png';
import { Link, useLocation } from 'react-router-dom';

import './CustomHeader.css';

const CustomHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top ${
        isScrolled ? 'navbar-scrolled' : 'navbar-transparent'
      }`}
    >
      <div className="container">
        {/* Logo and Website Name */}
        <a className="navbar-brand d-flex align-items-center" href="#">
          <img
            src={logoLight}
            alt="AQTRA Logo"
            style={{ height: '50px', width: '50px' }}
            className="w-auto"
          />
          <span className="ms-2 fs-4">AQTRA</span>
        </a>

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
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link
                to="/"
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="about"
                className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
              >
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="services"
                className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}
              >
                Services
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="portfolio"
                className={`nav-link ${location.pathname === '/portfolio' ? 'active' : ''}`}
              >
                Portfolio
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="contact"
                className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Right Buttons */}
        <div className="d-flex align-items-center gap-3">
          <a
            href="tel:+966562405666"
            className="d-flex text-decoration-none text-primary align-items-center gap-2 "
          >
            <FontAwesomeIcon icon={faPhone} size="lg" /> +966 (056) 240 5666
          </a>
          <span className="vr"></span>
          <a
            href="https://wa.me/966562405666"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px' }}
          >
            <FontAwesomeIcon icon={faWhatsapp} size="lg" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-success rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px' }}
          >
            <FontAwesomeIcon icon={faInstagram} size="lg" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-success rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px' }}
          >
            <FontAwesomeIcon icon={faLinkedinIn} size="lg" />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default CustomHeader;