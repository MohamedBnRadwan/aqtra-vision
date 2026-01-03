import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBg1 from '@/assets/hero-bg-1.jpg';
import heroBg2 from '@/assets/hero-bg-2.jpg';
import heroBg3 from '@/assets/hero-bg-3.jpg';

const Hero = () => {
  const { t } = useTranslation();
  const [currentBg, setCurrentBg] = useState(0);
  const backgrounds = [heroBg1, heroBg2, heroBg3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images with Transition */}
      {backgrounds.map((bg, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentBg ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <h1 
          className="mb-6 font-bold leading-tight animate-fade-in-up"
          data-aos="fade-up"
          data-aos-duration="800"
        >
          {t('home.heroTitle')}
        </h1>
        <div 
          className="mb-8 text-xl md:text-2xl lg:text-3xl font-light"
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="800"
        >
          {t('home.heroSubtitle')}
        </div>
        <p 
          className="mb-10 text-lg md:text-xl max-w-3xl mx-auto text-white/90"
          data-aos="fade-up"
          data-aos-delay="400"
          data-aos-duration="800"
        >
          {t('home.heroDescription')}
        </p>
        <div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          data-aos="fade-up"
          data-aos-delay="600"
          data-aos-duration="800"
        >
          <Button 
            size="lg"
            onClick={() => scrollToSection('services')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 shadow-glow"
          >
            {t('home.heroPrimaryCta')}
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => scrollToSection('contact')}
            className="bg-white/10 border-white text-white hover:bg-white hover:text-foreground text-lg px-8 py-6 backdrop-blur-sm"
          >
            {t('home.heroSecondaryCta')}
          </Button>
        </div>

        {/* Background Dots Indicator */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
          {backgrounds.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBg(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentBg ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="text-white w-8 h-8" />
      </div>
    </section>
  );
};

export default Hero;
