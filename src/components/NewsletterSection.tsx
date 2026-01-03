import React, {useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import './NewsletterSection.css';
import { ArrowRight } from 'lucide-react';
import Rellax from "rellax";

const NewsletterSection: React.FC = () => {
    const { t } = useTranslation();
    let [consentGiven, setConsentGiven] = React.useState(false);
    let [email, setEmail] = React.useState('');
    let isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    let isValidForm = consentGiven && isValidEmail;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!consentGiven) {
            alert(t('newsletter.missingConsent'));
            return;
        }
        alert(t('newsletter.thankYou'));
    };

  useEffect(() => {
    const rellax = new Rellax(".rellax", {
      speed: 2,
      center: true,
      wrapper: null,
      round: false,
      vertical: true,
      horizontal: true,
    });

    return () => {
      rellax.destroy(); // VERY IMPORTANT
    };
  }, []);

    return (
        <>
            <div className='decoration-21 d-none d-lg-block rellax'>
                <img src="/src/assets/decoration-2.svg" className='decoration-21-img' alt="" />
            </div>
            <section className="newsletter-section">
                <div className="container">
                    <div className="row justify-content-center newsletter-row">
                        <div className="col-12 newsletter-col12 col-md-10 card-holder p-4">
                            <div className="row g-4 align-items-center">
                                <div className="col-md-6">
                                    <h2 className="newsletter-title mb-4">{t('newsletter.title')}</h2>
                                    <p className="newsletter-description mb-4">{t('newsletter.description')}</p>
                                </div>
                                <div className="col-md-6">
                                    <form className="newsletter-form" onSubmit={handleSubmit}>
                                        <div className='input-holder has-validation'>
                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder={t('newsletter.placeholder')}
                                                required
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                            <button disabled={!isValidForm} className={!isValidForm ? 'btn disbled' : ''} type="submit">
                                                <ArrowRight />
                                            </button>
                                        </div>
                                    </form>
                                    <div className="consent">
                                        <input type="checkbox" checked={consentGiven} onChange={() => setConsentGiven(!consentGiven)} name='IAgree' id="consent" />
                                        <label htmlFor="consent" onChange={() => setConsentGiven(!consentGiven)}
                                            style={{ cursor: 'pointer' }}>
                                            {t('newsletter.consent')}
                                        </label>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            </section>
        </>

    );
};

export default NewsletterSection;