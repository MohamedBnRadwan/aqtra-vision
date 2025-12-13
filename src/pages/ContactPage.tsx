import React, { useEffect } from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import Contact from '@/components/Contact';
import GoogleMapLogo from '@/assets/google-map-logo.png'; // Ensure this path is correct
import {faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './ContactPage.css';


const ContactPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <HeaderBanner
        title="Contact Us"
        subtitle="We'd love to hear from you. Get in touch with us today!"

      />
      <div className="container py-5">

        <Contact />


        <div className="rate-us-section">
          <a
            href="https://g.page/r/CVE4dhOMDHoMEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className="rate-us-button"
          >
            <img src={GoogleMapLogo} alt="Google Map Logo" className="google-map-logo" />
            <div>

            <h2 className='display-6 mb-1'>Rate Us on Google</h2>

            <div className="rate-us-stars">
              <span className="star"><FontAwesomeIcon icon={faStar} /></span>
              <span className="star"><FontAwesomeIcon icon={faStar} /></span>
              <span className="star"><FontAwesomeIcon icon={faStar} /></span>
              <span className="star"><FontAwesomeIcon icon={faStar} /></span>
              <span className="star"><FontAwesomeIcon icon={faStar} /></span>
            </div>
            </div>
          </a>

        </div>
      </div>
      {/* <ParallaxImageWithTextBG
        text='AQTRA'
        imageSrc='https://images.unsplash.com/photo-1536264911542-668b0180d5a1?ixlib=rb-0.3.5&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ&s=a9a32743f06349efc39aeae90f047e9f' /> */}

      <div className='map-con position-relative'>
        <div className='position-absolute w-100 h-100' style={{ backgroundColor: '#87dfa42a' }}></div>
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6073.730568745681!2d50.215628220599164!3d26.298611262411967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49e9b6ccd2550f%3A0xc7a0c8c13763851!2sAQTRA!5e0!3m2!1sen!2ssa!4v1765628503985!5m2!1sen!2ssa" width="100%" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
      </div>


    </>
  );
};

export default ContactPage;