import React from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import hybridSVG from '@/assets/svg/hybrid.svg';
import offGridSVG from '@/assets/svg/off-grid.svg';
import onGridSVG from '@/assets/svg/on-grid.svg';
import pumpingSVG from '@/assets/svg/pumping.svg';
import calculatorSVG from '@/assets/svg/calculator.svg';

import './solarsolutions.css';

const SolarSolutions: React.FC = () => {
    const { t } = useTranslation();
    return (
        <>
            <HeaderBanner
                title={t('solarSolutions.title')}
                subtitle={t('solarSolutions.subtitle')}
                backgroundImage="/src/assets/hero-bg-2.jpg"
            />

            <section className="container-fluid bg-light py-5">
                <div className="text-center mb-5">
                    <div>
                        <img src="/src/assets/solar/solar-logo-icon.png" width={100} alt="AQTRA" />
                        <img src="/src/assets/solar/solar-logo-txt.png" width={150} alt="AQTRA" />
                    </div>
                    <h2 className="display-5">{t('solarSolutions.heading')}</h2>
                    <p className="text-muted">{t('solarSolutions.description')}</p>
                </div>

                <div className="row justify-content-center g-4">

                    <div className="col-11 mt-4">
                        <div className="row g-4 justify-content-center">

                            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <Link to="/solar/on-grid" className="text-decoration-none solar-system-card text-dark">
                                    <div className="card h-100 shadow-sm border-0 text-center p-3">
                                        <div className="d-flex justify-content-center mb-3">
                                            <picture>
                                                <img src={onGridSVG} width={196} height={196} alt="On-Grid Solar Solution" />
                                            </picture>
                                        </div>
                                        <h5 className="card-title">{t('solarSolutions.onGrid.title')}</h5>
                                        <p className="card-text text-muted small">{t('solarSolutions.onGrid.desc')}</p>
                                    </div>
                                </Link>
                            </div>

                            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <Link to="/solar/off-grid" className="text-decoration-none solar-system-card text-dark">
                                    <div className="card h-100 shadow-sm border-0 text-center p-3">
                                        <div className="d-flex justify-content-center mb-3">
                                            <picture>
                                                <img src={offGridSVG} width={196} height={196} alt="Off-Grid Solar Solution" />
                                            </picture>
                                        </div>
                                        <h5 className="card-title">{t('solarSolutions.offGrid.title')}</h5>
                                        <p className="card-text text-muted small">{t('solarSolutions.offGrid.desc')}</p>
                                    </div>
                                </Link>
                            </div>

                            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <Link to="/solar/hybrid" className="text-decoration-none solar-system-card text-dark">
                                    <div className="card h-100 shadow-sm border-0 text-center p-3">
                                        <div className="d-flex justify-content-center mb-3">
                                            <picture>
                                                <img src={hybridSVG} width={196} height={196} alt="Hybrid Solar Solution" />
                                            </picture>
                                        </div>
                                        <h5 className="card-title">{t('solarSolutions.hybrid.title')}</h5>
                                        <p className="card-text text-muted small">{t('solarSolutions.hybrid.desc')}</p>
                                    </div>
                                </Link>
                            </div>

                            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <Link to="/solar/pump" className="text-decoration-none solar-system-card text-dark">
                                    <div className="card h-100 shadow-sm border-0 text-center p-3">
                                        <div className="d-flex justify-content-center mb-3">
                                            <picture>
                                                <img src={pumpingSVG} width={196} height={196} alt="Pumping Solar Solution" />
                                            </picture>
                                        </div>
                                        <h5 className="card-title">{t('solarSolutions.pumping.title')}</h5>
                                        <p className="card-text text-muted small">{t('solarSolutions.pumping.desc')}</p>
                                    </div>
                                </Link>
                            </div>
                            <div className="col-12"></div>
                            <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                                <Link to="/solar-calculation" className="text-decoration-none solar-system-card text-dark">
                                    <div className="card h-100 shadow-sm border-0 text-center p-3">
                                        <div className="d-flex justify-content-center mb-3">
                                            <picture>
                                                <img src={calculatorSVG} width={196} height={196} alt="Get Recommendation Solar Solution" />
                                            </picture>
                                            <div  className='vr solar-system-calculator-vr' />
                                            <div className='d-flex justify-content-center flex-column'>
                                                <h5 className="card-title">{t('solarSolutions.calc.title')}</h5>
                                                <p className="card-text text-muted small">{t('solarSolutions.calc.desc')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default SolarSolutions;
