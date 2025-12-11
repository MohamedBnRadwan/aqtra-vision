import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import "smoothscroll-for-websites"; // No variable is needed
import ServicesPage from "./pages/ServicesPage";
import ServicePage from "./pages/ServicePage";
import ContactPage from "./pages/ContactPage";
import HVACSolutions from "./pages/services/HVACSolutions";
import AboutUs from "./pages/AboutUs";
import SaudiVision2030 from "./pages/SaudiVision2030";
import PageLoader from "./pages/PageLoader";
import CookiesPolicy from "./components/CookiesPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CookiesPolicy />
      <BrowserRouter>
        <Layout>
          <PageLoader>

            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServicePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/hvac-solutions" element={<HVACSolutions />} />
              <Route path="/saudi-vision-2030" element={<SaudiVision2030 />} />
              {/* Ignore /assets route to allow static files */}
              <Route path="/src/assets/*" element={null} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageLoader>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
