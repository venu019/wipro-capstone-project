import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// --- Brand & Style Configuration ---
const brand = {
  navy: "#011A4B",
  red: "#E31837",
  gray: "#f5f7fb",
  gradient: "linear-gradient(135deg, #011A4B, #002d7a, #011A4B)",
};

const MaxWidth = ({ width, children }) => (
  <div style={{ maxWidth: width, margin: "0 auto" }}>{children}</div>
);

// --- Main Component ---
const PreLoginHome = () => {
  const navigate = useNavigate();
  const [coords, setCoords] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  const defaultLat = 12.9716; // Default to Bangalore, India
  const defaultLng = 77.5946;
  const mapLat = coords?.latitude || defaultLat;
  const mapLng = coords?.longitude || defaultLng;
  const mapSrc = `https://maps.google.com/maps?q=${mapLat},${mapLng}&z=14&output=embed`;

  // --- Geolocation Logic ---
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords(position.coords);
        setGeoLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        let errorMsg = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) errorMsg = "Location access was denied.";
        setGeoError(errorMsg);
      }
    );
  };

  useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 100 });
    requestLocation();
  }, []);

  // --- Content specific to Flix Bus ---
  const testimonials = [
    {
      name: "Sunita Sharma",
      role: "Frequent Traveler",
      quote: "Flix Bus made my last-minute travel plans so easy. The booking was instant, and the journey was comfortable!",
      image: "https://randomuser.me/api/portraits/women/45.jpg",
      rating: 5,
    },
    {
      name: "Vikram Singh",
      role: "Software Engineer",
      quote: "Finally, a clean and modern app for booking buses in India. The live tracking is a game-changer. Highly recommended!",
      image: "https://randomuser.me/api/portraits/men/65.jpg",
      rating: 5,
    },
    {
      name: "Anjali Mehta",
      role: "Student",
      quote: "Affordable, reliable, and always on time. Flix Bus is my go-to for weekend trips back home.",
      image: "https://randomuser.me/api/portraits/women/22.jpg",
      rating: 4,
    },
  ];

  const popularRoutes = [
    {
      name: "Bangalore → Hyderabad",
      desc: "Connect between two of India's biggest tech hubs with our overnight luxury fleet.",
      img: "https://images.pexels.com/photos/1660603/pexels-photo-1660603.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750",
    },
    {
      name: "Mumbai → Pune",
      desc: "The classic expressway journey, made comfortable and quick with our frequent daily trips.",
      img: "https://images.pexels.com/photos/1400233/pexels-photo-1400233.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750",
    },
    {
      name: "Delhi → Manali",
      desc: "Escape to the mountains. Our scenic route is the perfect start to your Himalayan adventure.",
      img: "https://images.pexels.com/photos/775417/pexels-photo-775417.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750",
    },
  ];
  
  const milestones = [
    {
      year: "2025",
      title: "Platform Launch",
      desc: "Flix Bus was born to redefine bus travel in India — making it 100% digital, reliable, and accessible.",
      img: "https://images.unsplash.com/photo-1570125909248-b39b06f36f40?w=800",
      icon: "bi-rocket-takeoff-fill",
    },
    {
      year: "2026",
      title: "100+ City Network",
      desc: "Expanded our services to over 100 cities, connecting millions of passengers across the nation.",
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
      icon: "bi-signpost-split-fill",
    },
    {
      year: "2027",
      title: "Live Bus Tracking",
      desc: "Introduced industry-first live GPS tracking on all buses, providing peace of mind to every passenger.",
      img: "https://images.unsplash.com/photo-1579637322053-53b3154e5296?w=800",
      icon: "bi-broadcast-pin",
    },
    {
      year: "2028",
      title: "Most Trusted Platform",
      desc: "Awarded 'Most Trusted Travel Partner' for our commitment to safety, reliability, and customer service.",
      img: "https://images.unsplash.com/photo-1517486808906-6538cb3f3ee5?w=800",
      icon: "bi-patch-check-fill",
    },
  ];

  const awards = [
    {
      icon: "bi-trophy-fill",
      title: "Best Travel Tech 2027",
      org: "Digital India Travel Awards",
    },
    {
      icon: "bi-shield-check",
      title: "Passenger Safety Excellence",
      org: "National Transport Safety Board",
    },
    {
      icon: "bi-globe-americas",
      title: "Widest Network Coverage",
      org: "India Travel Mart 2028",
    },
  ];

  return (
    <div style={{ backgroundColor: brand.gray, overflowX: "hidden" }}>
      {/* --- HERO SECTION --- */}
      <section
        className="hero-wrap text-white position-relative d-flex align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background: `linear-gradient(180deg, rgba(2,6,23,0.15), rgba(2,6,23,0.10)), url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
        }}
      >
        <div
          className="hero-glass"
          style={{
            position: "absolute", left: "25%", top: "50%", transform: "translate(-50%, -50%)",
            width: "90%", maxWidth: "600px",
            background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            backdropFilter: "blur(8px) saturate(120%)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px", padding: "25px", color: "white", zIndex: 2,
          }}
        >
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "12px" }}>
            Welcome to <span style={{ color: brand.red }}>Flix Bus</span>
          </h1>
          <p style={{ fontSize: "1.1rem", marginBottom: "24px", opacity: 0.9 }}>
            India's trusted bus reservation platform. Comfortable, affordable, and hassle-free travel starts here.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button className="btn btn-danger" onClick={() => navigate("/search")}>
              <i className="bi bi-search me-2"></i>Search Buses
            </button>
            <button className="btn btn-outline-light" onClick={() => navigate("/login")}>
              Login or Register
            </button>
          </div>
        </div>
      </section>

      {/* --- CORE FEATURES SECTION --- */}
      <section className="py-5" style={{ backgroundColor: brand.gray }} id="services">
        <div className="container text-center">
          <h2 className="fw-bold mb-5" style={{ color: brand.navy }}>Why Choose Flix Bus?</h2>
          <div className="row row-cols-1 row-cols-md-4 g-4">
            {[
              { icon: "bi-ticket-detailed", title: "Instant Booking", desc: "Book your tickets in seconds with a seamless checkout." },
              { icon: "bi-shield-check", title: "Secure Payments", desc: "Your transactions are protected with industry-leading security." },
              { icon: "bi-tag-fill", title: "Best Price Guarantee", desc: "Find the best fares for your journey, every time." },
              { icon: "bi-headset", title: "24/7 Support", desc: "Our support team is always here to help you, day or night." },
            ].map((f, i) => (
              <motion.div className="col" key={i} data-aos="fade-up" data-aos-delay={i * 100} whileHover={{ scale: 1.05 }}>
                <div className="p-4 bg-white rounded-4 shadow-sm h-100">
                  <i className={`${f.icon} text-danger display-6 mb-3`}></i>
                  <h6 className="fw-bold">{f.title}</h6>
                  <p className="text-muted small">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* --- ABOUT SECTION --- */}
      <section className="py-5 position-relative" id="about" style={{ minHeight: '500px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url(https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1600)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', zIndex: 0 }}></div>
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
              <div className="row justify-content-left">
                  <div className="col-lg-8" data-aos="fade-up">
                      <div className="bg-white p-5 shadow-lg" style={{ borderRadius: '0px', backdropFilter: 'blur(10px)', marginTop: '60px' }}>
                          <h2 className="fw-bold mb-3" style={{ color: brand.navy }}>Travel Reinvented for India</h2>
                          <p className="text-muted mb-4">Established in 2025, Flix Bus is on a mission to make bus travel in India simple, reliable, and accessible for everyone.</p>
                          <ul className="list-unstyled text-muted">
                              <li className="mb-2">✅ 24/7 Booking Access on Any Device</li>
                              <li className="mb-2">✅ Verified Operators & Real-Time Tracking</li>
                              <li>✅ Transparent Pricing & Easy Cancellations</li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* --- POPULAR ROUTES SECTION --- */}
      <section className="py-5 bg-white text-center" id="cards">
        <div className="container">
          <h2 className="fw-bold mb-4" style={{ color: brand.navy }}>Explore Popular Routes</h2>
          <p className="text-muted mx-auto mb-5" style={{ maxWidth: "700px" }}>
            Travel to top destinations across the country with our extensive and reliable network.
          </p>
          <div className="row g-4 justify-content-center">
            {popularRoutes.map((c, i) => (
              <motion.div key={i} className="col-md-3" whileHover={{ y: -6 }} transition={{ duration: 0.3 }} data-aos="fade-up" data-aos-delay={i * 150}>
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                  <div style={{ height: "190px", backgroundImage: `url(${c.img})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                  <div className="card-body text-start">
                    <h6 className="fw-bold text-danger mb-2">{c.name}</h6>
                    <p className="text-muted small">{c.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MILESTONES SECTION --- */}
      <section className="py-5 position-relative overflow-hidden" style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)" }}>
        <div className="container text-center">
          <h2 className="fw-bold mb-2" style={{ color: brand.navy }}>Our Journey</h2>
          <p className="text-muted mb-5">Milestones that shaped our success</p>
          <div className="row g-4">
            {milestones.map((m, i) => (
              <motion.div key={i} className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay={i * 100} whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
                <div style={{ position: "relative", height: "450px", borderRadius: "0px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)", cursor: "pointer" }} className="milestone-card-v2">
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: `url(${m.img})`, backgroundSize: "cover", backgroundPosition: "center", transition: "transform 0.4s ease" }} className="milestone-bg-v2"></div>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(180deg, transparent 0%, transparent 60%, rgba(0, 0, 0, 0.2) 85%, rgba(0, 0, 0, 0.4) 100%)", zIndex: 1 }}></div>
                  <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem", right: "1.5rem", background: "white", padding: "1.75rem 1.5rem", borderRadius: "0px", zIndex: 2, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)", transition: "all 0.4s ease" }} className="milestone-content-v2">
                    <div style={{ position: "relative" }}>
                      <div style={{ fontSize: "1.75rem", fontWeight: 700, color: brand.red, marginBottom: "0.5rem" }}>
                        {m.year}
                        <div style={{ width: "50px", height: "3px", background: brand.red, marginTop: "5px", marginLeft: "80px" }}></div>
                      </div>
                      <h6 className="fw-semibold mb-2" style={{ color: brand.navy }}>{m.title}</h6>
                      <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>{m.desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <style jsx="true">{`
          .milestone-bg-v2 { transition: transform 0.4s ease; }
          .milestone-card-v2:hover .milestone-bg-v2 { transform: scale(1.1); }
          .milestone-card-v2:hover .milestone-content-v2 { transform: translateY(-8px); box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2); }
        `}</style>
      </section>

      {/* --- AWARDS SECTION --- */}
      <section className="py-5 text-center text-white" style={{ background: brand.gradient }}>
        <div className="container">
          <h2 className="fw-bold mb-4">Awards & Recognition</h2>
          <div className="row g-4 justify-content-center">
            {awards.map((a, i) => (
              <div className="col-md-4" key={i} data-aos="fade-up" data-aos-delay={i * 150}>
                <div className="p-4 bg-white text-dark rounded-4 shadow-sm h-100">
                  <i className={`${a.icon} text-danger display-6 mb-3`}></i>
                  <h6 className="fw-bold mb-1">{a.title}</h6>
                  <p className="small text-muted">{a.org}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="py-5 bg-white" id="testimonials">
        <div className="container text-center">
          <h2 className="fw-bold mb-5" style={{ color: brand.navy }}>Customer Stories</h2>
          <div className="row g-4 justify-content-center">
            {testimonials.map((t, i) => (
              <motion.div key={i} className="col-md-4" data-aos="fade-up" data-aos-delay={i * 150}>
                <div className="p-4 bg-light rounded-4 shadow-sm h-100 text-start">
                  <div className="d-flex align-items-center mb-3">
                    <img src={t.image} alt={t.name} className="rounded-circle me-3" style={{ width: 55, height: 55, objectFit: "cover" }} />
                    <div>
                      <h6 className="fw-bold mb-0">{t.name}</h6>
                      <small className="text-muted">{t.role}</small>
                    </div>
                  </div>
                  <p className="text-muted small mb-2">"{t.quote}"</p>
                  <div className="text-warning">
                    {"★".repeat(t.rating)}
                    {"☆".repeat(5 - t.rating)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* --- LOCATION SECTION --- */}
      <section className="py-5 bg-white" id="contact">
        <div className="container text-center">
          <h2 className="fw-bold mb-3" style={{ color: brand.navy }}>Find a Pickup Point Near You</h2>
          <MaxWidth width={760}>
            <p className="text-muted mb-4">
              Our network is always growing. Use the map to find your nearest pickup point or check your current location for convenience.
            </p>
          </MaxWidth>
          <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
            <span className="badge text-bg-light p-2">
              {coords ? `Your location: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` : "Using default location"}
            </span>
            <button className="btn btn-sm btn-outline-danger" onClick={requestLocation} disabled={geoLoading} title="Try to locate again">
              {geoLoading ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status" />Locating...</>
              ) : (
                <><i className="bi bi-geo-alt me-2"></i> Re-locate</>
              )}
            </button>
          </div>
          {geoError && (
            <div className="alert alert-warning py-2 px-3 mx-auto" style={{ maxWidth: 300 }}>
              <i className="bi bi-exclamation-triangle me-2"></i>{geoError}
            </div>
          )}
          <div className="ratio ratio-16x9 rounded-4 shadow" data-aos="fade-up">
            <iframe
              key={`${mapLat},${mapLng}`} src={mapSrc} title="Flix Bus Location Map" allowFullScreen
              loading="lazy" style={{ border: 0, borderRadius: "0px" }} referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="text-center py-5 bg-dark text-white">
        <div className="container">
          <h6 className="fw-bold mb-2">Flix Bus — Your Journey, Our Priority</h6>
          <p className="small mb-3">© {new Date().getFullYear()} Flix Bus | Safe • Reliable • Affordable</p>
          <div className="d-flex justify-content-center gap-3 mb-3">
            <a href="#" className="text-white-50">Privacy Policy</a>
            <a href="#" className="text-white-50">Terms of Service</a>
            <a href="#" className="text-white-50">Contact Us</a>
          </div>
          <div className="mb-3">
            <i className="bi bi-facebook mx-2"></i><i className="bi bi-twitter mx-2"></i><i className="bi bi-linkedin mx-2"></i><i className="bi bi-instagram mx-2"></i>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PreLoginHome;
