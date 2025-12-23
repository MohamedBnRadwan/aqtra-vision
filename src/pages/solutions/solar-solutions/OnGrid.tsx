import React from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import ParallaxImageSection from '@/components/ParallaxImageSection';

const OnGrid: React.FC = () => {
  return (
    <>
      <HeaderBanner
        title="On-Grid Solar Systems"
        subtitle="Grid-tied photovoltaic systems for reduced bills and energy export when available."
        backgroundImage="/src/assets/hero-bg-1.jpg"
      />

      <section className="container-fluid py-5">
        <div className="container">
          <h2 className="display-5">On-Grid (Grid-Tied) Systems</h2>
          <p className="text-muted">On-grid systems connect directly to the utility network and are ideal where grid power is reliable.</p>

          <ParallaxImageSection imageUrl={'/src/assets/hero-bg-1.jpg'} heading="How it works" summary={'PV panels generate electricity which is consumed on-site and excess is exported to the grid.'} />

          <div className="card mt-4">
            <div className="card-body">
              <h4>Key Features</h4>
              <ul>
                <li>No battery required (lower cost)</li>
                <li>Export excess power to grid (net metering / FIT)</li>
                <li>Simple installation and fast ROI</li>
                <li>Scalable for future expansion</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OnGrid;
