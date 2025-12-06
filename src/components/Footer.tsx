import './Footer.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faLinkedinIn, faTwitter } from '@fortawesome/free-brands-svg-icons';
import logoVerticalLight from '@/assets/logo-vertical-light.png';
import { Icon } from 'lucide-react';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: 'Smart Home Systems' },
      { name: 'Solar Energy' },
      { name: 'HVAC & Chiller' },
      { name: 'Plumbing' },
      { name: 'Electrical' },
      { name: 'Network & IT' },
    ],
    company: [
      { name: 'About Us' },
      { name: 'Contact' },
      { name: 'Projects' },
      { name: 'Careers' },
    ],
  };

  const socialLinks = [
    { icon: faFacebookF, href: 'https://www.facebook.com/AQTRACO', label: 'Facebook' },
    { icon: faInstagram, href: 'https://www.instagram.com/aqtra.co/', label: 'Instagram' },
    { icon: faLinkedinIn, href: 'https://www.linkedin.com/company/aqtraco', label: 'LinkedIn' },
    { icon: faTwitter, href: 'https://x.com/AQTRACO', label: 'Twitter' },
  ];

  return (
    <footer className="bg-dark text-white py-5">
      <div className="container">
        <div className="row mb-4">
          {/* Company Info */}
          <div className="col-lg-4 mb-3">
            <img src={logoVerticalLight} alt="AQTRA Logo" className="mb-3" style={{ height: '100px' }} />
            <p>
              Integrated engineering solutions for modern living and business operations.
            </p>
            {/* <p className="border rounded">
              <strong><FontAwesomeIcon icon={faPhone} /></strong> +966 056 240 5666
            </p>
            <p>
              <strong><FontAwesomeIcon icon={faEnvelope} /></strong> info@aqtraco.com
            </p> */}
          </div>

          {/* Services Links */}
          <div className="col-lg-4 mb-3">
            <h5 className="text-primary">Services</h5>
            <ul className="list-unstyled">
              {footerLinks.services.map((service, index) => (
                <li key={index} className="d-flex align-items-center">
                  {service.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-lg-4 mb-3">
            <h5 className="text-primary">Company</h5>
            <ul className="list-unstyled">
              {footerLinks.company.map((link, index) => (
                <li key={index} className="d-flex align-items-center">
                  {link.name}
                </li>
              ))}
            </ul>


          </div>
          {/* <div className='col-12'>
            <div className="mt-4 p-3 bg-light rounded shadow-sm">
              <h6 className="fw-bold mb-2">AQTRA Services</h6>
              <p className="text-muted mb-3">
                Discover our innovative solutions for modern living and business operations.
              </p>
              <a href="#contact" className="btn btn-primary w-100">
                Request a Consultation
              </a>
            </div>
          </div> */}
        </div>

        {/* Social Links */}
        <div className="row">
          <div className="col-12 d-flex justify-content-center flex-row text-center">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-light d-flex align-items-center justify-content-center rounded-circle mx-2"
                style={{ width: '40px', height: '40px' }}
              >
                <FontAwesomeIcon icon={social.icon} />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="row mt-4">
          <div className="col text-center">
            <p className="mb-0">&copy; {currentYear} AQTRA. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
