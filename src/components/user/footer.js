import React from "react";

const Footer = () => {
  return (
    <>
      <footer
        className="bg-dark text-light pt-4 pb-3 mt-5"
        // style={{
        //   position: "fixed",
        //   bottom: 0,
        //   width: "100%",
        //   zIndex: 1030, /* above most content */
        // }}
      >
        <div className="container">
          <div className="row">
            {/* Brand and About */}
            <div className="col-md-12">
              <h4 className="fw-bold ">Bus Reservation</h4>
              <p className="small">
                Seamless ticket booking experience for your journeys. Book your seat with ease and travel comfortably.
              </p>
            </div>
          </div>
          {/* Divider */}
          <hr className="border-light" />
          {/* Bottom Section */}
          <div className="row text-center">
            <div className="col-12 small">
              &copy; {new Date().getFullYear()} <span>Bus Ticket Reservation</span>. All Rights Reserved.
            </div>
          </div>
        </div>
        <style>{`
          footer a:hover {
            color: #ff6b00 !important;
          }
        `}</style>
      </footer>
    </>
  );
};

export default Footer;
