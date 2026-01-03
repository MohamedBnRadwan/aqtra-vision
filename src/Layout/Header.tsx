import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoHorizontal from '@/assets/logo-horizontal.png';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [isLangLoading, setIsLangLoading] = useState(false);
  const toggleLanguage = () => {
    if (isLangLoading) return;
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    setIsLangLoading(true);
    i18n.changeLanguage(next).finally(() => setIsLangLoading(false));
  };
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg py-3' : 'bg-white/95 backdrop-blur-sm py-4'
      }`}
    >
      <nav className="container mx-auto px-4 flex items-center justify-between">
        <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>
          <img src={logoHorizontal} alt="AQTRA Logo" className="h-12 md:h-14 w-auto" />
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#services"
            onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            {t('nav.services')}
          </a>
          <a
            href="#about"
            onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            {t('nav.about')}
          </a>
          <Button 
            variant="outline"
            onClick={toggleLanguage}
            className="border-foreground/30 flex items-center gap-2"
            disabled={isLangLoading}
          >
            <span className="font-semibold">{i18n.language === 'ar' ? 'E' : 'ع'}</span>
            {isLangLoading && <span className="inline-block w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden="true" />}
          </Button>
          <Button 
            onClick={() => scrollToSection('contact')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {t('nav.contactUs')}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-xl md:hidden">
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              <a
                href="/services"
                onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                {t('nav.services')}
              </a>
              <a
                href="#about"
                onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                {t('nav.about')}
              </a>
              <Button 
                variant="outline"
                onClick={toggleLanguage}
                className="border-foreground/30 flex items-center gap-2"
                disabled={isLangLoading}
              >
                <span className="font-semibold">{i18n.language === 'ar' ? 'E' : 'ع'}</span>
                {isLangLoading && <span className="inline-block w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden="true" />}
              </Button>
              <Button 
                onClick={() => scrollToSection('contact')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
              >
                {t('nav.contactUs')}
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
