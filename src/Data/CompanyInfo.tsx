import { faFacebookF, faInstagram, faLinkedinIn, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

export const facebookLink = "https://www.facebook.com/AQTRACO";
export const instagramLink = "https://www.instagram.com/aqtra.co/";
export const linkedinLink = "https://www.linkedin.com/company/aqtraco";
export const xLink = "https://x.com/AQTRACO";
export const whatsAppNumber = "966565210897";

export const contactEmail = "info@aqtraco.com";
export const contactPhone = "+966 (056) 521 0897";
export const whatsappLink = `https://wa.me/${whatsAppNumber}`;
export const phoneLink = `tel:${contactPhone.replace(/[^0-9+]/g, "")}`;

export const contactAddress =
  "8060 Prince Muhammad St., Al Khobar Al Shamalia, Al Khobar 34425, Saudi Arabia";
export const contactAddressLink =
  "https://maps.app.goo.gl/1bKxda2cTEAoHvv57";

export const socialLinks = [
  {
    title: "Facebook",
    icon: faFacebookF,
    href: facebookLink,
    label: "Facebook",
    nav: true,
    newTab: true,
  },
  {
    title: "Instagram",
    icon: faInstagram,
    href: instagramLink,
    label: "Instagram",
    nav: true,
    newTab: true,
  },
  {
    title: "LinkedIn",
    icon: faLinkedinIn,
    href: linkedinLink,
    label: "LinkedIn",
    nav: true,
    newTab: true,
  },
  {
    title: "Twitter",
    icon: faTwitter,
    href: xLink,
    label: "Twitter",
    nav: true,
    newTab: true,
  },
  {
    title: "WhatsApp",
    icon: faWhatsapp,
    href: whatsappLink,
    label: "WhatsApp",
    nav: false,
    newTab: true,
  },
];

export const contactInfo = [
  {
    title: "Email",
    content: contactEmail,
    icon: "Mail",
    link: `mailto:${contactEmail}`,
  },
  {
    title: "Phone",
    content: contactPhone,
    icon: "Phone",
    link: `tel:${contactPhone.replace(/[^0-9+]/g, "")}`,
  },
  {
    title: "Whatsapp",
    content: whatsAppNumber,
    icon: "WhatsApp",
    link: whatsappLink,
  },
  {
    title: "Address",
    content: contactAddress,
    icon: "MapPin",
    link: contactAddressLink,
  },
];