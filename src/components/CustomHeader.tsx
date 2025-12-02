import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle } from 'lucide-react';

import logoHorizontal from '@/assets/logo-icon.png';

const CustomHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

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
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white text-foreground shadow-md' : 'bg-light/50 backdrop-blur-sm text-white'
      } py-5`}
    >
      <nav className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo and Website Name */}
        <div className="flex items-center gap-3">
          <img src={logoHorizontal} alt="AQTRA Logo" className="h-12 w-auto" />
          <span className="text-2xl font-bold">AQTRA</span>
        </div>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center gap-10">
          <a
            href="#services"
            onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}
            className="hover:text-primary transition-colors font-medium"
          >
            Services
          </a>
          <a
            href="#about"
            onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
            className="hover:text-primary transition-colors font-medium"
          >
            About
          </a>
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
            className="hover:text-primary transition-colors font-medium"
          >
            Contact
          </a>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-5">
          <a
            href="https://wa.me/your-number"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <MessageCircle size={20} /> WhatsApp
          </a>
          <a
            href="tel:+123456789"
            className="flex items-center gap-2 border-2 bg-primary border-primary text-white px-5 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            <Phone size={20} /> Call
          </a>
        </div>
      </nav>
    </header>
  );
};

export default CustomHeader;