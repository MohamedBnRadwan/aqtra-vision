import React, { useEffect } from 'react';
import ServiceVideoSection from '@/components/ServiceVideoSection';
import Layout from '@/components/Layout';
import HeaderBanner from '@/components/HeaderBanner';
import HeaderImage from '@/assets/hero-bg-2.jpg';
import SolorBannels from '@/assets/intro-bg.mp4';
import SolorInstall from '@/assets/solor-install.mp4';
import KhobarLocation from '@/assets/khober-location.mp4';
import Services from '@/components/Services';
import { Link } from 'react-router-dom';

const services = [
  {
    description: [
      'We provide top-notch engineering consulting services tailored to your project needs. Our team of experts leverages cutting-edge technology and industry best practices to deliver innovative solutions that drive success.',
      'From initial concept development to final implementation, we work closely with our clients to ensure every aspect of the project is executed with precision and excellence.',
    ],
    videoUrl: SolorBannels,
    title: 'Service 1',
  },
  {
    description: [
      'Our comprehensive project management services ensure that your projects are completed on time, within budget, and to the highest quality standards.',
      'We utilize proven methodologies and tools to coordinate resources, manage risks, and communicate effectively with all stakeholders throughout the project lifecycle.',
    ],
    videoUrl: SolorInstall,
    title: 'Service 2',
  },
  {
    description: [
      'We specialize in sustainable engineering solutions that minimize environmental impact while maximizing efficiency and performance.',
      'Our team is dedicated to integrating green technologies and practices into every project, helping our clients achieve their sustainability goals.',
    ],
    videoUrl: KhobarLocation,
    title: 'Service 3',
  },
];

const ServicesPage: React.FC = () => {

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <HeaderBanner
        title="Our Services"
        subtitle="Explore the wide range of services we offer to meet your needs."
        backgroundImage={HeaderImage}
      />
      <div>
        <div className='container-fluid'>
          <div className='my-5 row'>
            <div className="col-12">
              <div className="container">
                <div className="row">
                  <div className={"col-md-6"} data-aos="fade-up" data-aos-delay={100}>
                    <Link to={`/services/`} className="text-decoration-none">
                      <div className="card rounded border-0 shadow-sm h-100">
                        <div className="card-body">
                          <div
                            className="d-flex justify-content-center align-items-center mb-3"
                            style={{
                              height: '64px',
                              width: '64px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '8px',
                            }}
                          >
                          </div>
                          <h5 className="card-title text-center"></h5>
                          <p className="card-text text-center text-muted">asasasa</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className='my-5 row'>
            <div className='col-md-10 offset-md-1'>
              <Services col="col-md-6" />
              {/* {services.map((service, index) => (
                <div className='card-body mb-5 p-4 shadow-sm'>
                <ServiceVideoSection
                key={index}
                title={service.title}
                description={service.description}
                videoUrl={service.videoUrl}
                />
                </div>
                ))} */}

            </div>
          </div>


        </div>
      </div>
    </>
  );
};

export default ServicesPage;