import React, { useEffect, useMemo, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  animate,
} from 'framer-motion';
import {
  CircuitBoard,
  Home,
  RadioTower,
  Sun,
  ThermometerSnowflake,
  ShieldCheck,
  BadgeCheck,
  Workflow,
} from 'lucide-react';

const MagneticWrapper = ({ children, strength = 0.18, className = '' }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 420, damping: 32, mass: 0.8 });
  const springY = useSpring(y, { stiffness: 420, damping: 32, mass: 0.8 });

  const handleMove = (e) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    const dx = e.clientX - (bounds.left + bounds.width / 2);
    const dy = e.clientY - (bounds.top + bounds.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
};

const AboutUs = () => {
  const stats = useMemo(
    () => [
      { label: 'Years Engineering Excellence', value: 10 },
      { label: 'Projects Delivered', value: 500 },
      { label: 'Cities Served', value: 24 },
      { label: 'Certified Specialists', value: 80 },
    ],
    [],
  );

  const services = useMemo(
    () => [
      {
        title: 'HVAC Systems',
        description: 'High-efficiency climate control with digital twins and smart monitoring.',
        icon: <ThermometerSnowflake className="h-6 w-6" />,
      },
      {
        title: 'Smart Home',
        description: 'Adaptive automation, security, and energy orchestration for modern living.',
        icon: <Home className="h-6 w-6" />,
      },
      {
        title: 'Solar & Storage',
        description: 'Grid-synced solar, battery optimization, and predictive maintenance.',
        icon: <Sun className="h-6 w-6" />,
      },
      {
        title: 'Low-Current Systems',
        description: 'Critical communications, BMS, and safety systems engineered for uptime.',
        icon: <CircuitBoard className="h-6 w-6" />,
      },
      {
        title: 'IoT & Edge',
        description: 'Sensor networks, data pipelines, and AI-driven insights at the edge.',
        icon: <RadioTower className="h-6 w-6" />,
      },
    ],
    [],
  );

  const certifications = useMemo(
    () => [
      { label: 'ISO 9001 Quality', icon: <ShieldCheck className="h-5 w-5" /> },
      { label: 'ISO 27001 Security', icon: <ShieldCheck className="h-5 w-5" /> },
      { label: 'LEED Practitioners', icon: <BadgeCheck className="h-5 w-5" /> },
      { label: 'Project Management (PMP)', icon: <Workflow className="h-5 w-5" /> },
      { label: 'Energy Efficiency', icon: <BadgeCheck className="h-5 w-5" /> },
    ],
    [],
  );

  return (
    <div className="container-fluid">
      {/* Hero */}
      <section className="position-relative overflow-hidden px-3 py-5">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient" />
        <div className="row align-items-center g-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-120px' }}
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }}
            className="col-md-6 bg-light p-4 rounded shadow"
          >
            <span className="badge bg-primary text-uppercase">Advanced Engineering</span>
            <h1 className="display-4 fw-bold">Engineering the Future</h1>
            <p className="lead">
              AQTRACO blends engineering rigor with IoT intelligence to build resilient, data-driven environments
              — from smart homes and cities to critical infrastructure.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-info">Design-Build</span>
              <span className="badge bg-secondary">Digital Twins</span>
              <span className="badge bg-success">24/7 Monitoring</span>
            </div>
          </motion.div>

          <MagneticWrapper strength={0.2} className="col-md-6">
            <div className="position-relative overflow-hidden rounded shadow">
              <motion.img
                src="/src/assets/hero/engineering.jpg"
                alt="Engineers collaborating around digital dashboards"
                className="img-fluid rounded"
                whileHover={{ scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              />
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient" />
            </div>
          </MagneticWrapper>
        </div>
      </section>

      {/* Stats */}
      <section className="px-3 py-5">
        <div className="container">
          <div className="row mb-4">
            <div className="col">
              <p className="text-uppercase text-info">Impact Metrics</p>
              <h2 className="fw-bold">Performance at Scale</h2>
            </div>
          </div>

          <div className="row g-4">
            {stats.map((stat) => (
              <div key={stat.label} className="col-md-3">
                <div className="bg-light p-3 rounded shadow">
                  <span className="h1 text-primary">{stat.value}+</span>
                  <p className="text-uppercase small text-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="px-3 py-5">
        <div className="container">
          <div className="row mb-4">
            <div className="col">
              <p className="text-uppercase text-secondary">Capabilities</p>
              <h2 className="fw-bold">Systems That Think Ahead</h2>
              <p className="text-muted">
                Full-lifecycle engineering across mechanical, electrical, and digital layers — purpose-built for reliability and real-time insight.
              </p>
            </div>
          </div>

          <div className="row g-4">
            {services.map((service) => (
              <div key={service.title} className="col-md-4">
                <div className="bg-light p-3 rounded shadow">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary text-white p-2 rounded-circle">
                      {service.icon}
                    </div>
                  </div>
                  <h3 className="h5 fw-bold">{service.title}</h3>
                  <p className="text-muted">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance / Certifications */}
      <section className="px-3 py-5">
        <div className="container bg-light p-4 rounded shadow">
          <div className="row mb-4">
            <div className="col">
              <p className="text-uppercase text-success">Compliance</p>
              <h3 className="fw-bold">Certified for Mission-Critical Delivery</h3>
              <p className="text-muted">
                We build to international standards with auditable processes and secure-by-design principles.
              </p>
            </div>
          </div>

          <div className="row g-3">
            {[...certifications, ...certifications].map((item, idx) => (
              <div key={`${item.label}-${idx}`} className="col-md-2">
                <div className="bg-light p-2 rounded shadow d-flex align-items-center">
                  <span className="text-primary me-2">{item.icon}</span>
                  <span className="small fw-bold">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;