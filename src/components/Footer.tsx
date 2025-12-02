import { Facebook, Instagram, Linkedin, X } from 'lucide-react';
import logoVerticalLight from '@/assets/logo-vertical-light.png';
import watermarkText from '@/assets/watermark-text.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      'Smart Home Systems',
      'Solar Energy',
      'HVAC & Chiller',
      'Plumbing',
      'Electrical',
      'Network & IT',
    ],
    company: ['About Us', 'Contact', 'Projects', 'Careers'],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/AQTRACO', label: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/aqtra.co/', label: 'Instagram' },
    { icon: Linkedin, href: 'https://www.linkedin.com/company/aqtraco', label: 'LinkedIn' },
    { icon: X, href: 'https://x.com/AQTRACO', label: 'Twitter' },
  ];

  return (
    <footer className="bg-foreground text-white">
     
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <img src={logoVerticalLight} alt="AQTRA Logo" className="h-32 w-auto mb-4" />
            <p className="text-white/70 text-sm leading-relaxed">
              Integrated engineering solutions for modern living and business operations.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-lg mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <a href="#services" className="text-white/70 hover:text-primary transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-white/70 hover:text-primary transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-bold text-lg mb-4">Connect With Us</h4>
            <div className="space-y-3 mb-6">
              <p className="text-white/70 text-sm">info@aqtraco.com</p>
              <p className="text-white/70 text-sm">+966 056 240 5666</p>
            </div>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={watermarkText} alt="AQTRA" className="h-6 w-auto opacity-50" />
            </div>
            <p className="text-white/50 text-sm text-center">
              © {currentYear} AQTRA. All rights reserved.
            </p>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
