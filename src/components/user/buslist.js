import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

// Passenger form validation schema
const getPassengerValidationSchema = (selectedCount) =>
  Yup.object({
    passengers: Yup.array()
      .of(
        Yup.object({
          name: Yup.string().required("Required"),
          age: Yup.number().typeError("Required").positive("Must be positive").integer("Must be integer").required("Required"),
          gender: Yup.string().oneOf(["male", "female", "other"], "Required").required("Required"),
        })
      )
      .min(selectedCount, "Must fill all passengers"),
    mobile: Yup.string().matches(/^[0-9]{10}$/, "Must be a valid 10-digit mobile").required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
  });

// Seat selection component
const BusSeatingArrangement = ({ tripId, seatPrice, onNext }) => {
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!tripId) return;
    axios.get(`http://localhost:9004/api/v1/trips/${tripId}`)
      .then(res => setSeats(res.data))
      .catch(err => console.error("Failed to fetch seats", err));
  }, [tripId]);

  // Toggle seat selection only if not booked
  const handleClick = (seat) => {
    if (seat.booked) return;
    setSelected(prev =>
      prev.includes(seat.seatNumber)
        ? prev.filter(n => n !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );
  };

  // Group seats by rows, assuming 4 seats per row (2 left + aisle + 2 right)
  const seatsPerRow = 4;
  const seatRows = [];
  for (let i = 0; i < seats.length; i += seatsPerRow) {
    seatRows.push(seats.slice(i, i + seatsPerRow));
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <span role="img" aria-label="Driver" style={{ fontSize: 32 }}>Front</span>
      </div>

      <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 10 
      }}>
        {seatRows.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex', gap: 12 }}>
            {/* Left 2 seats */}
            <div style={{ display: 'flex', gap: 8 }}>
              {row.slice(0, 2).map(seat => {
                const isSelected = selected.includes(seat.seatNumber);
                const isBooked = seat.booked;
                return (
                  <SeatBox 
                    key={seat.seatId}
                    seat={seat}
                    seatPrice={seatPrice}
                    isSelected={isSelected}
                    isBooked={isBooked}
                    onClick={() => !isBooked && handleClick(seat)}
                  />
                );
              })}
            </div>
            {/* Aisle space */}
            <div style={{ width: 30 }}></div>
            {/* Right 2 seats */}
            <div style={{ display: 'flex', gap: 8 }}>
              {row.slice(2, 4).map(seat => {
                const isSelected = selected.includes(seat.seatNumber);
                const isBooked = seat.booked;
                return (
                  <SeatBox 
                    key={seat.seatId}
                    seat={seat}
                    seatPrice={seatPrice}
                    isSelected={isSelected}
                    isBooked={isBooked}
                    onClick={() => !isBooked && handleClick(seat)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button
          className="btn btn-primary"
          disabled={selected.length === 0}
          onClick={() => onNext(selected)}
        >
          Confirm Selection ({selected.length} seat{selected.length > 1 ? 's' : ''})
        </button>
      </div>
    </div>
  );
};

// Individual seat box component
const SeatBox = ({ seat, seatPrice, isSelected, isBooked, onClick }) => (
  <div
    onClick={onClick}
    style={{
      width: 40,
      height: 40,
      borderRadius: 6,
      border: '2px solid',
      borderColor: isBooked ? '#d9534f' : isSelected ? '#0275d8' : '#5cb85c',
      backgroundColor: isBooked ? '#f2dede' : isSelected ? '#cce5ff' : '#dff0d8',
      color: isBooked ? '#a94442' : isSelected ? '#004085' : '#3c763d',
      cursor: isBooked ? 'not-allowed' : 'pointer',
      fontWeight: '600',
      fontSize: 14,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
      position: 'relative',
    }}
    title={`Seat ${seat.seatNumber} - ₹${seatPrice} - ${seat.seatType}`}
  >
    {isBooked ? (
      <span style={{ fontSize: 11, fontWeight: 'bold' }}>Sold</span>
    ) : (
      <>
        <span>{seat.seatNumber}</span>
        <small style={{ fontSize: 10, color: '#555' }}>₹{seatPrice}</small>
      </>
    )}
  </div>
);



// Passenger details for each selected seat
const PassengersForm = ({
  seatNumbers,
  onCancel,
  onSubmit,
  onConfirm,
  tripId,
  totalAmount,
  userId, // pass userId as prop or get from context/auth
}) => {
  const formik = useFormik({
    initialValues: {
      passengers: seatNumbers.map(() => ({ name: "", age: "", gender: "" })),
      mobile: "",
      email: "",
    },
    validationSchema: getPassengerValidationSchema(seatNumbers.length),
    onSubmit: async (values) => {
      onSubmit && onSubmit(values); // for local form state management if needed

      const userId = Number(localStorage.getItem('userId'));
      // Prepare the booking request payload for holdSeats API
      const holdSeatsRequest = {
        tripId,
        userId,
        seatIds: seatNumbers, // Use actual seat IDs if available; here seat numbers are passed—adjust if needed
        totalAmount,
        contact: values.mobile,
        passengers: values.passengers,
      };

      try {
        // Call holdSeats endpoint to hold seats and get booking
        const holdResponse = await axios.post(
          "http://localhost:9004/api/v1/bookings/hold",
          holdSeatsRequest,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const booking = holdResponse.data;

        // Confirm booking immediately after hold
        const confirmResponse = await axios.post(
          `http://localhost:9004/api/v1/bookings/confirm/${booking.bookingId}`,
          null,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        onConfirm(confirmResponse.data); // Notify parent component of success
      } catch (error) {
        console.error("Booking failed:", error);
        alert("Booking failed. Please try again.");
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <p>Seats selected: {seatNumbers.join(", ")}</p>
      {seatNumbers.map((seatNo, idx) => (
        <div key={seatNo} className="border rounded p-2 mb-3">
          <h6>
            Passenger {idx + 1} (Seat {seatNo})
          </h6>
          <div className="row">
            <div className="col-md-5 mb-2">
              <input
                name={`passengers[${idx}].name`}
                placeholder="Name"
                className={`form-control ${formik.touched.passengers?.[idx]?.name &&
                  formik.errors.passengers?.[idx]?.name
                  ? "is-invalid"
                  : ""
                  }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.passengers[idx].name}
              />
              {formik.touched.passengers?.[idx]?.name &&
                formik.errors.passengers?.[idx]?.name && (
                  <div className="invalid-feedback">
                    {formik.errors.passengers[idx].name}
                  </div>
                )}
            </div>
            <div className="col-md-3 mb-2">
              <input
                type="number"
                name={`passengers[${idx}].age`}
                placeholder="Age"
                className={`form-control ${formik.touched.passengers?.[idx]?.age &&
                  formik.errors.passengers?.[idx]?.age
                  ? "is-invalid"
                  : ""
                  }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.passengers[idx].age}
              />
              {formik.touched.passengers?.[idx]?.age &&
                formik.errors.passengers?.[idx]?.age && (
                  <div className="invalid-feedback">
                    {formik.errors.passengers[idx].age}
                  </div>
                )}
            </div>
            <div className="col-md-4 mb-2">
              <select
                name={`passengers[${idx}].gender`}
                className={`form-select ${formik.touched.passengers?.[idx]?.gender &&
                  formik.errors.passengers?.[idx]?.gender
                  ? "is-invalid"
                  : ""
                  }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.passengers[idx].gender}
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {formik.touched.passengers?.[idx]?.gender &&
                formik.errors.passengers?.[idx]?.gender && (
                  <div className="invalid-feedback">
                    {formik.errors.passengers[idx].gender}
                  </div>
                )}
            </div>
          </div>
        </div>
      ))}

      <div className="mb-3">
        <input
          name="mobile"
          placeholder="Mobile Number"
          className={`form-control ${formik.touched.mobile && formik.errors.mobile ? "is-invalid" : ""
            }`}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.mobile}
          maxLength={10}
        />
        {formik.touched.mobile && formik.errors.mobile && (
          <div className="invalid-feedback">{formik.errors.mobile}</div>
        )}
      </div>

      <div className="mb-3">
        <input
          name="email"
          placeholder="Email"
          className={`form-control ${formik.touched.email && formik.errors.email ? "is-invalid" : ""
            }`}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
        />
        {formik.touched.email && formik.errors.email && (
          <div className="invalid-feedback">{formik.errors.email}</div>
        )}
      </div>

      <div className="d-flex justify-content-between">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Back to Seat Selection
        </button>
        <button type="submit" className="btn btn-primary">
          Confirm Booking
        </button>
      </div>
    </form>
  );
};

// Main BusList component
const BusList = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [trips, setTrips] = useState([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [busType, setBusType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState("seats");
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    fetchBuses();
    fetchRoutes();
    fetchTrips();
  }, []);

  // Fetch functions...
  const fetchBuses = async () => {
    try {
      const res = await axios.get("http://localhost:9002/api/v1/buses", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBuses(res.data);
    } catch (err) {
      console.error("Failed to load buses", err);
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await axios.get("http://localhost:9002/api/v1/routes", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRoutes(res.data);
    } catch (err) {
      console.error("Failed to load routes", err);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await axios.get("http://localhost:9003/api/v1/trips", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Set only active trips
      setTrips(res.data.filter(trip => !trip.cancelled));
    } catch (err) {
      console.error("Failed to load trips", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!origin || !destination || !date) {
      alert("Please fill origin, destination and date");
      return;
    }
    try {
      const res = await axios.get("http://localhost:9003/api/v1/trips/search", {
        params: { origin, destination, date },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      let filteredTrips = res.data.filter(trip => !trip.cancelled);

      if (busType) {
        const allowedBusIds = buses.filter(b => b.busType === busType).map(b => b.id);
        filteredTrips = filteredTrips.filter(trip => allowedBusIds.includes(trip.busId));
      }
      setTrips(filteredTrips);
    } catch (err) {
      console.error("Failed to search trips", err);
      setTrips([]);
    }
  };


  const getBusDisplay = (busId) => {
    const bus = buses.find(b => b.id === busId);
    return bus ? `${bus.busNumber} (${bus.busType})` : "Unknown Bus";
  };

  const getRouteDisplay = (routeId) => {
    const route = routes.find(r => r.id === routeId);
    return route ? `${route.source} → ${route.destination}` : "Unknown Route";
  };

  const handleBookClick = (trip) => {
    const bus = buses.find(b => b.id === trip.busId);
    setSelectedBus(bus);
    setSelectedTrip(trip);
    setSelectedSeats([]);
    setModalStep("seats");
    setShowModal(true);
  };

  const handleSeatConfirm = (seats) => {
    setSelectedSeats(seats);
    setModalStep("passenger");
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedBus(null);
    setSelectedTrip(null);
    setSelectedSeats([]);
    setModalStep("seats");
  };

  // const handlePassengerSubmit = (passengerDetails) => {
  //   alert(
  //     `Booking confirmed for bus ${selectedBus.busNumber}\nSeats: ${selectedSeats.join(
  //       ", "
  //     )}\nPassenger Details: ${JSON.stringify(passengerDetails, null, 2)}`
  //   );
  //   handleModalClose();
  // };

  const busTypes = [...new Set(buses.map(b => b.busType))];

  return (
    <div className="container my-4" style={{ minHeight: '450px' }}>
      <h3>Search Trips</h3>

      <form className="row g-3 mb-4" onSubmit={handleSearch}>
        <div className="col-md-3">
          <input
            type="text"
            placeholder="From"
            className="form-control"
            value={origin}
            onChange={e => setOrigin(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            placeholder="To"
            className="form-control"
            value={destination}
            onChange={e => setDestination(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={busType} onChange={e => setBusType(e.target.value)}>
            <option value="">All Bus Types</option>
            {busTypes.map(bt => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" type="submit">Search</button>
        </div>
      </form>

      <h3>Available Trips</h3>
      {trips.length === 0 ? (
        <p>No trips found for the selected criteria.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Bus Number (Type)</th>
              <th>Route</th>
              <th>Departure Time</th>
              <th>Arrival Time</th>
              <th>Fare</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {trips.map(trip => (
              <tr key={trip.id}>
                <td>{getBusDisplay(trip.busId)}</td>
                <td>{getRouteDisplay(trip.routeId)}</td>
                <td>{new Date(trip.departureTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td>{new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>₹{trip.fare.toFixed(2)}</td>
                <td>
                  <button className="btn btn-success btn-sm" onClick={() => handleBookClick(trip)}>
                    Book Now
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && selectedBus && selectedTrip && (
        <div
          className="modal show fade"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.4)",
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalStep === "seats" ? `Select Seat(s) - ${selectedBus.busNumber}` : `Passenger Details for ${selectedBus.busNumber}`}
                </h5>
                <button type="button" className="btn-close" onClick={handleModalClose}></button>
              </div>
              <div className="modal-body">
                {modalStep === "seats" ? (
                  <BusSeatingArrangement
                    tripId={selectedTrip.id}
                    seatPrice={selectedTrip.fare}
                    onNext={handleSeatConfirm}
                  />
                ) : (
                  <PassengersForm
                    seatNumbers={selectedSeats}
                    tripId={selectedTrip.id} // from selected trip state
                    totalAmount={selectedTrip.fare * selectedSeats.length} // total cost
                    onCancel={() => setModalStep("seats")}
                    // onSubmit={formikSubmitHandler} // optional local submit handler
                    onConfirm={(booking) => {
                      alert(`Booking confirmed! ID: ${booking.bookingId}`);
                      handleModalClose();
                    }}
                  />)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusList;