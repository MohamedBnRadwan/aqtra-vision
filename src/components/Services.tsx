import React, { useEffect } from 'react';
import { Wifi, Leaf, AirVent, Droplets, Zap, Network, FireExtinguisher } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import servicesData from '@/Data/Services.json';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

const iconMap = {
  Leaf,
  Wifi,
  AirVent,
  Droplets,
  Zap,
  Network,
  FireExtinguisher,
};

const Services = ({ col = "col-10 col-md-6 col-lg-4", showFeaturedOnly = false }) => {
  const { t } = useTranslation();

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
              const Icon = iconMap[service.icon];
              const title = t(`servicesData.${service.id}.title`, { defaultValue: service.title });
              const description = t(`servicesData.${service.id}.description`, { defaultValue: service.description });
              const translatedItems = t(`servicesData.${service.id}.items`, { returnObjects: true }) as string[] | string;
              const items = Array.isArray(translatedItems) ? translatedItems : service.items;
              return (
                <div className={col} key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                  <Link to={`/services/${service.id}`} className="text-decoration-none">
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
                        <Icon className={`fs-2 ${service.color}`} />
                      </div>
                      <h5 className="card-title text-center">{title}</h5>
                      <p className="card-text text-center text-muted">{description}</p>

                      <ul className="list-unstyled mt-3">
                        {items.map((item, i) => (
                          <li key={i} className="d-flex align-items-start">
                            <span className="text-success me-2">•</span>
                            <span className="text-muted">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
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
