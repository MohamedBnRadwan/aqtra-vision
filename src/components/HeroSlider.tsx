import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './HeroSlider.css';

import hvacBg from '@/assets/hvac/s1.png';
import electricalBg from '@/assets/electrical/s1.png';
import smartHomeBg from '@/assets/smart_home/s1.png';
import solarBg from '@/assets/solar/s1.png';
import networkBg from '@/assets/network/s1.png';
import landscapeBg from '@/assets/landscape/s1.png';
import calculatorSVG from '@/assets/svg/calc-icon.svg';

import solarLoop from '@/assets/solar/v2.mp4';
import networkLoop from '@/assets/network/1.mp4';
import electricLoop from '@/assets/electrical/v1.mp4';
import landscapeLoop from '@/assets/landscape/v1.mp4';

type HeroService = {
    id: string;
    title: string;
    description: string;
    image: string;
    video: string;
    link: string;
    eyebrow?: string;
};

const services: HeroService[] = [
       {
        id: 'landscape-irrigation',
        title: 'Landscape & Irrigation',
        description: 'Sustainable landscape design and smart irrigation systems that conserve water and enhance outdoor spaces.',
        image: landscapeBg,
        video: landscapeLoop,
        link: '/services/landscape-irrigation',
        eyebrow: 'Green Spaces',
    },
    {
        id: 'hvac-chiller',
        title: 'HVAC & Chiller',
        description: 'High-efficiency climate systems, chilled water plants, and lifecycle maintenance for mission-critical facilities.',
        image: hvacBg,
        video: '',
        link: '/services/hvac-chiller',
        eyebrow: 'Precision Air & Cooling',
    },
    {
        id: 'electrical',
        title: 'Electrical',
        description: 'Safe, code-compliant power distribution, backup generation, and lighting built for resilient operations.',
        image: electricalBg,
        video: electricLoop,
        link: '/services/electrical',
        eyebrow: 'Power That Performs',
    },
    {
        id: 'smart-home-systems',
        title: 'Smart Home & Automation',
        description: 'Integrated controls, security, and ambience that learn how you live and respond instantly.',
        image: smartHomeBg,
        video: '',
        link: '/services/smart-home-systems',
        eyebrow: 'Connected Living',
    },
    {
        id: 'solar-energy',
        title: 'Solar Energy',
        description: 'Bankable PV design, hybrid storage, and intelligent monitoring delivering clean, stable energy.',
        image: solarBg,
        video: solarLoop,
        link: '/solar-solutions',
        eyebrow: 'Sustainable Power',
    },
    {
        id: 'network-security',
        title: 'Network & Security',
        description: 'Carrier-grade cabling, Wi-Fi, CCTV, and access control engineered for secure, scalable uptime.',
        image: networkBg,
        video: networkLoop,
        link: '/services/network-security',
        eyebrow: 'Secure Connectivity',
    },
];

const SLIDE_DURATION = 7200;

const HeroSlider = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isCompact, setIsCompact] = useState(false);
    const touchStartX = useRef<number | null>(null);
    const touchDeltaX = useRef(0);
    const dragStartX = useRef<number | null>(null);
    const dragDeltaX = useRef(0);

    const totalSlides = useMemo(() => services.length, []);

    useEffect(() => {
        if (isPaused) return undefined;

        const timer = window.setInterval(() => {
            setCurrent((prev) => (prev + 1) % totalSlides);
        }, SLIDE_DURATION);

        return () => window.clearInterval(timer);
    }, [isPaused, totalSlides]);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY || document.documentElement.scrollTop;
            setIsCompact(offset > 12);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const goTo = (index: number) => {
        const nextIndex = ((index % totalSlides) + totalSlides) % totalSlides;
        setCurrent(nextIndex);
    };

    const handleNext = () => goTo(current + 1);
    const handlePrev = () => goTo((current - 1 + totalSlides) % totalSlides);

    const handleNavigate = (link: string) => {
        navigate(link);
    };

    const startTouch = (clientX: number) => {
        touchStartX.current = clientX;
        touchDeltaX.current = 0;
    };

    const moveTouch = (clientX: number) => {
        if (touchStartX.current === null) return;
        touchDeltaX.current = clientX - touchStartX.current;
    };

    const endTouch = () => {
        if (touchStartX.current === null) return;
        const threshold = 60;
        if (touchDeltaX.current > threshold) {
            handlePrev();
        } else if (touchDeltaX.current < -threshold) {
            handleNext();
        }
        touchStartX.current = null;
        touchDeltaX.current = 0;
    };

    const startDrag = (clientX: number) => {
        dragStartX.current = clientX;
        dragDeltaX.current = 0;
    };

    const moveDrag = (clientX: number) => {
        if (dragStartX.current === null) return;
        dragDeltaX.current = clientX - dragStartX.current;
    };

    const endDrag = () => {
        if (dragStartX.current === null) return;
        const threshold = 80;
        if (dragDeltaX.current > threshold) {
            handlePrev();
        } else if (dragDeltaX.current < -threshold) {
            handleNext();
        }
        dragStartX.current = null;
        dragDeltaX.current = 0;
    };

    return (
        <div
            className={`hero-slider ${isCompact ? 'hero-slider--compact' : 'hero-slider--flush'}`}
            onMouseEnter={() => setIsPaused(true)}
            role="region"
            aria-label={t('heroSlider.ariaRegion')}
            onTouchStart={(e) => startTouch(e.touches[0].clientX)}
            onTouchMove={(e) => moveTouch(e.touches[0].clientX)}
            onTouchEnd={endTouch}
            onTouchCancel={endTouch}
            onMouseDown={(e) => {
                if (e.button !== 0) return;
                startDrag(e.clientX);
            }}
            onMouseMove={(e) => moveDrag(e.clientX)}
            onMouseUp={endDrag}
            onMouseLeave={() => {
                setIsPaused(false);
                endDrag();
            }}
        >
            {services.map((service, index) => {
                const isActive = index === current;
                const localizedTitle = t(`servicesData.${service.id}.title`, { defaultValue: service.title });
                const localizedDescription = t(`servicesData.${service.id}.description`, { defaultValue: service.description });
                return (
                    <article
                        key={service.id}
                        className={`hero-slide ${isActive ? 'hero-slide--active' : ''}`}
                        style={{ backgroundImage: `url(${service.image})` }}
                        role="button"
                        tabIndex={isActive ? 0 : -1}
                        aria-label={`${localizedTitle} slide`}
                    >
                        <div className={`hero-slide__overlay ${isRtl ? 'hero-slide__overlay--rtl' : ''}`} />

                        <div className="hero-slide__content" aria-live={isActive ? 'polite' : 'off'}>
                            {/* <span className="hero-slide__eyebrow">{service.eyebrow ?? 'AQTRA Services'}</span> */}
                            <h1 className="hero-slide__title">{localizedTitle}</h1>
                            <p className="hero-slide__description">{localizedDescription}</p>
                            <div className="hero-slide__actions">
                                <Link
                                    to={service.link}
                                    className="hero-slide__cta"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {t('heroSlider.ctaPrimary')}
                                </Link>

                                <Link
                                    className="hero-slide__ghost"
                                    to="/contact"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {t('heroSlider.ctaSecondary')}
                                </Link>

                                {service.link === '/solar-solutions' && (
                                    <Link
                                        to="/solar-calculation"
                                        className="hero-slide__ghost hero-slide__calculator"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {t('heroSlider.ctaCalculator')}
                                        <img src={calculatorSVG} alt="" aria-hidden="true" />
                                    </Link>
                                )}
                            </div>
                        </div>

                        {service.video &&
                            <div className={`hero-slide__video ${isActive ? 'hero-slide__video--active' : ''} ${isRtl ? 'hero-slide__video--rtl' : ''}`}
                                onClick={() => handleNavigate(service.link)}>
                                <video
                                    src={service.video}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    aria-label={`${service.title} preview video`}
                                />
                            </div>
                        }
                    </article>
                );
            })}

            <div className={`hero-slider__nav ${isRtl ? 'hero-slider__nav--rtl' : ''}`}>
                <button
                    type="button"
                    className="hero-slider__arrow"
                    onClick={(e) => { e.stopPropagation(); isRtl ? handleNext() : handlePrev(); }}
                    aria-label={isRtl ? t('heroSlider.ariaNext') ?? 'Next slide' : t('heroSlider.ariaPrev') ?? 'Previous slide'}
                >
                    <ChevronLeft />
                </button>
                <button
                    type="button"
                    className="hero-slider__arrow"
                    onClick={(e) => { e.stopPropagation(); isRtl ? handlePrev() : handleNext(); }}
                    aria-label={isRtl ? t('heroSlider.ariaPrev') ?? 'Previous slide' : t('heroSlider.ariaNext') ?? 'Next slide'}
                    >
                        <ChevronRight />
                </button>
            </div>

            <div className="hero-slider__dots" aria-label="Slide navigation">
                {services.map((service, index) => (
                    <button
                        key={service.id}
                        type="button"
                        className={`hero-slider__dot ${index === current ? 'hero-slider__dot--active' : ''}`}
                        aria-label={t('heroSlider.ariaGoTo', { title: t(`servicesData.${service.id}.title`, { defaultValue: service.title }) })}
                        onClick={(e) => {
                            e.stopPropagation();
                            goTo(index);
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
