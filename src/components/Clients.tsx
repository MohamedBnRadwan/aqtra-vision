import React from 'react';
import { useTranslation } from 'react-i18next';
import './Clients.css';
import marqueeImage from '@/assets/aqtra-logos-marque.png';

// This glob picks up any logos you drop into src/assets/clients
const discoveredLogos = Object.entries(
  import.meta.glob('@/assets/clients/*.{png,jpg,jpeg,svg,webp}', {
    eager: true,
    import: 'default',
  }) as Record<string, string>,
).map(([path, src]) => ({
  name: path.split('/').pop() || 'Client logo',
  src,
}));

const fallbackLogos = Array.from({ length: 6 }, (_, index) => ({
  name: `Client ${index + 1}`,
  src: marqueeImage,
}));

const clientLogos = discoveredLogos.length ? discoveredLogos : fallbackLogos;

const Clients: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="clients" className="clients-section py-5">
      <div className="container">
        <div className="text-center mb-4">
          <p className="clients-kicker mb-2" aria-label="Trusted clients">
            {t('home.clientsKicker', 'Trusted by industry leaders')}
          </p>
          <h2 className="clients-title mb-2">
            {t('home.clientsHeading', 'Our Clients')}
          </h2>
          <p className="clients-subtitle mb-0">
            {t('home.clientsSubheading', 'A snapshot of the brands that trust AQTRA')}
          </p>
        </div>

        <div className="clients-grid" aria-label="Client logos">
          {clientLogos.map((logo, index) => (
            <div className="client-logo-card" key={`${logo.name}-${index}`}>
              <img src={logo.src} alt={logo.name} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clients;
