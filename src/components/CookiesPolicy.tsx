import React, { useState, useEffect } from 'react';
import './CookiesPolicy.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookie, faCookieBite } from '@fortawesome/free-solid-svg-icons';

const CookiesPolicy: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [settings, setSettings] = useState({
        necessary: true,
        functional: false,
        analytics: false,
        performance: false,
        advertisement: false,
    });
    useEffect(() => {
        const hasAccepted = document.cookie.split('; ').find(row => row.startsWith('cookiesAccepted='));
        if (!hasAccepted) {
            setIsVisible(true);
        }
    }, []);

    const toggle = (key: string) => {
        if (key === "necessary") return; // cannot disable
        setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] });
    };


    const acceptAll = () => {
        setSettings({
            necessary: true,
            functional: true,
            analytics: true,
            performance: true,
            advertisement: true,
        });
        updateCookies();
    };

    const rejectAll = () => {
        setSettings({
            necessary: true,
            functional: false,
            analytics: false,
            performance: false,
            advertisement: false,
        });
        updateCookies();
    }

    const updateCookies = () => {
        document.cookie = `cookiesAccepted='${JSON.stringify(settings)}'; path=/; max-age=31536000`; // ${60 * 60 * 24 * 365} 1 year
        setIsVisible(false);
    };


    if (!isVisible) return (
        <div className='cookie-icon'
        onClick={() => setIsVisible(true)}
        ><FontAwesomeIcon  icon={faCookieBite} className="text-primary" /></div>

    );

    return (
        <div className="cookie-popup">
            <h2><FontAwesomeIcon icon={faCookieBite} className="me-2 text-primary" /> We value your privacy </h2>

            <p>
                We use cookies to enhance your browsing experience, serve personalised ads or
                content, and analyse our traffic.
            </p>
            <p>By clicking "Accept", you consent to our use
                of cookies.</p>
            <div className="cookie-buttons">
                {/* <button className="reject" onClick={() => acceptCookies(false)}>Reject</button>
                <button className="accept" onClick={() => acceptCookies(true)}>Accept</button> */}
                <button className="customise" onClick={() => setShowModal(!showModal)}>
                  Customise
                </button>
                <button className="reject" onClick={rejectAll}>
                    Reject
                </button>
                <button className="accept" onClick={acceptAll}>
                  Accept
                </button>
            </div>


            {/* Modal */}
            {showModal && (
                <div className="cookie-modal-backdrop mt-3">
                    <div className="cookie-modal">
                        <div className="section-title mb-3">
                            <h2 className='fs-6'>
                                <FontAwesomeIcon icon={faCookieBite} className="me-2 text-primary" />
                                Manage Cookie Preferences
                            </h2>
                        </div>
                        <ul className='list-unstyled'>
                            {Object.keys(settings).map((key) => (
                                <li key={key} className="cookie-option">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" onChange={() => toggle(key)} disabled={key === "necessary"} type="checkbox" role="switch" id={`switchCheckDefault-${key}`} checked={settings[key as keyof typeof settings]} />
                                        <label className="form-check-label" htmlFor={`switchCheckDefault-${key}`}><span>{key.charAt(0).toUpperCase() + key.slice(1)}</span></label>
                                    </div>
                                </li>
                            ))}
                        </ul>


                        <div className="cookie-buttons">
                            <button onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="accept" onClick={updateCookies}>
                                Save Preferences
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CookiesPolicy;