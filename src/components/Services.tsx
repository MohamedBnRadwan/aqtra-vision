import React, { useEffect } from 'react';
import { Wifi, Leaf, AirVent, Droplets, Zap, Network, FireExtinguisher } from 'lucide-react';
import ScrollImageEffect from './ScrollImageEffect';
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

const Services = ({ col = "col-md-6 col-lg-4" }) => {
  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);

  return (
    <section>
      <div className="container">
        <div className="row g-4">
          {servicesData.map((service, index) => {
            const Icon = iconMap[service.icon];
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
                      <h5 className="card-title text-center">{service.title}</h5>
                      <p className="card-text text-center text-muted">{service.description}</p>

                      <ul className="list-unstyled mt-3">
                        {service.items.map((item, i) => (
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
