import 'bootstrap/dist/css/bootstrap.min.css';
import { CheckCircle, Award, Users, Lightbulb } from 'lucide-react';
import LogoIcon from '@/assets/logo-icon.png';
import Marquee from './Marquee';

const About = () => {
  const features = [
    {
      icon: Award,
      title: 'Quality Excellence',
      description: 'Committed to delivering the highest standards in every project',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Skilled professionals with years of engineering experience',
    },
    {
      icon: Lightbulb,
      title: 'Innovative Solutions',
      description: 'Cutting-edge technology integrated into practical applications',
    },
  ];

  return (
    <section id="about" className="py-5 bg-white position-relative overflow-hidden">
      {/* Background Watermark */}
      <div
        className="position-absolute top-50 end-0 translate-middle-y opacity-50 w-50 h-auto pointer-events-none"
        style={{
          backgroundImage: `url(${LogoIcon})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          height: '600px',
        }}
      ></div>

      <div className="container position-relative z-1">
        <div className="row align-items-center g-4">
          {/* Left Content */}
          <div className="col-lg-6" data-aos="fade-right">
            <h2 className="mb-4">About AQTRA</h2>
            <p className="text-muted">
              AQTRA is a leading engineering and contracting company dedicated to delivering integrated solutions across multiple disciplines. Our commitment to accuracy and quality is reflected in every project we undertake.
            </p>
            <p className="text-muted">
              From smart home automation to sustainable solar energy systems, we combine technical expertise with innovative thinking to create solutions that enhance modern living and business operations.
            </p>
            <p className="text-muted">
              Our comprehensive service portfolio includes HVAC systems, plumbing, electrical installations, and network infrastructure – all designed to meet the evolving needs of our clients.
            </p>

            <ul className="list-unstyled mt-4">
              {[
                'Licensed & Certified Engineers',
                'Comprehensive Project Management',
                '24/7 Support & Maintenance',
                'Sustainable & Energy-Efficient Solutions',
              ].map((item, index) => (
                <li key={index} className="d-flex align-items-center mb-2">
                  <CheckCircle className="text-primary me-2" size={24} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Features */}
          <div className="col-lg-6" data-aos="fade-left">
            <div className="row g-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="col-md-12 p-3 rounded bg-light shadow-sm"
                    data-aos="fade-left"
                    data-aos-delay={index * 100}
                  >
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <Icon className="text-primary" size={32} />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">{feature.title}</h5>
                        <p className="text-muted mb-0">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
