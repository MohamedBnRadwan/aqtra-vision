import React, { useEffect } from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import Contact from '@/components/Contact';
import ParallaxImageWithTextBG from '@/components/ParallaxImageWithTextBG';

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
          <ParallaxImageWithTextBG
text='AQTRA'
 imageSrc='https://images.unsplash.com/photo-1536264911542-668b0180d5a1?ixlib=rb-0.3.5&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ&s=a9a32743f06349efc39aeae90f047e9f' />
 
    </>
  );
};

export default ContactPage;