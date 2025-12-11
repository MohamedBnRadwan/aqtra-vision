import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Services from '@/components/Services';
import About from '@/components/About';
import HeroIntro from '@/components/HeroIntro';
import NewsletterSection from '@/components/NewsletterSection';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faConciergeBell } from '@fortawesome/free-solid-svg-icons';
import ParallaxImageWithTextBG from '@/components/ParallaxImageWithTextBG';

const Index = () => {
  useEffect(() => {
    AOS.init({
      duration: 500,
      easing: 'ease-out',
      offset: 100,
    });
  }, []);

  return (
    <div className="mt-5 overflow-x-hidden">
    
      {/* Hero Section */}
      <section className="mb-5 d-flex flex-column justify-content-center align-items-center">
        <HeroIntro />
      </section>

      {/* About Section */}
      <section>

        <About />
      </section>

      {/* Services Section */}
      <section id="services" className="py-5 bg-light">
        <div className="section-header text-center mb-5" data-aos="fade-up">
          <div className="section-title">
            <h2>
              <FontAwesomeIcon icon={faConciergeBell} className="me-2 text-primary" />
              Our Services
            </h2>
          </div>
          <p className="text-muted my-2 fs-5">
            Comprehensive engineering solutions tailored to your needs
          </p>
        </div>

        <Services showFeaturedOnly={true} />

        <div className="text-center mt-4" data-aos="fade-up">
          <Link to="/services" className="btn btn-primary rounded-pill px-4 py-2 ">
            View All Services
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
