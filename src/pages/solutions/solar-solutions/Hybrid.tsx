import React from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import ParallaxImageSection from '@/components/ParallaxImageSection';

const Hybrid: React.FC = () => {
  return (
    <>
      <HeaderBanner
        title="Hybrid Solar Systems"
        subtitle="Grid-connected systems with battery backup for resilience and optimization."
        backgroundImage="/src/assets/hero-bg-2.jpg"
      />

      <section className="container-fluid py-5">
        <div className="container">
          <h2 className="display-5">Hybrid Systems</h2>
          <p className="text-muted">Combine solar, batteries and grid connection to get the best of both worlds.</p>

          <ParallaxImageSection imageUrl={'/src/assets/hero-bg-2.jpg'} heading="Benefits" summary={'Backup power, peak-shaving and improved self-consumption.'} />

          <div className="card mt-4">
            <div className="card-body">
              <h4>Why Choose Hybrid</h4>
              <ul>
                <li>Seamless backup during outages</li>
                <li>Time-of-use optimization and reduced demand charges</li>
                <li>Greater control through energy management systems</li>
                <li>Suitable for homes and businesses wanting resilience</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hybrid;
