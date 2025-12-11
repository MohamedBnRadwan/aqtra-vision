import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import HeaderBanner from "@/components/HeaderBanner";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <HeaderBanner
        title="404 Page Not Found"
        subtitle="May something good is going to happen, stay updated."
      />
      <h1 className="d-none">404</h1>

      <div className="container py-5 text-center">
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="flex justify-center gap-4 mb-4">
              <img src="/src/assets/404.svg" alt="Placeholder 1" className="w-32 h-32" />
            </div>
            <h2 className="mb-4">Oops! The page you're looking for doesn't exist.</h2>
            <p className="mb-4 text-xl text-gray-600">
              Good things are cooking! We're working to bring this page to life. Stay around for updates.
            </p>

            <Link to="/" className="btn btn-primary rounded-pill px-4 py-2 mb-4">
              Return to Home
            </Link>
            <p className="mb-4 text-muted">
              It seems you've ventured into uncharted territory. Don't worry, let's get you back on track!
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
