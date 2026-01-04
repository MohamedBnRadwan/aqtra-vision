import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import servicesMedia from '@/Data/ServicesMedia.json';
import servicesInfo from '@/Data/Services.json';
import HeaderBanner from '@/components/HeaderBanner';
import './ServicePage.css';

const ServicePage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const service = servicesMedia.find((service) => service.id === id);
    const serviceInfo = servicesInfo.find((service) => service.id === id);
    const isRTL = i18n.dir() === 'rtl';

    // Prefer localized fullDescription; fall back to Services.json/media content
    const localizedFullDescription = t(`servicesData.${service?.id}.fullDescription`, {
        defaultValue: serviceInfo?.fullDescription || serviceInfo?.description || service?.description || '',
    });

    // Prefer localized systemSelectionGuide; fall back to Services.json content
    const guide = t(`servicesData.${service?.id}.systemSelectionGuide`, {
        returnObjects: true,
        defaultValue: serviceInfo?.systemSelectionGuide || null,
    }) as typeof serviceInfo.systemSelectionGuide | null;

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
                {service.solutionPage && (
                    <Link
                        to={`${service.solutionPage}`}
                        className={`btn btn-outline-primary ${isRTL ? 'float-start' : 'float-end'} mb-4 d-inline-flex align-items-center gap-3 px-4 py-3 shadow-sm rounded-pill`}
                        style={{ minWidth: '220px' }}
                    >
                        {serviceInfo?.logoIcon && (
                            <img
                                src={serviceInfo.logoIcon}
                                alt={t('servicePage.solutionPageAlt')}
                                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                                loading="lazy"
                            />
                        )}
                        <span className="fw-semibold small flex-grow-1 text-center text-primary">
                            {t('servicePage.solutionsCta', { defaultValue: 'الحلول' })}
                        </span>
                        {serviceInfo?.logoText && (
                            <img
                                src={serviceInfo.logoText}
                                alt={t('servicePage.solutionPageAlt')}
                                style={{ height: '28px', objectFit: 'contain' }}
                                loading="lazy"
                            />
                        )}
                    </Link>
                )}



                <h3 className='align-baseline align-items-baseline d-flex'>
                    <img src={serviceInfo.logoIcon} width='50px' alt={t('servicePage.solutionPageAlt')} />
                    {t(`servicesData.${service.id}.title`, { defaultValue: service.title })}
                </h3>
                {service.videoUrl && service.videoUrl !== '' && (
                    <div className="container py-3">
                        <div className="service-page__hero-video mb-4">
                            <video
                                src={service.videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-100 rounded shadow-sm"
                                aria-label={service.title + ' preview video'}
                            />
                        </div>
                    </div>
                )}

                {/* Related solution buttons (e.g., solar calculation, solution pages) */}
                {serviceInfo?.relatedSolutions && serviceInfo.relatedSolutions.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mt-3">
                        {serviceInfo.relatedSolutions.map((rs) => {
                            const path = rs.startsWith('/') ? rs : `/${rs}`;
                            let label = rs.replace(/-/g, ' ');
                            if (rs.includes('calculation')) label = t('heroSlider.ctaCalculator', { defaultValue: 'Solar calculator' });
                            else if (rs === 'solar-solutions') label = t('solutionsPage.cards.solar', { defaultValue: 'Solar solutions' });
                            else {
                                // attempt to humanize fallback
                                label = rs.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                            }

                            return (
                                <Link key={rs} to={path} className="btn btn-outline-secondary px-3 py-2 shadow-sm">
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                )}

                {guide && (
                    <section className="mt-4">
                        <h4 className="mb-3">
                            {t('servicePage.systemSelectionGuideTitle', { defaultValue: 'System Selection Guide' })}
                        </h4>
                        {guide.overview && <p className="mb-3">{guide.overview}</p>}

                        {guide.options && guide.options.length > 0 && (
                            <div className="mb-3">
                                <h6 className="mb-2">{t('servicePage.systemOptionsTitle', { defaultValue: 'Options' })}</h6>
                                <div className="row g-3">
                                    {guide.options.map((opt, idx) => (
                                        <div className="col-md-6" key={idx}>
                                            <div className="p-3 border rounded-3 h-100 shadow-sm">
                                                {opt.type && <h6 className="mb-2">{opt.type}</h6>}
                                                {opt.bestFor && (
                                                    <p className="mb-1"><strong>{t('servicePage.bestForLabel', { defaultValue: 'Best for' })}:</strong> {opt.bestFor}</p>
                                                )}
                                                {opt.whenToChoose && (
                                                    <p className="mb-1"><strong>{t('servicePage.whenToChooseLabel', { defaultValue: 'When to choose' })}:</strong> {opt.whenToChoose}</p>
                                                )}
                                                {opt.notes && (
                                                    <p className="mb-0 text-muted small">{opt.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {guide.keyFactors && guide.keyFactors.length > 0 && (
                            <div className="mb-3">
                                <h6 className="mb-2">{t('servicePage.keyFactorsTitle', { defaultValue: 'Key factors' })}</h6>
                                <ul className="ps-3 mb-0">
                                    {guide.keyFactors.map((factor, idx) => (
                                        <li key={idx}>{factor}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {guide.typicalDeliverables && guide.typicalDeliverables.length > 0 && (
                            <div className="mb-3">
                                <h6 className="mb-2">{t('servicePage.typicalDeliverablesTitle', { defaultValue: 'Typical deliverables' })}</h6>
                                <ul className="ps-3 mb-0">
                                    {guide.typicalDeliverables.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                )}

                <div className="mt-4" dangerouslySetInnerHTML={{ __html: localizedFullDescription }} />

                {/* <ParallaxImageSection imageUrl={'/src/assets/hvac/7.jpg'} heading="Your Text Here" summary={'Your summary here'} />
      <ParallaxImageSection imageUrl={'/src/assets/hvac/5.jpg'} heading="Your Text Here" summary={'Your summary here'} />
      <ParallaxImageSection imageUrl={'/src/assets/hvac/4.jpg'} heading="Your Text Here" summary={'Your summary here'} /> */}
                {/* 
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
                </div> */}
            </div>
        </>
    );
};

export default ServicePage;