import 'bootstrap/dist/css/bootstrap.min.css';
import { CheckCircle, Award, Users, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LogoIcon from '@/assets/logo-icon.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const About = () => {
  const { t } = useTranslation();

  const defaultFeatures = [
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

  const translatedFeatures = t('homeAbout.features', { returnObjects: true }) as Array<{ title: string; description: string }> | string;
  const features = Array.isArray(translatedFeatures) ? translatedFeatures : defaultFeatures;

  const translatedListItems = t('homeAbout.listItems', { returnObjects: true }) as string[] | string;
  const listItems = Array.isArray(translatedListItems)
    ? translatedListItems
    : [
        'Licensed & Certified Engineers',
        'Comprehensive Project Management',
        '24/7 Support & Maintenance',
        'Sustainable & Energy-Efficient Solutions',
      ];

  return (
    <section id="about" className="py-5 bg-white position-relative overflow-hidden">
        <div className="section-header text-center mb-5" data-aos="fade-up">
          <div className="section-title">
            <h2>
              <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-primary" />
              {t('homeAbout.title')}
            </h2>
          </div>
        </div>

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

            <p className="text-muted">
              {t('homeAbout.paragraph1')}
            </p>
            <p className="text-muted">
              {t('homeAbout.paragraph2')}
            </p>
            <p className="text-muted">
              {t('homeAbout.paragraph3')}
            </p>

            <ul className="list-unstyled mt-4">
              {listItems.map((item, index) => (
                <li key={index} className="d-flex align-items-center mb-2">
                  <CheckCircle className="text-primary me-2" size={24} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Features */}
          <div className="col-lg-6" data-aos="fade-left">
            <div className="row justify-content-center g-3">
              {features.map((feature, index) => {
                const featureWithIcon = {
                  ...feature,
                  icon: (defaultFeatures[index]?.icon) || Award,
                } as typeof defaultFeatures[number];
                const Icon = featureWithIcon.icon;
                return (
                  <div
                    key={index}
                    className="col-10 col-md-12 p-3 rounded bg-light shadow-sm"
                    data-aos="fade-left"
                    data-aos-delay={index * 100}
                  >
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <Icon className="text-primary" size={32} />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">{featureWithIcon.title}</h5>
                        <p className="text-muted mb-0">{featureWithIcon.description}</p>
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
