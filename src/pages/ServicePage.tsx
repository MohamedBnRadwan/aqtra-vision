import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import servicesData from '@/Data/Services.json';
import HeaderBanner from '@/components/HeaderBanner';

const ServicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const service = servicesData.find((service) => service.id === id);

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
        subtitle={service.description}
        backgroundImage="/path-to-service-banner.jpg"
      />
      <div className="container py-5">
        <h3>{service.title}</h3>
        <p>{service.description}</p>
        <ul className="list-unstyled">
          {service.items.map((item, index) => (
            <li key={index} className="d-flex align-items-start">
              <span className="text-success me-2">•</span>
              <span className="text-muted">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default ServicePage;