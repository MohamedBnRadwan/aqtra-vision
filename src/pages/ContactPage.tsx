import React, { useEffect } from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import Contact from '@/components/Contact';

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
      </div>
    </>
  );
};

export default ContactPage;