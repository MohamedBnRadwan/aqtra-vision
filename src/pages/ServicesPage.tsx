import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderBanner from '@/components/HeaderBanner';

import ServiceVideoSection, { buildServiceOverviewData } from '@/components/ServiceVideoSection';

const ServicesPage: React.FC = () => {
  const { t } = useTranslation();
	const featuredServiceIds = ['smart-home-systems', 'hvac-chiller', 'solar-energy', 'plumbing', 'fire-fighting', 'electrical', 'network-security', 'landscape-irrigation'];
	const serviceOverviewData = useMemo(() => buildServiceOverviewData(featuredServiceIds), []);
	
	// backgroundImage={'/src/assets/hero-bg-2.jpg#position=0px,-450px'}

	return (
		<>
			<HeaderBanner
				title={t('servicesPage.title')}
				subtitle={t('servicesPage.subtitle')}
			/>
			<ServiceVideoSection services={serviceOverviewData} />
		</>
	);
};

export default ServicesPage;