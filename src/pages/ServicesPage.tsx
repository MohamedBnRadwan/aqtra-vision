import React, { useEffect } from 'react';
import HeaderBanner from '@/components/HeaderBanner';

import SolorBannels from '@/assets/intro-bg.mp4';
import SolorInstall from '@/assets/solor-install.mp4';
import KhobarLocation from '@/assets/khober-location.mp4';
import Services from '@/components/Services';
import { Link } from 'react-router-dom';

const services = [
	{
		description: [
			'We provide top-notch engineering consulting services tailored to your project needs. Our team of experts leverages cutting-edge technology and industry best practices to deliver innovative solutions that drive success.',
			'From initial concept development to final implementation, we work closely with our clients to ensure every aspect of the project is executed with precision and excellence.',
		],
		videoUrl: SolorBannels,
		title: 'Service 1',
	},
	{
		description: [
			'Our comprehensive project management services ensure that your projects are completed on time, within budget, and to the highest quality standards.',
			'We utilize proven methodologies and tools to coordinate resources, manage risks, and communicate effectively with all stakeholders throughout the project lifecycle.',
		],
		videoUrl: SolorInstall,
		title: 'Service 2',
	},
	{
		description: [
			'We specialize in sustainable engineering solutions that minimize environmental impact while maximizing efficiency and performance.',
			'Our team is dedicated to integrating green technologies and practices into every project, helping our clients achieve their sustainability goals.',
		],
		videoUrl: KhobarLocation,
		title: 'Service 3',
	},
];

const ServicesPage: React.FC = () => {
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, []);


	return (
		<>
			<HeaderBanner
				title="Our Services"
				subtitle="Explore the wide range of services we offer to meet your needs."
				backgroundImage={'/src/assets/hero-bg-2.jpg#position=0px,-450px'}
			/>
			<div>
				<div className="container-fluid">


					<div className="my-5 row">
						<div className="col-md-10 offset-md-1">
							<Services col="col-md-6" />
							{/* {services.map((service, index) => (
                <div className='card-body mb-5 p-4 shadow-sm'>
                <ServiceVideoSection
                key={index}
                title={service.title}
                description={service.description}
                videoUrl={service.videoUrl}
                />
                </div>
                ))} */}
						</div>
					</div>
					<div className="my-5 row">
						<div className="col-12">
							<div className="container">
								<div className="row justify-content-center">
									<div
										className={'col-md-8 mb-4'}
										data-aos="fade-up"
										data-aos-delay={100}
									>
										<Link
											to={`/services/`}
											className="text-decoration-none hover-effect"
										>
											<div className="card rounded-pill border-0 shadow-sm h-100">
												<div className="card-body">
													<div className="d-flex justify-content-between align-items-center">
														<img
															src="/src/assets/solar/solar-logo-icon.png"
															width={80}
															alt="Solution Page"
															style={{ marginBottom: '12px' }}
														/>
														<h3 className="display-5 text-truncate m-0">
															Solar System Solutions
														</h3>
														<img
															src="/src/assets/solar/solar-logo-txt.png"
															width={80}
															alt="Solution Page"
														/>
													</div>
												</div>
											</div>
										</Link>
									</div>


									<div className="col-12"></div>


									<div
										className={'col-md-10 mb-4'}
										data-aos="fade-up"
										data-aos-delay={200}
									>
										<Link to={`/services/`} className="text-decoration-none">
											<div className="card rounded-pill border-0 shadow-sm h-100">
												<div className="card-body">
													<div className="d-flex justify-content-between align-items-center">
														<img
															src="/src/assets/smart_home/smart_home-logo-icon.png"
															width={80}
															alt="Solution Page"
															style={{ marginBottom: '12px' }}
														/>
														<h3 className="display-5 text-truncate m-0">
															Smart Home & Security Solutions
														</h3>
														<img
															src="/src/assets/smart_home/smart_home-logo-txt.png"
															width={80}
															alt="Solution Page"
														/>
													</div>
												</div>
											</div>
										</Link>
									</div>

									<div className="col-12"></div>
									<div
										className={'col-md-6 mb-4'}
										data-aos="fade-up"
										data-aos-delay={200}
									>
										<Link to={`/hvac-solutions`} className="text-decoration-none">
											<div className="card rounded-pill border-0 shadow-sm h-100">
												<div className="card-body">
													<div className="d-flex justify-content-between align-items-center">
														<img
															src="/src/assets/fire/fire-logo-icon.png"
															width={80}
															alt="Solution Page"
															style={{ marginBottom: '12px' }}
														/>
														<h3 className="display-5 text-truncate m-0">
															HVAC Solutions
														</h3>
														<img
															src="/src/assets/fire/fire-logo-txt.png"
															width={80}
															alt="Solution Page"
														/>
													</div>
												</div>
											</div>
										</Link>
									</div>

									<div className="col-12"></div>
									<div
										className={'col-md-7 mb-4'}
										data-aos="fade-up"
										data-aos-delay={200}
									>
										<Link to={`/services/`} className="text-decoration-none">
											<div className="card rounded-pill border-0 shadow-sm h-100">
												<div className="card-body">
													<div className="d-flex justify-content-between align-items-center">
														<img
															src="/src/assets/plumbing/plumbing-logo-icon.png"
															width={80}
															alt="Solution Page"
															style={{ marginBottom: '12px' }}
														/>
														<h3 className="display-5 text-truncate m-0">
															Plumbing Solutions
														</h3>
														<img
															src="/src/assets/plumbing/plumbing-logo-txt.png"
															width={80}
															alt="Solution Page"
														/>
													</div>
												</div>
											</div>
										</Link>
									</div>
									<div className="col-12"></div>

									<div
										className={'col-md-8 mb-4'}
										data-aos="fade-up"
										data-aos-delay={200}
									>
										<Link to={`/services/`} className="text-decoration-none">
											<div className="card rounded-pill border-0 shadow-sm h-100">
												<div className="card-body">
													<div className="d-flex justify-content-between align-items-center">
														<img
															src="/src/assets/fire/fire-logo-icon.png"
															width={80}
															alt="Solution Page"
															style={{ marginBottom: '12px' }}
														/>
														<h3 className="display-5 text-truncate m-0">
															Fire Fighting Solutions
														</h3>
														<img
															src="/src/assets/fire/fire-logo-txt.png"
															width={80}
															alt="Solution Page"
														/>
													</div>
												</div>
											</div>
										</Link>
									</div>
									<div className="col-12"></div>

									<div
										className={'col-md-7 mb-4'}
										data-aos="fade-up"
										data-aos-delay={200}
									>
										<Link to={`/services/`} className="text-decoration-none">
											<div className="card rounded-pill border-0 shadow-sm h-100">
												<div className="card-body">
													<div className="d-flex justify-content-between align-items-center">
														<img
															src="/src/assets/network/network-logo-icon.png"
															width={80}
															alt="Solution Page"
															style={{ marginBottom: '12px' }}
														/>
														<h3 className="display-5 text-truncate m-0">
															Network Solutions
														</h3>
														<img
															src="/src/assets/network/network-logo-txt.png"
															width={80}
															alt="Solution Page"
														/>
													</div>
												</div>
											</div>
										</Link>
									</div>

									<div className="col-12"></div>

									<div
										className={'col-md-8 mb-4'}
										data-aos="fade-up"
										data-aos-delay={200}
									>
										<Link to={`/services/`} className="text-decoration-none">
											<div className="card rounded-pill border-0 shadow-sm h-100">
												<div className="card-body">
													<div className="d-flex justify-content-between align-items-center">
														<img
															src="/src/assets/electrical/electrical-logo-icon.png"
															width={80}
															alt="Solution Page"
															style={{ marginBottom: '12px' }}
														/>
														<h3 className="display-5 text-truncate m-0">
															Electric Power Solutions
														</h3>
														<img
															src="/src/assets/electrical/electrical-logo-txt.png"
															width={80}
															alt="Solution Page"
														/>
													</div>
												</div>
											</div>
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ServicesPage;