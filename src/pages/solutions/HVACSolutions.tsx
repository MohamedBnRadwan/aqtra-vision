import React from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import ParallaxImageSection from '@/components/ParallaxImageSection';
import { useTranslation } from 'react-i18next';

const HVACSolutions: React.FC = () => {
    const { t } = useTranslation();
    return (
        <>
            <HeaderBanner
                title={t('hvacSolutions.title')}
                subtitle={t('hvacSolutions.subtitle')}
                backgroundImage="/src/assets/hvac/8.jpg"
            />
            <section className="container-fluid py-5">
                <div className="text-center mb-5">
                    <div >

                    <img src='/src/assets/hvac/hvac-logo-icon.png' width={100} alt="HVAC Solutions" />
                    <img src='/src/assets/hvac/hvac-logo-txt.png' width={150} alt="HVAC Solutions" />
                    </div>
                    <h2 className="display-5">{t('hvacSolutions.heading')}</h2>
                    <p className="text-muted">{t('hvacSolutions.description')}</p>
                </div>

                <div className="row justify-content-center g-4">

                    {/* Ducting Fabrication */}
                    <ParallaxImageSection imageUrl={'/src/assets/hvac/13.jpg'} overlay heading={t('hvacSolutions.ducting.title')} summary={t('hvacSolutions.ducting.summary')} />
                    <div className="col-md-10">
                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <h4 className="card-title display-4">{t('hvacSolutions.ducting.title')}</h4>
                                <p className="card-text">{t('hvacSolutions.ducting.body')}</p>
                                <h6 className="display-6 mt-3">{t('hvacSolutions.solutionsHeading')}</h6>
                                <ul>
                                    {(t('hvacSolutions.ducting.list', { returnObjects: true }) as string[]).map(item => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Chillers */}
                    <ParallaxImageSection imageUrl={'/src/assets/hvac/1.jpg'} overlay heading={t('hvacSolutions.chillers.title')} summary={t('hvacSolutions.chillers.summary')} />
                    <div className="col-md-10">

                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <h4 className="card-title display-4">{t('hvacSolutions.chillers.title')}</h4>
                                <p className="card-text">{t('hvacSolutions.chillers.body')}</p>
                                <h6 className="display-6 mt-3">{t('hvacSolutions.solutionsHeading')}</h6>
                                <ul>
                                    {(t('hvacSolutions.chillers.list', { returnObjects: true }) as string[]).map(item => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Air Handling Units */}
                    <ParallaxImageSection imageUrl={'/src/assets/hvac/8.jpg'} heading={t('hvacSolutions.ahu.title')} summary={t('hvacSolutions.ahu.summary')} />
                    <div className="col-md-10">

                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <h4 className="card-title display-4">{t('hvacSolutions.ahu.title')}</h4>
                                <p className="card-text">{t('hvacSolutions.ahu.body')}</p>
                                <h6 className="display-6 mt-3">{t('hvacSolutions.solutionsHeading')}</h6>
                                <ul>
                                    {(t('hvacSolutions.ahu.list', { returnObjects: true }) as string[]).map(item => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Maintenance */}
                    <ParallaxImageSection imageUrl={'/src/assets/hvac/15.jpg'} overlay heading={t('hvacSolutions.maintenance.title')} summary={t('hvacSolutions.maintenance.summary')} />
                    <div className="col-md-10">

                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <h4 className="card-title display-4">{t('hvacSolutions.maintenance.title')}</h4>
                                <p className="card-text">{t('hvacSolutions.maintenance.body')}</p>
                                <h6 className="fw-bold mt-3">{t('hvacSolutions.solutionsHeading')}</h6>
                                <ul>
                                    {(t('hvacSolutions.maintenance.list', { returnObjects: true }) as string[]).map(item => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

        </>
    );
};

export default HVACSolutions;