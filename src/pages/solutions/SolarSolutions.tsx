import React from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import { Link } from 'react-router-dom';
import hybridSVG from '@/assets/svg/hybrid.svg';
import offGridSVG from '@/assets/svg/off-grid.svg';
import onGridSVG from '@/assets/svg/on-grid.svg';
import pumpingSVG from '@/assets/svg/pumping.svg';
import calculatorSVG from '@/assets/svg/calculator.svg';

import './solarsolutions.css';

const SolarSolutions: React.FC = () => {
    return (
        <>
            <HeaderBanner
                title="Solar Solutions"
                subtitle="Reliable solar energy systems for homes, businesses and industrial sites. On-grid, off-grid and hybrid configurations."
                backgroundImage="/src/assets/hero-bg-2.jpg"
            />

            <section className="container-fluid bg-light py-5">
                <div className="text-center mb-5">
                    <div>
                        <img src="/src/assets/solar/solar-logo-icon.png" width={100} alt="AQTRA" />
                        <img src="/src/assets/solar/solar-logo-txt.png" width={150} alt="AQTRA" />
                    </div>
                    <h2 className="display-5">Solar Energy Solutions</h2>
                    <p className="text-muted">Design, supply and installation of photovoltaic (PV) systems tailored to your needs.</p>
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
                                        <h5 className="card-title">On-Grid</h5>
                                        <p className="card-text text-muted small">Grid-tied PV systems — export surplus energy and reduce bills.</p>
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
                                        <h5 className="card-title">Off-Grid</h5>
                                        <p className="card-text text-muted small">Standalone systems with batteries for full independence.</p>
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
                                        <h5 className="card-title">Hybrid</h5>
                                        <p className="card-text text-muted small">Grid-connected systems with battery backup and smart control.</p>
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
                                        <h5 className="card-title">Pumping</h5>
                                        <p className="card-text text-muted small">Solar water pumping solutions for irrigation and remote supply.</p>
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
                                                <h5 className="card-title">Get Recommendation</h5>
                                                <p className="card-text text-muted small">Answer a few questions to find the right system and estimated area.</p>
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
