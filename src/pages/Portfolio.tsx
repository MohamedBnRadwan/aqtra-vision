import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/Layout/Header';
import HeaderBanner from '@/components/HeaderBanner';

const Portfolio: React.FC = () => {
    const { t } = useTranslation();
    return (
        <>
            <HeaderBanner
                title={t('portfolio.title')}
                subtitle={t('portfolio.subtitle')}
            />
            <div className="container">
                <div className="row">
                    <div className="col-12 text-center my-5">
                        <div className="mb-4 section-title">
                            <h3 >
                                {t('portfolio.comingSoonTitle')}
                            </h3>
                        </div>

                        <div className="portfolio-content">
                            {/* <img className='max-w-75 mb-4 mx-2' style={{ maxWidth: 350 }} src="/src/assets/coming-soon.svg" alt="Portfolio Coming Soon" /> */}
                            <img className='max-w-75 mb-4 mx-2' style={{ maxWidth: 350 }} src="/src/assets/under-construction.svg" alt={t('portfolio.comingSoonTitle')} />
                            {/* <img className='max-w-75 mb-4 mx-2' style={{ maxWidth: 350 }} src="/src/assets/web-design.svg" alt="Portfolio Coming Soon" /> */}
                        </div>

                        <div className="mt-4">
                            <a href="/src/assets/AQTRA_Portfolio.pdf" target='_blank' className="btn btn-primary">
                                {t('portfolio.downloadPdf')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Portfolio;