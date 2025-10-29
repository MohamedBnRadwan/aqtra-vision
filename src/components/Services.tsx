import { Home, Sun, Wind, Droplet, Zap, Network } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const services = [
  {
    icon: Home,
    title: 'Smart Home Systems',
    description: 'Advanced home automation for modern living',
    items: ['Smart Lighting', 'Smart Locks', 'Voice Control', 'Home Theater', 'HVAC Automation'],
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Sun,
    title: 'Solar Energy',
    description: 'Sustainable power solutions for your future',
    items: ['Solar Panel Installation', 'On/Off/Hybrid Grid Systems', 'Battery Storage', 'EPC & Maintenance'],
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Wind,
    title: 'HVAC & Chiller',
    description: 'Climate control and air quality solutions',
    items: ['Ducting Fabrication', 'Chillers', 'Air Handling Units', 'Maintenance'],
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
  },
  {
    icon: Droplet,
    title: 'Plumbing',
    description: 'Complete water and drainage systems',
    items: ['Water & Drainage Systems', 'Heaters', 'Solar Hot Water', 'Leak Detection'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Zap,
    title: 'Electrical',
    description: 'Professional electrical installations',
    items: ['Power Distribution', 'Panels', 'Lighting', 'Backup Systems', 'Earthing'],
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  {
    icon: Network,
    title: 'Network & IT',
    description: 'Modern IT infrastructure solutions',
    items: ['Structured Cabling', 'Wi-Fi', 'CCTV', 'Access Control', 'Data Rack Setup'],
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
];

const Services = () => {
  return (
    <section id="services" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="mb-4 text-foreground">Our Services</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive engineering solutions tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="hover-lift hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <CardHeader>
                  <div className={`w-16 h-16 ${service.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 ${service.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.items.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
