
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faLinkedinIn, faTwitter } from '@fortawesome/free-brands-svg-icons';
import logoVerticalLight from '@/assets/AQTRA-LOGO-TEXT.png';
import { Icon } from 'lucide-react';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import './Footer.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  let [FooterSpaceHeight, setFooterSpaceHeight] = useState(0);
  useEffect(() => {
    const updateFooterHeight = () => {
      setFooterSpaceHeight(document.getElementById('footer-space')?.offsetHeight || 0);
    };
    updateFooterHeight();
    window.addEventListener('resize', updateFooterHeight);
    return () => window.removeEventListener('resize', updateFooterHeight);
  }, []);

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
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Projects', href: '/projects' },
      { name: 'Careers', href: '/careers' },
    ],
  };

  const socialLinks = [
    { icon: faFacebookF, href: 'https://www.facebook.com/AQTRACO', label: 'Facebook' },
    { icon: faInstagram, href: 'https://www.instagram.com/aqtra.co/', label: 'Instagram' },
    { icon: faLinkedinIn, href: 'https://www.linkedin.com/company/aqtraco', label: 'LinkedIn' },
    { icon: faTwitter, href: 'https://x.com/AQTRACO', label: 'Twitter' },
  ];

  return (
    <>
      {/* <div style={{ marginBottom: FooterSpaceHeight }}></div> */}
      <footer id="footer-space" className="py-5">
        <div className="container">
          <div className="row mb-4">
            {/* Company Info */}
            <div className="col-lg-4 mb-3">
              <img src={logoVerticalLight} alt="AQTRA Logo" className="mb-4" style={{ height: '100px' }} />
              <p>
                Integrated engineering solutions for modern living and business operations.
              </p>
              <p>
                It's in the meeting of people that ideas begin to spark. If you have a question, a suggestion, or simply wish to get in touch. Feel free to send us an email. We’ll respond as soon as possible and look forward to hearing from you.
              </p>
              <Link to="#contact" className="btn btn-primary rounded-pill btn-lg fs-4 px-4 py-3">
                Get in Touch
              </Link>
            </div>

            {/* Services Links */}
            <div className="col-lg-4 mb-3">
              <h5>Services</h5>
              <ul className="list-unstyled">
                {footerLinks.services.map((service, index) => (
                  <li key={index} className="d-flex align-items-center">
                    <Link to="#">{service.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="col-lg-4 mb-3">
              <h5>Company</h5>
              <ul className="list-unstyled">
                {footerLinks.company.map((link, index) => (
                  <li key={index} className="d-flex align-items-center">
                    <Link to={link.href}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Links */}
          <div className="row mt-4 pt-3 border-top border-secondary">
            <div className="col-md-6 text-start">
              <p className="mb-0">&copy; {currentYear} AQTRA. All rights reserved.</p>
            </div>
            <div className="col-md-6 d-flex justify-content-end flex-row text-end">
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

        </div>
      </footer>
    </>
  );
};

export default Footer;
