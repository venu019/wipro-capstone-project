import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const HomePage = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div className="bg-light">

      {/* ================= GLOBAL CARD HOVER EFFECTS ================= */}
      <style>
        {`
          .hover-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .hover-card:hover {
            transform: translateY(-8px) scale(1.03);
            box-shadow: 0px 12px 25px rgba(0,0,0,0.15);
          }
          .hover-logo {
            transition: transform 0.3s ease, filter 0.3s ease;
          }
          .hover-logo:hover {
            transform: scale(1.1);
            filter: brightness(1.3);
          }
        `}
      </style>

      {/* ================= HERO CAROUSEL ================= */}
      <div
        id="carouselExampleCaptions"
        className="carousel slide shadow-sm carousel-fade"
        data-bs-ride="carousel"
        data-bs-interval="3000"
      >
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2"></button>
        </div>

        <div className="carousel-inner">

          <div className="carousel-item active">
            <img
              src="https://images.pexels.com/photos/386009/pexels-photo-386009.jpeg"
              className="d-block w-100"
              style={{ height: "520px", objectFit: "cover" }}
              alt=""
            />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 p-3">
              <h3 className="fw-bold">Comfortable Journeys</h3>
              <p>Travel with premium AC buses and best comfort.</p>
            </div>
          </div>

          <div className="carousel-item">
            <img
              src="https://images.pexels.com/photos/219929/pexels-photo-219929.jpeg"
              className="d-block w-100"
              style={{ height: "520px", objectFit: "cover" }}
              alt=""
            />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 p-3">
              <h3 className="fw-bold">Safe & Reliable</h3>
              <p>Certified drivers + GPS-enabled buses.</p>
            </div>
          </div>

          <div className="carousel-item">
            <img
              src="https://images.pexels.com/photos/2869210/pexels-photo-2869210.jpeg"
              className="d-block w-100"
              style={{ height: "520px", objectFit: "cover" }}
              alt=""
            />
            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 p-3">
              <h3 className="fw-bold">Easy Online Booking</h3>
              <p>Book tickets anytime with secure payment.</p>
            </div>
          </div>

        </div>
      </div>

      {/* ================= WELCOME SECTION ================= */}
      <section className="container text-center my-5" data-aos="fade-up">
        <h2 className="fw-bold">Welcome to FlixBus Travels</h2>
        <p className="text-muted">
          India's most trusted platform for bus bookings across 250+ cities.
        </p>
      </section>

      {/* ================= POPULAR DESTINATIONS ================= */}
      <section className="container my-5" data-aos="fade-up">
        <h3 className="fw-bold text-center mb-4">Popular Travel Destinations</h3>

        <div className="row g-4">
          {[
            { name: "Goa", img: "https://images.pexels.com/photos/237272/pexels-photo-237272.jpeg" },
            { name: "Ooty", img: "https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg" },
            { name: "Mysuru", img: "https://images.pexels.com/photos/2048126/pexels-photo-2048126.jpeg" },
            { name: "Hyderabad", img: "https://images.pexels.com/photos/1612184/pexels-photo-1612184.jpeg" },
          ].map((place, index) => (
            <div className="col-md-3" key={index} data-aos="zoom-in">
              <div className="card hover-card border-0 shadow-sm">
                <img
                  src={place.img}
                  style={{ height: "180px", objectFit: "cover" }}
                  className="card-img-top"
                  alt=""
                />
                <div className="card-body text-center">
                  <h5 className="fw-bold">{place.name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ================= TRENDING PLACES ================= */}
      <section className="container my-5" data-aos="fade-up">
        <h3 className="fw-bold text-center mb-4">Trending Places</h3>

        <div className="row g-4">
          {[
            { name: "Manali", img: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg" },
            { name: "Leh Ladakh", img: "https://images.pexels.com/photos/6054963/pexels-photo-6054963.jpeg" },
            { name: "Munnar", img: "https://images.pexels.com/photos/672358/pexels-photo-672358.jpeg" },
          ].map((spot, index) => (
            <div className="col-md-4" key={index} data-aos="fade-up">
              <div className="card hover-card shadow">
                <img
                  src={spot.img}
                  style={{ height: "220px", objectFit: "cover" }}
                  className="card-img-top"
                  alt=""
                />
                <div className="card-body text-center">
                  <h5 className="fw-bold">{spot.name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= USER REVIEWS ================= */}
      <section className="bg-white py-5" data-aos="fade-up">
        <div className="container">
          <h3 className="fw-bold text-center mb-4">What Travellers Say</h3>

          <div className="row g-4">
            {[
              { name: "Rahul Sharma", img: "https://randomuser.me/api/portraits/men/32.jpg", review: "Amazing service!" },
              { name: "Anita Verma", img: "https://randomuser.me/api/portraits/women/44.jpg", review: "Very comfortable journey!" },
              { name: "David Rao", img: "https://randomuser.me/api/portraits/men/67.jpg", review: "Very punctual buses!" },
            ].map((user, index) => (
              <div className="col-md-4" key={index} data-aos="zoom-in">
                <div className="p-4 hover-card shadow-sm bg-light h-100 text-center">
                  <img
                    src={user.img}
                    style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
                    alt=""
                  />
                  <h6 className="fw-bold mt-3">{user.name}</h6>
                  <p className="text-muted mt-2">{user.review}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= BUS CATEGORIES ================= */}
      <section className="container my-5" data-aos="fade-up">
        <h3 className="fw-bold text-center mb-4">Bus Categories</h3>

        <div className="row g-4">
          {[
            { name: "AC Sleeper", img: "https://images.pexels.com/photos/2264600/pexels-photo-2264600.jpeg" },
            { name: "Non-AC Seater", img: "https://images.pexels.com/photos/730778/pexels-photo-730778.jpeg" },
            { name: "Volvo Multi-Axle", img: "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg" },
            { name: "Electric Bus", img: "https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg" },
          ].map((bus, index) => (
            <div className="col-md-3" key={index} data-aos="zoom-in">
              <div className="card hover-card shadow-sm border-0">
                <img
                  src={bus.img}
                  style={{ height: "180px", objectFit: "cover" }}
                  className="card-img-top"
                  alt=""
                />
                <div className="card-body text-center">
                  <h5 className="fw-bold">{bus.name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SAFETY MEASURES ================= */}
      <section className="bg-white py-5" data-aos="fade-up">
        <div className="container">
          <h3 className="fw-bold text-center mb-4">Our Safety Measures</h3>

          <div className="row g-4 text-center">
            {[
              { icon: "bi-shield-check", title: "Verified Drivers", desc: "Experienced & trained" },
              { icon: "bi-thermometer-half", title: "Regular Sanitization", desc: "After every trip" },
              { icon: "bi-geo-alt", title: "GPS Tracking", desc: "Live location safety" },
              { icon: "bi-alarm", title: "On-Time Departures", desc: "Zero delays" },
            ].map((item, i) => (
              <div className="col-md-3" key={i} data-aos="zoom-in">
                <div className="p-4 hover-card bg-light rounded-3 shadow-sm">
                  <i className={`${item.icon} fs-1 text-primary`}></i>
                  <h5 className="fw-bold mt-3">{item.title}</h5>
                  <p className="text-muted small">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PARTNER LOGOS ================= */}
      <section className="container my-5 text-center" data-aos="fade-up">
        <h3 className="fw-bold mb-4">Our Trusted Partners</h3>

        <div className="d-flex flex-wrap justify-content-center gap-4">
          {[
            "https://logos-world.net/wp-content/uploads/2020/04/Visa-Logo.png",
            "https://logos-world.net/wp-content/uploads/2020/09/Mastercard-Logo.png",
            "https://seeklogo.com/images/R/rupay-logo-396DFC0F64-seeklogo.com.png",
            "https://1000logos.net/wp-content/uploads/2021/05/Paytm-logo.png",
            "https://seeklogo.com/images/G/google-pay-logo-15B63BEEF0-seeklogo.com.png",
          ].map((logo, i) => (
            <img
              key={i}
              src={logo}
              className="hover-logo"
              style={{ height: 50 }}
              alt=""
            />
          ))}
        </div>
      </section>

      {/* ================= OFFER BANNER ================= */}
      <section
        className="my-5"
        data-aos="zoom-in"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/21014/pexels-photo.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-dark bg-opacity-50 py-5 text-center text-white">
          <h2 className="fw-bold">Weekend Special: Up To 30% OFF</h2>
          <p className="mt-2">Book your weekend trip now and enjoy discounts!</p>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="container my-5" data-aos="fade-up">
        <h3 className="fw-bold text-center mb-4">Frequently Asked Questions</h3>

        <div className="accordion" id="faqAccordion">
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button className="accordion-button fw-bold" data-bs-toggle="collapse" data-bs-target="#faq1">
                How do I cancel my bus ticket?
              </button>
            </h2>
            <div id="faq1" className="accordion-collapse collapse show">
              <div className="accordion-body">
                You can cancel easily from bookings section.
              </div>
            </div>
          </div>

          <div className="accordion-item mt-3">
            <h2 className="accordion-header">
              <button className="accordion-button collapsed fw-bold" data-bs-toggle="collapse" data-bs-target="#faq3">
                Are there any discounts?
              </button>
            </h2>
            <div id="faq3" className="accordion-collapse collapse">
              <div className="accordion-body">Yes, weekend & seasonal offers exist.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-dark text-white py-5 mt-5">
        <div className="container">

          <div className="row">

            <div className="col-md-4 mb-4">
              <h5 className="fw-bold">FlixBus Travels</h5>
              <p className="text-white-50 small">Your trusted partner for travel.</p>
              <p className="text-white-50 small">24/7 customer support available.</p>
            </div>

            <div className="col-md-2 mb-4">
              <h6 className="fw-bold">Quick Links</h6>
              <ul className="list-unstyled text-white-50 small mt-3">
                <li>About</li>
                <li>Contact</li>
                <li>Terms</li>
                <li>Privacy</li>
              </ul>
            </div>

            <div className="col-md-3 mb-4">
              <h6 className="fw-bold">Popular Routes</h6>
              <ul className="list-unstyled text-white-50 small mt-3">
                <li>Bengaluru → Hyderabad</li>
                <li>Chennai → Coimbatore</li>
                <li>Mumbai → Goa</li>
                <li>Bengaluru → Mysuru</li>
              </ul>
            </div>

            <div className="col-md-3 mb-4">
              <h6 className="fw-bold">Contact Us</h6>
              <p className="text-white-50 small"> Bengaluru, India</p>
              <p className="text-white-50 small"> +91 98765 43210</p>
              <p className="text-white-50 small">✉ support@flixbus.com</p>
            </div>

          </div>

          <div className="text-center text-white-50 small mt-4">
            © 2025 FlixBus Travels. All Rights Reserved.
          </div>

        </div>
      </footer>

    </div>
  );
};

export default HomePage;
