import React, { useState, useEffect } from 'react';
import './CookiesPolicy.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const CookiesPolicy: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';
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


    const persistSettings = (nextSettings: typeof settings) => {
        setSettings(nextSettings);
        document.cookie = `cookiesAccepted='${JSON.stringify(nextSettings)}'; path=/; max-age=31536000`;
        setIsVisible(false);
        setShowModal(false);
    };

    const acceptAll = () => {
        persistSettings({
            necessary: true,
            functional: true,
            analytics: true,
            performance: true,
            advertisement: true,
        });
    };

    const rejectAll = () => {
        persistSettings({
            necessary: true,
            functional: false,
            analytics: false,
            performance: false,
            advertisement: false,
        });
    };

    const updateCookies = () => {
        persistSettings(settings);
    };


    if (!isVisible) return (
        <button
            type="button"
            className={`cookie-icon ${isRtl ? 'cookie-icon--rtl' : ''}`}
            onClick={() => setIsVisible(true)}
            aria-label={t('cookies.iconLabel')}
        >
            <FontAwesomeIcon icon={faCookieBite} className="text-primary" />
        </button>
    );

    return (
        <div className={`cookie-popup ${isRtl ? 'cookie-popup--rtl' : ''}`}>
            <h2>
                <FontAwesomeIcon icon={faCookieBite} className="me-2 text-primary" />
                {t('cookies.title')}
            </h2>

            <p>{t('cookies.description')}</p>
            <p>{t('cookies.consentReminder')}</p>
            <div className="cookie-buttons">
                <button className="customise" type="button" onClick={() => setShowModal(!showModal)}>
                  {t('cookies.customise')}
                </button>
                <button className="reject" type="button" onClick={rejectAll}>
                    {t('cookies.reject')}
                </button>
                <button className="accept" type="button" onClick={acceptAll}>
                  {t('cookies.accept')}
                </button>
            </div>


            {/* Modal */}
            {showModal && (
                <div className="cookie-modal-backdrop mt-3">
                    <div className="cookie-modal">
                        <div className="section-title mb-3">
                            <h2 className='fs-6'>
                                <FontAwesomeIcon icon={faCookieBite} className="me-2 text-primary" />
                                {t('cookies.manageTitle')}
                            </h2>
                        </div>
                        <ul className='list-unstyled'>
                            {Object.keys(settings).map((key) => (
                                <li key={key} className="cookie-option">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" onChange={() => toggle(key)} disabled={key === "necessary"} type="checkbox" role="switch" id={`switchCheckDefault-${key}`} checked={settings[key as keyof typeof settings]} />
                                        <label className="form-check-label" htmlFor={`switchCheckDefault-${key}`}><span>{t(`cookies.categories.${key}`)}</span></label>
                                    </div>
                                </li>
                            ))}
                        </ul>


                        <div className="cookie-buttons">
                            <button type="button" onClick={() => setShowModal(false)}>{t('cookies.cancel')}</button>
                            <button className="accept" type="button" onClick={updateCookies}>
                                {t('cookies.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CookiesPolicy;