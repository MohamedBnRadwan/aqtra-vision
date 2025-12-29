import React, { useEffect, useMemo } from 'react';
import HeaderBanner from '@/components/HeaderBanner';

import ServiceVideoSection, { buildServiceOverviewData } from '@/components/ServiceVideoSection';

const ServicesPage: React.FC = () => {
	const featuredServiceIds = ['smart-home-systems', 'hvac-chiller', 'solar-energy', 'plumbing', 'fire-fighting', 'electrical', 'network-security', 'landscape-irrigation'];
	const serviceOverviewData = useMemo(() => buildServiceOverviewData(featuredServiceIds), []);
	
	// backgroundImage={'/src/assets/hero-bg-2.jpg#position=0px,-450px'}

	return (
		<>
			<HeaderBanner
				title="Our Services"
				subtitle="Explore the wide range of services we offer to meet your needs."
			/>
			<ServiceVideoSection services={serviceOverviewData} />
		</>
	);
};

export default ServicesPage;