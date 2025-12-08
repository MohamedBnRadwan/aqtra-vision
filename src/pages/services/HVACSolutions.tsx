import React from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import ParallaxImageSection from '@/components/ParallaxImageSection';

const HVACSolutions: React.FC = () => {
    return (
        <>
            <HeaderBanner
                title="HVAC & Chiller"
                subtitle="Optimal climate control and air quality solutions."
                backgroundImage="/src/assets/hvac/8.jpg"
            />
            <section className="container-fluid py-5">
                <div className="text-center mb-5">
                    <div >

                    <img src='/src/assets/hvac/hvac-logo-icon.png' width={100} alt="HVAC Solutions" />
                    <img src='/src/assets/hvac/hvac-logo-txt.png' width={150} alt="HVAC Solutions" />
                    </div>
                    <h2 className="display-5">HVAC Services</h2>
                    <p className="text-muted">Professional Heating, Ventilation &amp; Air Conditioning Solutions by AQTRA Company</p>
                </div>

                <div className="row justify-content-center g-4">

                    {/* Ducting Fabrication */}
                    <ParallaxImageSection imageUrl={'/src/assets/hvac/13.jpg'} overlay heading="Ducting Fabrication" summary={'ducting fabrication to ensure efficient airflow.'} />
                    <div className="col-md-10">
                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <h4 className="card-title display-4">Ducting Fabrication</h4>
                                <p className="card-text">
                                    AQTRA provides high-precision ducting fabrication to ensure efficient airflow and improved indoor air quality.
                                    We use premium materials and advanced machinery to deliver durable, leak-proof duct systems following
                                    SMACNA and ASHRAE standards.
                                </p>
                                <h6 className="display-6 mt-3">Solutions Provided:</h6>
                                <ul>
                                    <li>Custom GI, PI, and aluminum duct fabrication</li>
                                    <li>Airflow calculation &amp; duct layout design</li>
                                    <li>Rectangular and spiral duct fabrication</li>
                                    <li>Thermal insulation &amp; weatherproofing</li>
                                    <li>Installation of dampers, access doors &amp; fittings</li>
                                    <li>Site installation &amp; air balancing</li>
                                    <li>Duct system upgrades &amp; repair</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Chillers */}
                    <ParallaxImageSection imageUrl={'/src/assets/hvac/1.jpg'} overlay heading="Chillers" summary={'expert installation and servicing of air-cooled and water-cooled chillers.'} />
                    <div className="col-md-10">

                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <h4 className="card-title display-4">Chillers</h4>
                                <p className="card-text">
                                    AQTRA offers expert installation and servicing of air-cooled and water-cooled chillers for commercial,
                                    industrial, and medical facilities. Our systems are designed for maximum cooling efficiency and reliability.
                                </p>
                                <h6 className="display-6 mt-3">Solutions Provided:</h6>
                                <ul>
                                    <li>Installation of air-cooled &amp; water-cooled chillers</li>
                                    <li>Chiller plant design, sizing &amp; load calculation</li>
                                    <li>Preventive &amp; corrective maintenance programs</li>
                                    <li>Compressor, pump, motor &amp; control system repair</li>
                                    <li>Refrigerant replacement &amp; leak testing</li>
                                    <li>Energy optimization &amp; upgrade solutions</li>
                                    <li>BMS integration for chiller systems</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Air Handling Units */}
                    <ParallaxImageSection imageUrl={'/src/assets/hvac/8.jpg'} heading="Air Handling Units" summary={'expert installation and servicing of air handling units.'} />
                    <div className="col-md-10">

                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <h4 className="card-title display-4">Air Handling Units (AHUs)</h4>
                                <p className="card-text">
                                    Our AHU services ensure clean, comfortable air through efficient ventilation, filtration, and cooling.
                                    We provide installation, maintenance, and upgrades of AHUs for all types of buildings.
                                </p>
                                <h6 className="display-6 mt-3">Solutions Provided:</h6>
                                <ul>
                                    <li>AHU installation, testing &amp; commissioning</li>
                                    <li>Supply of FAHU, HRU, FCU, and VAV units</li>
                                    <li>Filter installation &amp; HEPA/MERV replacements</li>
                                    <li>Fan, motor, belt, coil &amp; damper repair</li>
                                    <li>Coil cleaning &amp; chemical washing</li>
                                    <li>Airflow measurement &amp; balancing</li>
                                    <li>BMS control integration</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Maintenance */}
                    <ParallaxImageSection imageUrl={'/src/assets/hvac/15.jpg'} overlay heading="Maintenance" summary={'comprehensive HVAC maintenance programs for optimal performance and longevity.'} />
                    <div className="col-md-10">

                        <div className="card h-100 shadow-sm border-0">
                            <div className="card-body">
                                <h4 className="card-title display-4">Maintenance</h4>
                                <p className="card-text">
                                    AQTRA delivers complete HVAC maintenance programs to ensure long lifespan, reduced energy consumption,
                                    and optimal performance for all HVAC equipment across commercial and industrial facilities.
                                </p>
                                <h6 className="fw-bold mt-3">Solutions Provided:</h6>
                                <ul>
                                    <li>Annual preventive maintenance contracts</li>
                                    <li>System diagnostics &amp; performance inspection</li>
                                    <li>Coil, filter, duct &amp; condenser cleaning</li>
                                    <li>Thermostat &amp; control panel testing</li>
                                    <li>Refrigerant charging &amp; leak detection</li>
                                    <li>Emergency breakdown repair</li>
                                    <li>Energy efficiency optimization</li>
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