import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import HeaderBanner from "@/components/HeaderBanner";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <HeaderBanner
        title={t('notFound.title')}
        subtitle={t('notFound.subtitle')}
      />
      <h1 className="d-none">404</h1>

      <div className="container py-5 text-center">
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="flex justify-center gap-4 mb-4">
              <img src="/src/assets/404.svg" style={{maxWidth: '80vw'}} alt={t('notFound.title')} className="w-32 h-32" />
            </div>
            <h2 className="mb-4">{t('notFound.heading')}</h2>
            <p className="mb-4 text-xl text-gray-600">
              {t('notFound.description')}
            </p>

            <Link to="/" className="btn btn-primary rounded-pill px-4 py-2 mb-4">
              {t('notFound.returnHome')}
            </Link>
            <p className="mb-4 text-muted">
              {t('notFound.footerText')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
