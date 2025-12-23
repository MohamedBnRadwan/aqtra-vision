import React from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import ParallaxImageSection from '@/components/ParallaxImageSection';

const OffGrid: React.FC = () => {
  return (
    <>
      <HeaderBanner
        title="Off-Grid Solar Systems"
        subtitle="Standalone systems with battery storage and optional backup generation."
        backgroundImage="/src/assets/hero-bg-3.jpg"
      />

      <section className="container-fluid py-5">
        <div className="container">
          <h2 className="display-5">Off-Grid (Standalone) Systems</h2>
          <p className="text-muted">Designed for locations without reliable grid access — includes PV, batteries and controllers.</p>

          <ParallaxImageSection imageUrl={'/src/assets/hero-bg-3.jpg'} heading="Use Cases" summary={'Rural houses, telecom, remote facilities and sites where grid connection is unavailable or costly.'} />

          <div className="card mt-4">
            <div className="card-body">
              <h4>Design Considerations</h4>
              <ul>
                <li>Battery capacity sizing for required autonomy</li>
                <li>Charge controllers and inverter selection</li>
                <li>Backup generator planning for extended cloudy periods</li>
                <li>Maintenance and battery lifecycle planning</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OffGrid;
