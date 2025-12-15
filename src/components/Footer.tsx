import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logoVerticalLight from '@/assets/AQTRA-LOGO-TEXT-COLORD.png';
import * as Brands from "@fortawesome/free-brands-svg-icons";
import { Link } from 'react-router-dom';
import { SocialLinks } from '@/Data/CompanyInfo.json';
import './Footer.css';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import Rellax from "rellax";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  // let [FooterSpaceHeight, setFooterSpaceHeight] = useState(0);
  // useEffect(() => {
  //   const updateFooterHeight = () => {
  //     setFooterSpaceHeight(document.getElementById('footer-space')?.offsetHeight || 0);
  //   };
  //   updateFooterHeight();
  //   window.addEventListener('resize', updateFooterHeight);
  //   return () => window.removeEventListener('resize', updateFooterHeight);
  // }, []);

  useEffect(() => {
    const rellax = new Rellax(".rellax", {
      speed: 5,
      center: true,
      wrapper: null,
      round: false,
      vertical: true,
      horizontal: true,
    });

    return () => {
      rellax.destroy(); // VERY IMPORTANT
    };
  }, []);

  const footerLinks = {
    services: [
      { name: 'Smart Home Systems', href: '/services/smart-home-systems' },
      { name: 'Solar Energy', href: '/services/solar-energy' },
      { name: 'HVAC & Chiller', href: '/services/hvac-chiller' },
      { name: 'Plumbing', href: '/services/plumbing' },
      { name: 'Electrical', href: '/services/electrical' },
      { name: 'Network & IT', href: '/services/network-security' },
    ],
    company: [
      { name: 'About Us', href: '/about-us' },
      { name: 'Contact', href: '/contact' },
      { name: 'Projects', href: '/projects' },
      { name: 'Careers', href: '/careers' },
      // { name: 'Saudi Vision 2030', href: '/saudi-vision-2030' },
    ],
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* <div id="footer-space" style={{ marginBottom: FooterSpaceHeight }}></div> */}
      <footer className="py-5">

        <div className="container">
          <div className="row mb-4">
            <div className='col-12'>
              <button
                title="Back to top"
                onClick={scrollToTop}
                className="btn border-0 float-end mb-4"
                aria-label="Scroll to top"
              >
                <FontAwesomeIcon icon={faArrowUp} size='2x' className='text-primary' />
              </button>
              <img src={logoVerticalLight} alt="AQTRA Logo" className="mb-4 p-2 float-start" style={{ height: '100px' }} />
            </div>
            {/* Company Info */}
            <div className="col-lg-4 mb-3">
              <p>
                Integrated engineering solutions for modern living and business operations.
              </p>

            </div>

            {/* Services Links */}
            <div className="col-lg-4 col-md-6 mb-3">
              <h5>Services</h5>
              <ul className="list-unstyled">
                {footerLinks.services.map((service, index) => (
                  <li key={index} className="d-flex align-items-center">
                    <Link to={service.href}>{service.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="col-lg-4 col-md-6 mb-3">
              <h5>Company</h5>
              <ul className="list-unstyled">
                {footerLinks.company.map((link, index) => (
                  <li key={index} className="d-flex align-items-center">
                    <Link to={link.href}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className='col-12'>
              <p>
                It's in the meeting of people that ideas begin to spark. If you have a question, a suggestion, or simply wish to get in touch. Feel free to send us an email. We’ll respond as soon as possible and look forward to hearing from you.
              </p>
              <Link to="/contact" className="btn btn-primary rounded-pill btn-lg fs-4 px-4 py-3">
                Get in Touch
              </Link>
              <img src="/src/assets/saudi_vision_2030_logo.svg" style={{ height: '100px' }} alt="Saudi Vision 2030 Logo" className="mb-4 float-end" />
            </div>
          </div>

          {/* Social Links */}
          <div className="row mt-4 pt-3 border-top border-secondary">
            <div className="col-md-6 d-flex flex-row justify-content-center justify-content-md-start my-2 text-start">
              <p className="mb-0">&copy; {currentYear} AQTRA. All rights reserved.</p>
            </div>
            <div className="col-md-6 d-flex flex-row justify-content-center justify-content-md-end my-2 text-end">
              {SocialLinks[0].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light d-flex align-items-center justify-content-center rounded-circle mx-2"
                  style={{ width: '40px', height: '40px' }}
                >
                  <FontAwesomeIcon icon={Brands[social.icon]} />
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