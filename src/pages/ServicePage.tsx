import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import servicesMedia from '@/Data/ServicesMedia.json';
import servicesInfo from '@/Data/Services.json';
import HeaderBanner from '@/components/HeaderBanner';
import './ServicePage.css';

const ServicePage: React.FC = () => {
    const { t } = useTranslation();
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
                    title={t('servicePage.notFoundTitle')}
                    subtitle={t('servicePage.notFoundSubtitle')}
                    backgroundImage="/path-to-default-banner.jpg"
                />
                <div className="container py-5">
                    <p>{t('servicePage.notFoundBody')}</p>
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
                title={t(`servicesData.${service.id}.title`, { defaultValue: service.title })}
                subtitle={t('servicePage.subtitle')}
                backgroundImage={service.headerImage}
            />
            <div className="container py-5">
                <Link to="/services" className="btn btn-outline-primary mb-4"><ChevronLeft /> {t('servicePage.backToServices')}</Link>
                {service.solutionPage
                    && <Link to={`${service.solutionPage}`}
                        className="btn btn-outline-light float-end mb-4">
                        <img src={serviceInfo.logoText} alt={t('servicePage.solutionPageAlt')} />
                    </Link>}
                <h3 className='align-baseline align-items-baseline d-flex'>
                    <img src={serviceInfo.logoIcon} width='50px' alt={t('servicePage.solutionPageAlt')} />
                    {t(`servicesData.${service.id}.title`, { defaultValue: service.title })}
                </h3>
                <div dangerouslySetInnerHTML={{ __html: t(`servicesData.${service.id}.description`, { defaultValue: service.description }) }}></div>
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