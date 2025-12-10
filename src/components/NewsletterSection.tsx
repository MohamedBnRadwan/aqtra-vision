import React from 'react';
import './NewsletterSection.css';
import { ArrowRight } from 'lucide-react';
import { AlertDialog } from '@radix-ui/react-alert-dialog';
import { Button } from './ui/button';

const NewsletterSection: React.FC = () => {
    let [consentGiven, setConsentGiven] = React.useState(false);
    let [email, setEmail] = React.useState('');
    let isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    let isValidForm = consentGiven && isValidEmail;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!consentGiven) {
            alert('Please provide consent to subscribe to the newsletter.');
            return;
        }
        alert('Thank you for subscribing to our newsletter!');
    };

    
    return (
        <section className="newsletter-section p-5">
            <div className="container-fluid">
                <div className="row justify-content-center">
                    <div className="col-md-10 card-holder p-4">
                        <div className="row g-4 align-items-center">
                            <div className="col-md-6">
                                <h2 className="newsletter-title mb-4">Subscribe to our Newsletter</h2>
                                <p className="newsletter-description mb-4">Stay updated with the latest news and offers from our team.</p>
                            </div>
                            <div className="col-md-6">
                                <form className="newsletter-form" onSubmit={handleSubmit}>
                                    <div className='input-holder has-validation'>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="Your email address..."
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
                                        I agree to AQTRA storing my email information for newsletter subscription.
                                    </label>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default NewsletterSection;