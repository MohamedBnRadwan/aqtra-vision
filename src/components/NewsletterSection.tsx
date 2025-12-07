import React from 'react';
import './NewsletterSection.css';
import { ArrowRight } from 'lucide-react';

const NewsletterSection: React.FC = () => {
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
                                <form className="newsletter-form">
                                    <div className='input-holder'>

                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="Your email address..."
                                        />
                                    <button type="submit">
                                        <ArrowRight />
                                    </button>
                                        </div>
                                </form>
                                <div className="consent">
                                    <input type="checkbox" id="consent" />
                                    <label htmlFor="consent">I agree to AQTRA Vision storing my personal information.</label>
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