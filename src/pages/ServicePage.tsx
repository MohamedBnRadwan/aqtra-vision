import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import servicesMedia from '@/Data/ServicesMedia.json';
import servicesInfo from '@/Data/Services.json';
import HeaderBanner from '@/components/HeaderBanner';
import  './ServicePage.css';

const ServicePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const service = servicesMedia.find((service) => service.id === id);
    const serviceInfo = servicesInfo.find((service) => service.id === id);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [id]);

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

    
	// function updateNavbarBrandImages() {
	// 	const navbarBrandImages = document.querySelectorAll<HTMLImageElement>('.navbar-brand img.logo-icon, .navbar-brand img.logo-txt');
	// 	navbarBrandImages.forEach((img) => {
    //   if (img.classList.contains('logo-txt')) {
    //     img.src = service.logoText; 
    //     return;
    //   }
	// 		img.src = service.logoIcon; 
	// 	});
	// }

	// useEffect(() => {
	// 	updateNavbarBrandImages();
	// }, [id]);

    return (
        <>
            <HeaderBanner
                title={service.title}
                subtitle="Explore our comprehensive solutions."
                backgroundImage={service.headerImage}
            />
            <div className="container py-5">
                <Link to="/services" className="btn btn-outline-primary mb-4"><ChevronLeft  /> Services</Link>
                {service.solutionPage && <Link to={`${service.solutionPage}`} className="btn btn-outline-primary float-end mb-4"><img src='/src/assets/solar/solar-logo-txt.png' alt="Solution Page" /></Link> }
                <h3>{service.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: service.description }}></div>
                {service.videoUrl && (
                    <div className="mt-4">
              
                    </div>
                )}

      {/* <ParallaxImageSection imageUrl={'/src/assets/hvac/7.jpg'} heading="Your Text Here" summary={'Your summary here'} />
      <ParallaxImageSection imageUrl={'/src/assets/hvac/5.jpg'} heading="Your Text Here" summary={'Your summary here'} />
      <ParallaxImageSection imageUrl={'/src/assets/hvac/4.jpg'} heading="Your Text Here" summary={'Your summary here'} /> */}

                <div className="mt-4">
                    <div className="row">
                        <div className="col-md-12">
                            <ul className="gallery-con">
                                {service.images.map((image, index) => (
                                    <li key={index} className="gallery-col mb-3">
                                        <img src={image} alt={service.title} className="img-fluid shadow-sm" />
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