import { CheckCircle, Award, Users, Lightbulb } from 'lucide-react';
import watermarkIcon from '@/assets/watermark-icon.png';

const About = () => {
  const features = [
    {
      icon: Award,
      title: 'Quality Excellence',
      description: 'Committed to delivering the highest standards in every project',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Skilled professionals with years of engineering experience',
    },
    {
      icon: Lightbulb,
      title: 'Innovative Solutions',
      description: 'Cutting-edge technology integrated into practical applications',
    },
  ];

  return (
    <section id="about" className="py-20 bg-white relative overflow-hidden">
      {/* Background Watermark */}
      <div 
        className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-5 w-1/2 h-auto pointer-events-none"
        style={{
          backgroundImage: `url(${watermarkIcon})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          height: '600px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div data-aos="fade-right">
            <h2 className="mb-6 text-foreground">About AQTRA</h2>
            <div className="space-y-4 text-lg text-foreground/80">
              <p>
                AQTRA is a leading engineering and contracting company dedicated to delivering integrated solutions across multiple disciplines. Our commitment to accuracy and quality is reflected in every project we undertake.
              </p>
              <p>
                From smart home automation to sustainable solar energy systems, we combine technical expertise with innovative thinking to create solutions that enhance modern living and business operations.
              </p>
              <p>
                Our comprehensive service portfolio includes HVAC systems, plumbing, electrical installations, and network infrastructure – all designed to meet the evolving needs of our clients.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {[
                'Licensed & Certified Engineers',
                'Comprehensive Project Management',
                '24/7 Support & Maintenance',
                'Sustainable & Energy-Efficient Solutions',
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                  <span className="text-foreground font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Features */}
          <div className="space-y-6" data-aos="fade-left">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-secondary/50 p-6 rounded-xl hover-lift hover:shadow-lg transition-all"
                  data-aos="fade-left"
                  data-aos-delay={index * 100}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
                      <p className="text-foreground/70">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
