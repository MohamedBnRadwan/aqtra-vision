import React, { useEffect } from 'react';
import ServiceVideoSection from '@/components/ServiceVideoSection';
import Layout from '@/components/Layout';
import HeaderBanner from '@/components/HeaderBanner';

const services = [
  {
    videoUrl: '/videos/service1.mp4',
    title: 'Service 1',
    logoUrl: '/logos/service1-logo.png',
  },
  {
    videoUrl: '/videos/service2.mp4',
    title: 'Service 2',
    logoUrl: '/logos/service2-logo.png',
  },
  {
    videoUrl: '/videos/service3.mp4',
    title: 'Service 3',
    logoUrl: '/logos/service3-logo.png',
  },
];

const ServicesPage: React.FC = () => {
  // useEffect(() => {
  //   document.body.classList.add('body-bg-dark');
  //   return () => {
  //     document.body.classList.remove('body-bg-dark');
  //   };
  // }, []);

  return (
    <>
      <HeaderBanner
        title="Our Services"
        subtitle="Explore the wide range of services we offer to meet your needs."
        backgroundImage="/path-to-your-banner-image.jpg"
      />
      <div className="bg-dark">
        <h1 className="text-center text-4xl font-bold my-8 text-white">
          Our Services
        </h1>
        <ServiceVideoSection services={services} />
      </div>
    </>
  );
};

export default ServicesPage;