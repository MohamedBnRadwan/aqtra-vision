
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logoVerticalLight from '@/assets/AQTRA-LOGO-TEXT-COLORD.png';
import * as Brands from "@fortawesome/free-brands-svg-icons";
import { Link } from 'react-router-dom';
import { SocialLinks } from '@/Data/CompanyInfo.json';
import './Footer.css';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  // let [FooterSpaceHeight, setFooterSpaceHeight] = useState(0);
  // useEffect(() => {
  //   const updateFooterHeight = () => {
  //     setFooterSpaceHeight(document.getElementById('footer-space')?.offsetHeight || 0);
  //   };
  //   updateFooterHeight();
  //   window.addEventListener('resize', updateFooterHeight);
  //   return () => window.removeEventListener('resize', updateFooterHeight);
  // }, []);



  const footerLinks = {
    services: [
      { id: 'smart-home-systems', href: '/services/smart-home-systems' },
      { id: 'solar-energy', href: '/services/solar-energy' },
      { id: 'hvac-chiller', href: '/services/hvac-chiller' },
      { id: 'plumbing', href: '/services/plumbing' },
      { id: 'electrical', href: '/services/electrical' },
      { id: 'network-security', href: '/services/network-security' },
    ],
    company: [
      { nameKey: 'footerLinks.about', href: '/about-us' },
      { nameKey: 'footerLinks.contact', href: '/contact' },
      { nameKey: 'footerLinks.projects', href: '/projects' },
      { nameKey: 'footerLinks.careers', href: '/careers' },
      // { name: 'Saudi Vision 2030', href: '/saudi-vision-2030' },
    ],
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* <div id="footer-space" style={{ marginBottom: FooterSpaceHeight }}></div> */}
      {/* <hr className='m-0' /> */}

      <footer>

        <div className="container">
          <div className="row mb-4">
            <div className='col-12'>
              <button
                title={t('footer.backToTop')}
                onClick={scrollToTop}
                className="btn border-0 float-end mb-4 footer-backtotop"
                aria-label={t('footer.backToTop')}
              >
                <FontAwesomeIcon icon={faArrowUp} size='2x' className='text-primary' />
              </button>
              <img src={logoVerticalLight} alt="AQTRA Logo" className="mb-4 p-2 float-start footer-logo" style={{ height: '100px' }} />
            </div>
            {/* Company Info */}
            <div className="col-lg-4 mb-3">
              <p>
                {t('footer.description')}
              </p>

            </div>

            {/* Services Links */}
            <div className="col-lg-4 col-md-6 mb-3">
              <h5>{t('footer.servicesTitle')}</h5>
              <ul className="list-unstyled">
                {footerLinks.services.map((service, index) => (
                  <li key={index} className="d-flex align-items-center">
                    <Link to={service.href}>{t(`servicesData.${service.id}.title`)}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="col-lg-4 col-md-6 mb-3">
              <h5>{t('footer.companyTitle')}</h5>
              <ul className="list-unstyled">
                {footerLinks.company.map((link, index) => (
                  <li key={index} className="d-flex align-items-center">
                    <Link to={link.href}>{t(link.nameKey)}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className='col-12'>
              <p>
                {t('footer.inviteText')}
              </p>
              <Link to="/contact" className="btn btn-primary rounded-pill btn-lg fs-4 px-4 py-3">
                {t('footer.contactCta')}
              </Link>
              <img src="/src/assets/saudi_vision_2030_logo.svg" style={{ height: '100px' }} alt={t('saudiVision.logoAlt')} className="mb-4 float-end footer-vision" />
            </div>
          </div>
          {/* Social Links */}
          <div className="row mt-4 pt-3">
            <hr className="hr mb-5" />
            <div className="col-md-6 d-flex flex-row justify-content-center justify-content-md-start my-2 text-start">
              <p className="mb-0">&copy; {currentYear} AQTRA. {t('footer.rights')}</p>
            </div>
            <div className="col-md-6 d-flex flex-row justify-content-center justify-content-md-end my-2 text-end">
              {SocialLinks[0].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light d-flex align-items-center justify-content-center rounded-circle mx-2"
                  style={{ width: '40px', height: '40px' }}
                >
                  <FontAwesomeIcon icon={Brands[social.icon]} />
                </a>
              ))}
            </div>

          </div>
        </div>

      </footer>
    </>
  );
};

export default Footer;