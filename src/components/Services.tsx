import { Wifi, Leaf, AirVent, Droplets, Zap, Network, FireExtinguisher } from 'lucide-react';
import ScrollImageEffect from './ScrollImageEffect';

const services = [
  {
    icon: Leaf,
    title: 'Solar Energy',
    description: 'Sustainable power solutions for your future',
    items: ['Solar Panel Installation', 'On/Off/Hybrid Grid Systems', 'Battery Storage', 'EPC & Maintenance'],
    color: 'text-success',
  },
  {
    icon: Wifi,
    title: 'Smart Home Systems',
    description: 'Advanced home automation for modern living',
    items: ['Smart Lighting', 'Smart Locks', 'Voice Control', 'Home Theater', 'HVAC Automation'],
    color: 'text-primary',
  },
  {
    icon: AirVent,
    title: 'HVAC & Chiller',
    description: 'Climate control and air quality solutions',
    items: ['Ducting Fabrication', 'Chillers', 'Air Handling Units', 'Maintenance'],
    color: 'text-info',
  },
  {
    icon: Droplets,
    title: 'Plumbing',
    description: 'Complete water and drainage systems',
    items: ['Water & Drainage Systems', 'Heaters', 'Solar Hot Water', 'Leak Detection'],
    color: 'text-primary',
  },
  {
    icon: FireExtinguisher,
    title: 'Fire Fighting',
    description: 'Comprehensive fire safety solutions',
    items: ['Fire Suppression Systems', 'Fire Alarms', 'Emergency Lighting', 'Sprinkler Systems'],
    color: 'text-danger',
  },
  {
    icon: Zap,
    title: 'Electrical',
    description: 'Professional electrical installations',
    items: ['Power Distribution', 'Panels', 'Lighting', 'Backup Systems', 'Earthing'],
    color: 'text-warning',
  },
  {
    icon: Network,
    title: 'Network & Security',
    description: 'Modern IT infrastructure solutions',
    items: ['Structured Cabling', 'Wi-Fi', 'CCTV','PAVA Public Addres and Voice Alarm', 'Access Control', 'Data Rack Setup'],
    color: 'text-secondary',
  },
];

const Services = () => {
  return (
    <section id="services" className="py-5 bg-light">
      <div className="container">
        <div className="text-center mb-4" data-aos="fade-up">
          <h2 className="mb-3 text-dark">Our Services</h2>
          <p className="text-muted fs-5">
            Comprehensive engineering solutions tailored to your needs
          </p>
        </div>

        <div className="row g-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div className="col-md-4" key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-center align-items-center mb-3" style={{ height: '64px', width: '64px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
