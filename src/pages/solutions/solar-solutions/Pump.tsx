import React from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import ParallaxImageSection from '@/components/ParallaxImageSection';

const Pump: React.FC = () => {
  return (
    <>
      <HeaderBanner
        title="Solar Water Pumping"
        subtitle="Solar-driven pumping solutions for irrigation, livestock and remote water supply."
        backgroundImage="/src/assets/hero-bg-3.jpg"
      />

      <section className="container-fluid py-5">
        <div className="container">
          <h2 className="display-5">Solar Water Pumping Systems</h2>
          <p className="text-muted">Reliable, low-maintenance pumping solutions using solar energy — perfect for agriculture and remote supply.</p>

          <ParallaxImageSection imageUrl={'/src/assets/solor-install.mp4'} heading="Typical Use" summary={'Irrigation, boreholes, livestock watering and village water supply.'} />

          <div className="card mt-4">
            <div className="card-body">
              <h4>Design Notes</h4>
              <ul>
                <li>Select pump and inverter to match head and flow requirements</li>
                <li>Consider direct-coupled vs battery-backed solutions</li>
                <li>Include filtration and borehole protections as needed</li>
                <li>Provide seasonal sizing for irrigation cycles</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Pump;
