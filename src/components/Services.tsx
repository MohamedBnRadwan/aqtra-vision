import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import servicesData from '@/Data/Services.json';
import servicesMedia from '@/Data/ServicesMedia.json';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Services = ({ col = "col-10 col-md-6 col-lg-4", showFeaturedOnly = false }) => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);

  return (
    <section>
      <div className="container">
        <div className="row justify-content-center g-4">
          {servicesData
            .filter(service => (showFeaturedOnly ? service.isHomeFeatured : true))
            .map((service, index) => {
              const title = t(`servicesData.${service.id}.title`, { defaultValue: service.title });
              const media = servicesMedia.find(m => m.id === service.id);
              const mediaHeader = media?.headerImage ? media.headerImage.split('#')[0] : undefined;
              const imageSrc = mediaHeader || service.logo || service.logoIcon;
              const logoIcon = service.logoIcon || service.logo;
              const isRTL = i18n.dir() === 'rtl';
              const gradientDirection = isRTL ? 'to top left' : 'to top right';
              const primaryStrong = '#119d60bf';
              const primarySoft = '#119d6059';
              const badgePosition = isRTL ? 'bottom-0 end-0' : 'bottom-0 start-0';
              return (
                <div className={col} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                  <Link to={`/services/${service.id}`} className="text-decoration-none">
                    <div
                      className="position-relative rounded-4 overflow-hidden shadow-sm w-100"
                      style={{ aspectRatio: '16 / 9', minHeight: '220px' }}
                    >
                      <img
                        src={imageSrc}
                        alt={title}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                        loading="lazy"
                      />
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                          background: `linear-gradient(${gradientDirection}, ${primaryStrong} 0%, ${primarySoft} 10%, rgba(13, 110, 253, 0) 75%)`,
                        }}
                        aria-hidden="true"
                      />
                      <span
                        className={`position-absolute ${badgePosition} m-3 px-3 py-2 fw-semibold rounded-3 shadow-sm text-white d-inline-flex align-items-center gap-2 flex-row`}
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(2px)' }}
                      >
                        {logoIcon && (
                          <img
                            src={logoIcon}
                            alt={title}
                            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                            loading="lazy"
                          />
                        )}
                        <span className="text-white">{title}</span>
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default Services;
