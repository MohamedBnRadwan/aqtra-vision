import React from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import ParallaxImageSection from '@/components/ParallaxImageSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCarBattery, faPlug} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

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

                    {/* <ParallaxImageSection imageUrl={'/src/assets/hero-bg-1.jpg'} overlay heading="On-Grid Systems" summary={'Grid-tied solar systems for saving on utility bills while remaining connected to the grid.'} /> */}
                    <div className="col-md-8">
                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <h4 className="card-title display-4"><FontAwesomeIcon icon={faPlug}  className='text-primary' /> On-Grid (Grid-Tied)</h4>
                                <p className="card-text">On-grid solar systems are connected directly to the public electricity grid. These systems allow your solar power station to exchange electricity with the utility grid. When your solar panels produce more power than you need, the excess energy is sent to the grid. When solar production is not enough, electricity is drawn automatically from the grid.</p>
                                <p className="card-text">The exchange of energy is managed through net metering or Feed-in Tariff (FIT) systems, ensuring accurate billing and energy balance.</p>

                                <div className='card-body'>
                                    <span className='badge mx-1 text-bg-primary'>on grid solar system</span>
                                    <span className='badge mx-1 text-bg-primary'>grid tied solar</span>
                                    <span className='badge mx-1 text-bg-primary'>rooftop solar panels</span>
                                    <span className='badge mx-1 text-bg-primary'>solar net metering</span>
                                </div>
                                <h6 className="display-6 mt-3">Benefits:</h6>
                                <ul>
                                    <li>Reduced electricity bills through self-consumption</li>
                                    <li>Ability to export excess power to the utility grid</li>
                                    <li>Seamless transition between solar and grid power</li>
                                    <li>Lower installation cost (no batteries required)</li>
                                    <li>High efficiency and simple system design</li>
                                    <li>Ideal for areas with reliable grid availability</li>
                                    <li>Scalable — easy to expand later</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* <ParallaxImageSection imageUrl={'/src/assets/hero-bg-3.jpg'} overlay heading="Off-Grid Systems" summary={'Fully independent solar systems with battery storage and backup generation.'} /> */}
                    <div className="col-md-10">
                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <h4 className="card-title display-4"><FontAwesomeIcon icon={faCarBattery}  className='text-primary' /> Off-Grid Solar System (Standalone)</h4>
                                <p className="card-text">
                                    Off-grid systems are designed for locations without reliable grid access or where full independence is required.
                                    They include PV arrays, battery storage, charge controllers and often a backup generator for extended autonomy.
                                </p>
                                <p className="card-text">
                                    Off-grid solar systems operate independently from the utility grid and are
                                    designed to supply power in remote or grid-unavailable locations. These systems
                                    rely on solar panels and battery storage to provide continuous electricity,
                                    ensuring energy availability day and night.
                                </p>
                                <div className='card-body'>
                                    <span className='badge mx-1 text-bg-primary'>off grid solar system</span>
                                    <span className='badge mx-1 text-bg-primary'>solar battery system</span>
                                    <span className='badge mx-1 text-bg-primary'>remote solar power</span>
                                    <span className='badge mx-1 text-bg-primary'>standalone solar</span>
                                </div>
                                <h6 className="display-6 mt-3">Suitable For:</h6>
                                <ul>
                                    <li>Remote sites, rural properties and telecom towers</li>
                                    <li>Critical loads requiring guaranteed uptime</li>
                                    <li>Projects where grid connection is impractical or costly</li>
                                    <li>Complete energy independence from the grid</li>
                                    <li>Reliable power supply for remote locations</li>
                                    <li>Energy availability during day and night</li>
                                    <li>No exposure to grid outages</li>
                                    <li>Suitable for rural, desert, and off-grid areas</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* <ParallaxImageSection imageUrl={'/src/assets/hero-bg-1.jpg'} heading="Hybrid Systems" summary={'Hybrid systems combine grid connection with battery storage for resilience and peak shaving.'} /> */}
                    <div className="col-md-10">
                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <h4 className="card-title display-4">Hybrid Solar System (Grid-Connected with Storage)</h4>
                                <p className="card-text">
                                    Hybrid systems blend the benefits of on-grid and off-grid: they operate with the grid but include batteries
                                    to store energy for use during outages or peak pricing periods. Intelligent energy management optimizes usage.
                                </p>
                                <p className="card-text">
                                    Combine the advantages of on-grid and off-grid solutions
                                    by integrating solar panels, battery storage, and the utility grid. They allow
                                    energy storage for backup use while also enabling grid interaction, providing
                                    maximum flexibility, reliability, and energy optimization.
                                </p>
                                <div className='card-body'>
                                    <span className='badge mx-1 text-bg-primary'>hybrid solar system</span>
                                    <span className='badge mx-1 text-bg-primary'>solar battery backup</span>
                                    <span className='badge mx-1 text-bg-primary'>grid hybrid inverter</span>
                                    <span className='badge mx-1 text-bg-primary'>energy storage solar</span>
                                </div>
                                <h6 className="display-6 mt-3">Advantages:</h6>
                                <ul>
                                    <li>Reduced electricity bills and peak demand costs</li>
                                    <li>Backup power during grid outages</li>
                                    <li>Load shifting and peak demand reduction</li>
                                    <li>Optimized energy usage and storage</li>
                                    <li>Enhanced self-consumption and increased savings</li>
                                    <li>Flexible operation modes between solar, battery, and grid (time-of-use optimization)</li>
                                    <li>Ideal for homes and businesses needing high reliability</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* <ParallaxImageSection imageUrl={'/src/assets/hero-bg-2.jpg'} overlay heading="Solar Water Pumping System" summary={''} /> */}
                    <div className="col-md-10">
                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <h4 className="card-title display-4">Solar Water Pumping System</h4>
                                <p className="card-text">
                                    Solar water pumping systems use solar energy to power water pumps for
                                    agriculture, irrigation, livestock, and remote water supply applications.
                                    These systems operate without fuel or grid electricity, providing a
                                    cost-effective and sustainable solution for water pumping needs.
                                    maximum flexibility, reliability, and energy optimization.
                                </p>
                                <div className='card-body'>
                                    <span className='badge mx-1 text-bg-primary'>solar water pumping system</span>
                                    <span className='badge mx-1 text-bg-primary'>solar irrigation pump</span>
                                    <span className='badge mx-1 text-bg-primary'>solar borehole pump</span>
                                    <span className='badge mx-1 text-bg-primary'>agriculture solar pump</span>
                                </div>
                                <h6 className="display-6 mt-3">Advantages:</h6>
                                <ul>
                                    <li>No fuel or electricity costs</li>
                                    <li>Reliable water supply for remote locations</li>
                                    <li>Low maintenance and long operational life</li>
                                    <li>Environmentally friendly and sustainable</li>
                                    <li>Ideal for agriculture and irrigation projects</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 text-center mt-4">
                        <Link to="/on-grid" className="btn btn-outline-primary mx-2">On-Grid Details</Link>
                        <Link to="/off-grid" className="btn btn-outline-primary mx-2">Off-Grid Details</Link>
                        <Link to="/hybrid" className="btn btn-outline-primary mx-2">Hybrid Details</Link>
                        <Link to="/pump" className="btn btn-outline-primary mx-2">Pumping Systems</Link>
                        <Link to="/solar-application" className="btn btn-primary mx-2">Get Recommendation</Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default SolarSolutions;
