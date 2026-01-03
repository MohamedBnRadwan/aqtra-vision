import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from './ui/use-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Contact.css';
import AOS from 'aos';


const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    AOS.init({ duration: 1000, easing: 'ease-in-out', once: true });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: t('contact.missingInfoTitle'),
        description: t('contact.missingInfoDescription'),
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('contact.messageSentTitle'),
      description: t('contact.messageSentDescription'),
    });

    // Reset form
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: t('contact.phoneTitle'),
      content: '+966 056 240 5666',
      link: 'tel:+9660562405666',
    },
    {
      icon: Mail,
      title: t('contact.emailTitle'),
      content: 'info@aqtraco.com',
      link: 'mailto:info@aqtraco.com',
    },
    {
      icon: MapPin,
      title: t('contact.locationTitle'),
      content: '8060 Prince Muhammad St., Al Khobar Al Shamalia, Al Khobar 34425, Saudi Arabia',
      link: 'https://maps.app.goo.gl/1bKxda2cTEAoHvv57',
    },
  ];

  return (
    <section id="contact" className="py-5 position-relative overflow-hidden">
      <div
        className="position-absolute top-0 start-0 w-100 h-100"

      ></div>

      <div className="container position-relative" style={{ zIndex: 1 }}>



        <div className="row g-4">
          <div className="col-12 text-center">
            <div className="mb-4 section-title">
              <h3>
                {t('contact.sectionTitle')}
              </h3>
            </div>
            <p className="text-muted">
              {t('contact.sectionDescription')}
            </p>
          </div>
          {/* Contact Information */}

          <div className="col-lg-6" data-aos="fade-right" >

            <h3 className="h5 mb-3" onClick={() => {
              toast({
                title: t('contact.messageSentTitle'),
                description: t('contact.messageSentDescription'),
              });
            }}>{t('contact.contactInformationTitle')}</h3>
            <p className="text-muted mb-4">
              {t('contact.contactInformationDescription')}
            </p>

            <ul className="list-unstyled">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <li key={index} className="custom-list-item mb-3">
                    <a href={info.link} target='_blank' rel="noopener noreferrer" className="d-flex align-items-start text-muted text-decoration-none">
                      <div className="me-3">
                        <Icon className="text-primary" size={24} />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">{info.title}</h6>
                        {info.content}
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Form */}
          <div className="col-lg-6" data-aos="fade-left">
            <form onSubmit={handleSubmit} className="p-4 rounded contact-form shadow-sm">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  {t('contact.fullName')}
                </label>
                <input
                  id="name"
                  type="text"
                  className="form-control"
                  placeholder={t('contact.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  {t('contact.emailAddress')}
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder={t('contact.emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  {t('contact.phoneNumber')}
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="form-control"
                  placeholder={t('contact.phonePlaceholder')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="message" className="form-label">
                  {t('contact.message')}
                </label>
                <textarea
                  id="message"
                  className="form-control"
                  placeholder={t('contact.messagePlaceholder')}
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-100">
                <Send className="me-2" size={18} /> {t('contact.submit')}
              </button>
            </form>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
