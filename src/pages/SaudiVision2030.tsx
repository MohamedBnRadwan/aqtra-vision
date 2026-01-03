import HeaderBanner from '@/components/HeaderBanner';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SaudiVision2030: React.FC = () => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <>
            <HeaderBanner title={t('saudiVision.title')} backgroundImage='/src/assets/saudi-vision-banner-1.webp' subtitle={t('saudiVision.subtitle')} />
            <div className="saudi-vision-2030">

                {/* Overview */}
                <section className="overview py-5">
                    <div className="container">
                        <h2 className="mb-4">{t('saudiVision.overviewTitle')}</h2>
                        <p>
                            {t('saudiVision.overviewText')}
                        </p>
                    </div>
                </section>

<div className='position-relative'>

                <img src="/src/assets/saudi_vision_2030_logo.svg" style={{width: 350, opacity: 0.1}} alt={t('saudiVision.logoAlt')} className="position-absolute top-50 start-50 translate-middle" />
</div>

                {/* The Three Pillars / Themes */}
                <section className="pillars py-5 bg-light">
                    <div className="container">
                        <h2 className="mb-4">{t('saudiVision.pillarsTitle')}</h2>

                        {/* Vibrant Society */}
                        <div className="pillar mb-5">
                            <h3>{t('saudiVision.pillarVibrantTitle')}</h3>
                            <p>
                                {t('saudiVision.pillarVibrantText')}
                            </p>
                        </div>

                        {/* Thriving Economy */}
                        <div className="pillar mb-5">
                            <h3>{t('saudiVision.pillarThrivingTitle')}</h3>
                            <p>
                                {t('saudiVision.pillarThrivingText')}
                            </p>
                        </div>

                        {/* Ambitious Nation */}
                        <div className="pillar">
                            <h3>{t('saudiVision.pillarAmbitiousTitle')}</h3>
                            <p>
                                {t('saudiVision.pillarAmbitiousText')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Key Targets & Goals */}
                <section className="targets py-5">
                    <div className="container">
                                                <h2 className="mb-4">{t('saudiVision.targetsTitle')}</h2>
                                                <ul className="list-unstyled">
                                                        {(Array.isArray(t('saudiVision.targetsList', { returnObjects: true }))
                                                            ? (t('saudiVision.targetsList', { returnObjects: true }) as string[])
                                                            : [])
                                                            .map((item, idx) => (
                                                                <li className="mb-3" key={idx}>{item}</li>
                                                            ))}
                                                </ul>
                    </div>
                </section>

                {/* Impact & Opportunities */}
                <section className="impact py-5 bg-light">
                    <div className="container">
                        <h2 className="mb-4">{t('saudiVision.impactTitle')}</h2>
                        <p>
                            {t('saudiVision.impactText')}
                        </p>
                    </div>
                </section>

                {/* Footer / Navigation Element */}
                <footer className="footer py-4 text-center">
                    <div className="container">
                        <a href="https://www.vision2030.gov.sa" target="_blank" rel="noopener noreferrer">
                            <img src="/src/assets/saudi_vision_2030_logo.svg" width="250px" alt="Saudi Vision 2030 Logo" className="mb-3" />
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default SaudiVision2030;