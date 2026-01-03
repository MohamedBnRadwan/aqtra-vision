import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Solutions = () => {
    const { t } = useTranslation();
    return <div className="container-fluid">
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
                                to={`/solar-solutions`}
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
                                                {t('solutionsPage.cards.solar')}
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
                                                {t('solutionsPage.cards.smartHome')}
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
                                                {t('solutionsPage.cards.hvac')}
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
                                                {t('solutionsPage.cards.plumbing')}
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
                                                {t('solutionsPage.cards.fire')}
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
                                                {t('solutionsPage.cards.network')}
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
                                                {t('solutionsPage.cards.electric')}
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
    </div>;
};

export default Solutions;
