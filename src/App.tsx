import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./Layout/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import "smoothscroll-for-websites";
import ServicesPage from "./pages/ServicesPage";
import ServicePage from "./pages/ServicePage";
import ContactPage from "./pages/ContactPage";
import Solutions from "./pages/solutions/Solutions";
import HVACSolutions from "./pages/solutions/HVACSolutions";
import SolarSolutions from "./pages/solutions/SolarSolutions";
import OnGrid from "./pages/solutions/solar-solutions/OnGrid";
import OffGrid from "./pages/solutions/solar-solutions/OffGrid";
import Hybrid from "./pages/solutions/solar-solutions/Hybrid";
import Pump from "./pages/solutions/solar-solutions/Pump";
import SolarApplicationForm from "./pages/solutions/solar-solutions/SolarApplicationForm";
import SolarWizard from "./pages/solutions/solar-solutions/SolarWizard";
import AboutUs from "./pages/AboutUs";
import SaudiVision2030 from "./pages/SaudiVision2030";
import PageLoader from "./pages/PageLoader";
import CookiesPolicy from "./components/CookiesPolicy";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Portfolio from "./pages/Portfolio";


const queryClient = new QueryClient();

const App = () => {
  const location = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 500,
      easing: "ease-out",
      offset: 100,
      once: false,
    });

    AOS.refresh();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CookiesPolicy />

        <Layout>
          <PageLoader>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServicePage />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/solutions" element={<Solutions />} />
              <Route path="/hvac-solutions" element={<HVACSolutions />} />
              <Route path="/solar-solutions" element={<SolarSolutions />} />
              <Route path="/solar/on-grid" element={<OnGrid />} />
              <Route path="/solar/off-grid" element={<OffGrid />} />
              <Route path="/solar/hybrid" element={<Hybrid />} />
              <Route path="/solar/pump" element={<Pump />} />
              <Route path="/solar-calculation" element={<SolarApplicationForm />} />
              <Route path="/solar-wizard" element={<SolarWizard />} />
              <Route path="/saudi-vision-2030" element={<SaudiVision2030 />} />
              <Route path="/src/assets/*" element={null} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageLoader>
        </Layout>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
