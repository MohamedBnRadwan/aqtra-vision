import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Services from '@/components/Services';
import About from '@/components/About';
import Contact from '@/components/Contact';
import HeroIntro from '@/components/HeroIntro';

const Index = () => {
  useEffect(() => {
    AOS.init({
      duration: 500,
      easing: 'ease-out',
      offset: 100,
    });
  }, []);

  return (
    <div className="container-fluid mt-5">
      {/* Hero Section */}
      <section className="mb-5">
        <HeroIntro />
      </section>

      {/* Services Section */}
      <section className="mb-5">
        <Services />
      </section>

      {/* About Section */}
      <section className="mb-5">
        <About />
      </section>

      {/* Contact Section */}
      <section className="mb-5">
        <Contact />
      </section>
    </div>
  );
};

export default Index;
