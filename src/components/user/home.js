import React from "react";

const HomePage = () => {
  return (
    <div>
      {/* Carousel for promotional bus travel images */}
      <div id="carouselExampleCaptions" className="carousel slide">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img
              src="https://img.freepik.com/free-vector/flat-design-travel-twitter-header_23-2149130936.jpg"
              className="d-block w-100"
              style={{ height: "500px", objectFit: "cover" }}
              alt="Comfortable buses"
            />
            <div className="carousel-caption d-none d-md-block">
              <h5>Comfortable Journeys</h5>
              <p>Experience luxury and safety in every mile.</p>
            </div>
          </div>
          <div className="carousel-item">
            <img
              src="https://gst-contracts.s3.ap-southeast-1.amazonaws.com/uploads/bcc/cms/asset/avatar/354212/banner_ITCBUS_Website_Banner.jpg"
              className="d-block w-100"
              style={{ height: "500px", objectFit: "cover" }}
              alt="Safe travel"
            />
            <div className="carousel-caption d-none d-md-block">
              <h5>Safe and Reliable</h5>
              <p>Your safety is our top priority on every route.</p>
            </div>
          </div>
          <div className="carousel-item">
            <img
              src="https://img.freepik.com/free-psd/travel-tourism-facebook-cover-banner-template_120329-5869.jpg?semt=ais_hybrid&w=740&q=80"
              className="d-block w-100"
              style={{ height: "500px", objectFit: "cover" }}
              alt="Easy booking"
            />
            <div className="carousel-caption d-none d-md-block">
              <h5>Easy Online Booking</h5>
              <p>Book your tickets anytime, anywhere with ease.</p>
            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* Simple welcome message */}
      <section className="container text-center my-5">
        <h2>Welcome to flixbus Travels</h2>
        <p>Book your trips effortlessly with comfortable and safe bus services across popular routes.</p>
        <button
          className="btn btn-primary"
          onClick={() => (window.location.href = "/search")}
        >
          Explore Trips
        </button>
      </section>
    </div>
  );
};

export default HomePage;
