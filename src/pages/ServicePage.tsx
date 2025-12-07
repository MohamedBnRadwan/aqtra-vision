import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import servicesMedia from '@/Data/ServicesMedia.json';
import HeaderBanner from '@/components/HeaderBanner';
import ServiceVideoSection from '@/components/ServiceVideoSection';

const ServicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const service = servicesMedia.find((service) => service.id === id);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!service) {
    return (
      <>
        <HeaderBanner
          title="Service Not Found"
          subtitle="The requested service could not be found."
          backgroundImage="/path-to-default-banner.jpg"
        />
        <div className="container py-5">
          <p>Sorry, the service you are looking for does not exist.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderBanner
        title={service.title}
        subtitle="Explore our comprehensive solutions."
        backgroundImage="/path-to-service-banner.jpg"
      />
      <div className="container py-5">
        <h3>{service.title}</h3>
        <div dangerouslySetInnerHTML={{ __html: service.description }}></div>
        {service.videoUrl && (
          <div className="mt-4">
            <ServiceVideoSection
              title={service.title}
              description={[service.description]}
              videoUrl={service.videoUrl}
            />
          </div>
        )}
        <div className="mt-4">
          <h4>Media</h4>
          <div className="row">
            {service.images.map((image, index) => (
              <div key={index} className="col-md-4 mb-3">
                <img src={image} alt={service.title} className="img-fluid rounded shadow-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicePage;