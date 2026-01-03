import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import AOS from 'aos';
// import 'aos/dist/aos.css';
import Services from '@/components/Services';
import About from '@/components/About';
import NewsletterSection from '@/components/NewsletterSection';
import HeroSlider from '@/components/HeroSlider';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faConciergeBell } from '@fortawesome/free-solid-svg-icons';

const Index = () => {
  const { t } = useTranslation();
  const [heroPadding, setHeroPadding] = useState(0);

  // useEffect(() => {
  //   AOS.init({
  //     duration: 500,
  //     easing: 'ease-out',
  //     offset: 100,
  //   });
  // }, []);

  useEffect(() => {
    const maxPadding = 24; // ~p-4
    const threshold = 180;

    const handleScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      const next = Math.min((y / threshold) * maxPadding, maxPadding);
      setHeroPadding(next);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="">

      {/* Hero Slider */}
      <section style={{ padding: `${heroPadding}px`, transition: 'padding 0.35s ease', backgroundColor: '#e6f7f0' }} >
        <HeroSlider />
      </section>

      {/* About Section */}
      <section>

        <About />
      </section>

      {/* Services Section */}
      <section id="services" className="py-5 bg-light">
        <div className='container'>
          <div className="section-header text-center mb-5" data-aos="fade-up">
            <div className="section-title">
              <h2>
                <FontAwesomeIcon icon={faConciergeBell} className="me-2 text-primary" />
                {t('home.servicesHeading')}
              </h2>
            </div>
            <p className="text-muted my-2 fs-5">
              {t('home.servicesSubheading')}
            </p>
          </div>
        </div>

        <Services showFeaturedOnly={true} />

        <div className="text-center mt-4" data-aos="fade-up">
          <Link to="/services" className="btn btn-primary rounded-pill px-4 py-2 ">
            {t('home.viewAllServices')}
          </Link>
        </div>
      </section>

      {/* <ParallaxImageSection imageUrl={ParallaxImage} heading="Your Text Here" summary={'Your summary here'} /> */}
      {/* <ParallaxVideoSection videoUrl={ParallaxVideo} text='asasas' /> */}

      {/* Contact Section */}
      <section >
        {/* <Contact /> */}
        <NewsletterSection />
      </section>

    </div>
  );
};

export default Index;
