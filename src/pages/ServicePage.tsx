import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import servicesMedia from '@/Data/ServicesMedia.json';
import HeaderBanner from '@/components/HeaderBanner';
import ServiceVideoSection from '@/components/ServiceVideoSection';
import  './ServicePage.css';
import ParallaxImageSection from '@/components/ParallaxImageSection';

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
                backgroundImage="/src/assets/hvac/8.jpg"
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

      <ParallaxImageSection imageUrl={'/src/assets/hvac/7.jpg'} heading="Your Text Here" summary={'Your summary here'} />

      <ParallaxImageSection imageUrl={'/src/assets/hvac/5.jpg'} heading="Your Text Here" summary={'Your summary here'} />
      <ParallaxImageSection imageUrl={'/src/assets/hvac/4.jpg'} heading="Your Text Here" summary={'Your summary here'} />

                <div className="mt-4">
                    <div className="row">
                        <div className="col-md-12">
                            <ul className="gallery-con">
                                {service.images.map((image, index) => (
                                    <li key={index} className="gallery-col mb-3">
                                        <img src={image} alt={service.title} className="img-fluid rounded shadow-sm" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ServicePage;