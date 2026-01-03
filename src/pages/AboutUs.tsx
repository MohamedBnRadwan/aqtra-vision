import HeaderBanner from '@/components/HeaderBanner';
import { faInfoCircle, faStar, faCertificate, faBullseye, faEye, faAtom } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AOS from 'aos';
import './AboutUs.css';

const AboutUs: React.FC = () => {
  const { t } = useTranslation();
  useEffect(() => {
    // window.scrollTo({ top: 0, behavior: 'smooth' });
    AOS.init({ duration: 1000, easing: 'ease-in-out', once: true });
  }, []);

  return (
    <>
      <HeaderBanner
        title={t('about.headerTitle')}
        subtitle={t('about.headerSubtitle')} />

      <div className="about-us">
        {/* Company Overview */}
        <section className="company-overview py-5">

          <div className="section-header text-center mb-5" data-aos="fade-up">
            <div className="section-title">
              <h2>
                <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-primary" />
                    {t('about.overviewTitle')}
              </h2>
            </div>
            <p className="text-muted my-2 fs-5">
                  {t('about.overviewDescription')}
            </p>
          </div>

        </section>

        {/* Sectors */}
        <section className="sectors py-5 bg-light">
          <div className="container">
            <div className="row">
              <div className="col-12 text-center mb-4" data-aos="fade-up">
                <div className="section-title mb-3">
                  <h2>{t('about.sectorsTitle')}</h2>
                </div>

                <ol className="list-group">
                  <li className="list-group-item mb-3">
                    <strong>{t('about.sector1Title')}</strong>
                    <p>{t('about.sector1Description')}</p>
                    <img src='/src/assets/info.svg' style={{ maxWidth: '350px' }} className='m-3' />
                  </li>

                  <li className="list-group-item mb-3">
                    <strong>{t('about.sector2Title')}</strong>
                    <p>{t('about.sector2Description')}</p>
                    <img src='/src/assets/smart-home.svg' style={{ maxWidth: '350px' }} className='m-3' />
                  </li>
                  <li className="list-group-item mb-3">
                    <strong>{t('about.sector3Title')}</strong>
                    <p>{t('about.sector3Description')}</p>
                    <img src='/src/assets/physics.svg' style={{ maxWidth: '350px' }} className='m-3' />
                  </li>
                  <li className="list-group-item mb-3">
                    <strong>{t('about.sector4Title')}</strong>
                    <p>{t('about.sector4Description')}</p>
                    <img src='/src/assets/quiet-street.svg' style={{ maxWidth: '350px' }} className='m-3' />
                  </li>
                  <li className="list-group-item mb-3">
                    <strong>{t('about.sector5Title')}</strong>
                    <p>{t('about.sector5Description')}</p>
                    <img src='/src/assets/programming.svg' style={{ maxWidth: '350px' }} className='m-3' />
                  </li>
                </ol>

              </div>
            </div>

          </div>
        </section>

        {/* Licenses & Certifications */}
        <section className="licenses py-5">
          <div className="container">
            <div className="mb-4 section-title">
              <h3 >
                {/* <FontAwesomeIcon icon={faCertificate} className="text-primary" /> */}
                {t('about.licensesTitle')}
              </h3>
            </div>
            <p>
              {t('about.licensesDescription')}
            </p>
          </div>
        </section>

        {/* Experience */}
        <section className="experience py-5 bg-light">
          <div className="container">
            <div className="mb-4 section-title">
              <h3 >
                {/* <FontAwesomeIcon icon={faStar} className="text-primary" /> */}
                {t('about.experienceTitle')}
              </h3>
            </div>
            <p>
              {t('about.experienceDescription')}
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="mission py-5">
          <div className="container">
            <div className="mb-4 section-title">
              <h3 >
                {/* <FontAwesomeIcon icon={faBullseye} className="text-primary" /> */}
                {t('about.missionTitle')}
              </h3>
            </div>
            <p>
              {t('about.missionDescription')}
            </p>
          </div>
        </section>

        {/* Vision */}
        <section className="vision py-5 bg-light">
          <div className="container">
            <div className="mb-4 section-title">
              <h3 >
                {/* <FontAwesomeIcon icon={faEye} className="text-primary" /> */}
                {t('about.visionTitle')}
              </h3>
            </div>
            <p>
              {t('about.visionDescription')}
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="values py-5">
          <div className="container">
            <div className="mb-4 section-title">
              <h3 >
                {/* <FontAwesomeIcon icon={faAtom} className="text-primary" /> */}
                {t('about.valuesTitle')}
              </h3>
            </div>
            <ul className="list-unstyled">
              {(t('about.valuesList', { returnObjects: true }) as string[]).map((value, idx) => (
                <li className="mb-2" key={idx}>{value}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutUs;