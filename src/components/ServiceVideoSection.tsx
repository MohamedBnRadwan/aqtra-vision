import React from 'react';
import { Link } from 'react-router-dom';
import servicesCatalog from '@/Data/Services.json';
import servicesMedia from '@/Data/ServicesMedia.json';
import './ServiceVideoSection.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faStar } from '@fortawesome/free-solid-svg-icons';

export interface ServiceOverviewItem {
  title: string;
  description?: string;
  descriptionHtml?: string;
  highlights?: string[];
  imageUrl?: string;
  videoUrl?: string;
  serviceLink: string;
  solutionsLink?: string;
  portfolioLink: string;
  logoIcon?: string;
  logoText?: string;
}

interface ServiceVideoSectionProps {
  services?: ServiceOverviewItem[];
  serviceIds?: string[];
}

const mediaById = new Map(servicesMedia.map((item) => [item.id, item]));

export const buildServiceOverviewData = (ids?: string[]): ServiceOverviewItem[] => {
  const filteredServices = ids?.length
    ? servicesCatalog.filter((svc) => ids.includes(svc.id))
    : servicesCatalog;

  return filteredServices.map((svc) => {
    const media = mediaById.get(svc.id);
    const imageFromMedia = media?.headerImage || media?.images?.[0];
    const videoFromMedia = media?.videoUrl || svc.videoUrl;

    return {
      title: svc.title,
      description: svc.description,
      descriptionHtml: media?.description,
      highlights: svc.items,
      imageUrl: imageFromMedia,
      videoUrl: videoFromMedia,
      serviceLink: `/services/${svc.id}`,
      solutionsLink: media?.solutionPage || '/solutions',
      portfolioLink: `/portfolio?filter=${svc.id}`,
      logoIcon: svc.logoIcon,
      logoText: svc.logoText
    } satisfies ServiceOverviewItem;
  });
};

const ServiceVideoSection: React.FC<ServiceVideoSectionProps> = ({ services, serviceIds }) => {
  const resolvedServices = services ?? buildServiceOverviewData(serviceIds);

  return (
    <section className="service-overview-section py-5">
      <div className="container">
        <div className="row g-4">
          {resolvedServices.map((service) => {
            const hasImage = Boolean(service.imageUrl);
            const hasVideo = Boolean(service.videoUrl);
            const showVideo = !hasImage && hasVideo;
            const mediaSrc = service.imageUrl || service.videoUrl;

            return (
              <div className="col-12" key={service.title}>
                <div className="card service-overview-card shadow-sm border-0 overflow-hidden">
                  <div className="row row-reverse g-0 align-items-stretch">
                    <div className="col-lg-6 p-4 p-lg-5 d-flex flex-column justify-content-center">
                      <span className="badge badge-overview bg-primary-subtle text-primary fw-semibold rounded-pill px-3 py-2 small text-uppercase tracking-wide">
                        AQTRA {service.title} Service Overview
                      </span>
                      <h3 className="mt-3 mb-3 display-6 fs-2 text-dark fw-semibold">{service.title}</h3>
                      {service.descriptionHtml ? (
                        <div
                          className="text-secondary mb-3 lh-lg"
                          dangerouslySetInnerHTML={{ __html: service.descriptionHtml }}
                        />
                      ) : (
                        <p className="text-secondary mb-3 lh-lg">{service.description}</p>
                      )}

                      {service.highlights?.length ? (
                        <ul className="list-unstyled mb-3 text-body small">
                          {service.highlights.map((item) => (
                            <li className="d-flex align-items-start gap-2 highlight-item" key={item}>
                              <span className="bullet mt-1" aria-hidden="true" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}


                    </div>
                    <div className="col-lg-6">
                      <div className="media-wrapper h-100 position-relative">
                        <div className="media-frame position-relative">
                          {mediaSrc ? (
                            showVideo ? (
                              <video
                                className="media-content w-100 h-100"
                                src={service.videoUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                              />
                            ) : (
                              <img
                                src={service.imageUrl}
                                alt={service.title}
                                className="media-content w-100 h-100"
                                loading="lazy"
                              />
                            )
                          ) : (
                            <div className="media-placeholder d-flex align-items-center justify-content-center text-secondary">
                              Media coming soon
                            </div>
                          )}
                          <div className="media-overlay" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='card-footer bg-white border-0 pt-0 px-4 pb-4'>
                    <div className="d-flex flex-column flex-lg-row align-items-stretch justify-content-between gap-3 mt-3">
                      <div className="d-flex flex-wrap gap-2">
                        <Link
                          to={service.serviceLink}
                          className="btn btn-primary rounded-pill px-4 shadow-sm hover-lift d-inline-flex align-items-center gap-2"
                          aria-label={`${service.title} service page`}
                        >
                          <span className="btn-icon" aria-hidden="true"><FontAwesomeIcon icon={faArrowRight} /></span>
                          <span>More about {service.title}</span>
                        </Link>

                        <Link
                          to={service.portfolioLink}
                          className="btn btn-outline-primary rounded-pill px-4 shadow-sm hover-lift d-inline-flex align-items-center gap-2"
                          aria-label={`${service.title} portfolio`}
                        >
                          <span className="btn-icon" aria-hidden="true">
                            <FontAwesomeIcon icon={faStar} />
                          </span>
                          <span>Portfolio</span>
                        </Link>
                      </div>
                      <Link to={service.solutionsLink || '/solutions'}
                        className="text-decoration-none align-self-end">
                        <div className="card solution-card rounded-pill border-0 hover-lift shadow-sm h-100">
                          <div className="card-body p-1">
                            <div className="d-flex justify-content-between align-items-center">
                              <img
                                src={service.logoIcon}
                                width={70}
                                alt="Solution Page"
                                style={{ marginBottom: '12px' }}
                              />
                              <h3 className="display-6 text-truncate mb-0"
                                style={{ marginLeft: "-15px" }}>
                                Solutions
                              </h3>
                              <img
                                src={service.logoText}
                                width={100}
                                alt={`${service.title} logo`}
                              />
                            </div>
                          </div>
                        </div>
                      </Link>

                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceVideoSection;