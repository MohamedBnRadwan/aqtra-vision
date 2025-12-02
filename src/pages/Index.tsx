import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '@/components/Header';
import Services from '@/components/Services';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import HeroIntro from '@/components/HeroIntro';
import CustomHeader from '@/components/CustomHeader';

const Index = () => {
  useEffect(() => {
    AOS.init({
      duration: 500,
      // once: true,
      easing: 'ease-out',
      offset: 100,
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* <Header /> */}
      <CustomHeader />
      <main>
        {/* <Hero /> */}
        <HeroIntro />
       
        <Services />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
