import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

/* -------------------------
   Configuration
   ------------------------- */
const FALLBACK_VPA = "merchant@bank"; // default VPA used when hold/merchant VPA is absent

/* -------------------------
   Validation schema
   ------------------------- */
const getPassengerValidationSchema = (selectedCount) =>
  Yup.object({
    passengers: Yup.array()
      .of(
        Yup.object({
          name: Yup.string().required("Required"),
          age: Yup.number()
            .typeError("Required")
            .positive("Must be positive")
            .integer("Must be integer")
            .required("Required"),
          gender: Yup.string()
            .oneOf(["male", "female", "other"], "Required")
            .required("Required"),
        })
      )
      .min(selectedCount, "Must fill all passengers"),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, "Must be a valid 10-digit mobile")
      .required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
  });

/* -------------------------
   SeatBox
   ------------------------- */
const SeatBox = ({ seat, seatPrice, isSelected, isBooked, onClick }) => (
  <div
    onClick={onClick}
    style={{
      width: 40,
      height: 40,
      borderRadius: 6,
      border: "2px solid",
      borderColor: isBooked ? "#d9534f" : isSelected ? "#0275d8" : "#5cb85c",
      backgroundColor: isBooked ? "#f2dede" : isSelected ? "#cce5ff" : "#dff0d8",
      color: isBooked ? "#a94442" : isSelected ? "#004085" : "#3c763d",
      cursor: isBooked ? "not-allowed" : "pointer",
      fontWeight: "600",
      fontSize: 14,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      userSelect: "none",
      position: "relative",
    }}
    title={`Seat ${seat.seatNumber} - ₹${seatPrice} - ${seat.seatType}`}
  >
    {isBooked ? (
      <span style={{ fontSize: 11, fontWeight: "bold" }}>Sold</span>
    ) : (
      <>
        <span>{seat.seatNumber}</span>
        <small style={{ fontSize: 10, color: "#555" }}>₹{seatPrice}</small>
      </>
    )}
  </div>
);

/* -------------------------
   BusSeatingArrangement
   ------------------------- */
const BusSeatingArrangement = ({ tripId, seatPrice, onNext }) => {
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!tripId) return;
    axios
      .get(`http://localhost:9004/api/v1/trips/${tripId}`)
      .then((res) => setSeats(res.data || []))
      .catch((err) => {
        console.error("Failed to fetch seats", err);
        setSeats([]);
      });
  }, [tripId]);

  const handleClick = (seat) => {
    if (seat.booked) return;
    setSelected((prev) =>
      prev.includes(seat.seatNumber)
        ? prev.filter((n) => n !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );
  };

  const seatsPerRow = 4;
  const seatRows = [];
  for (let i = 0; i < seats.length; i += seatsPerRow) {
    seatRows.push(seats.slice(i, i + seatsPerRow));
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <span role="img" aria-label="Driver" style={{ fontSize: 32 }}>
          Front
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {seatRows.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {row.slice(0, 2).map((seat) => {
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
            <div style={{ width: 30 }}></div>
            <div style={{ display: "flex", gap: 8 }}>
              {row.slice(2, 4).map((seat) => {
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
          Confirm Selection ({selected.length} seat{selected.length > 1 ? "s" : ""})
        </button>
      </div>
    </div>
  );
};

/* -------------------------
   PaymentModal
   ------------------------- */
const PaymentModal = ({
  visible,
  onClose,
  amount,
  bookingHold,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [netbank, setNetbank] = useState("");

  useEffect(() => {
    if (!visible) {
      setMethod("upi");
      setProcessing(false);
      setUpiId("");
      setCardDetails({ number: "", name: "", expiry: "", cvv: "" });
      setNetbank("");
      return;
    }

    const hold = bookingHold?.holdData || bookingHold;
    const candidate =
      hold?.upi || hold?.vpa || hold?.payeeVpa || hold?.merchantVpa || hold?.payee || hold?.merchant || "";
    if (candidate) setUpiId(candidate);
    else setUpiId(""); // keep empty so fallback will be used when rendering QR
  }, [visible, bookingHold]);

  const buildUpiPayload = (vpa) => {
    const v = vpa && vpa.trim() ? vpa.trim() : FALLBACK_VPA;
    const hold = bookingHold?.holdData || bookingHold;
    const merchantName = (hold && (hold.merchantName || hold.payeeName || hold.name)) || "Merchant";
    const amt = amount ? Number(amount).toFixed(2) : "";
    const params = new URLSearchParams();
    params.set("pa", v);
    params.set("pn", merchantName);
    if (amt) params.set("am", amt);
    params.set("cu", "INR");
    return `upi://pay?${params.toString()}`;
  };

  const qrDataUrl = () => {
    // always show a QR — prefer provided upiId, otherwise fallback
    const vpaToUse = upiId && upiId.trim() ? upiId.trim() : FALLBACK_VPA;
    const payload = buildUpiPayload(vpaToUse);
    return `https://chart.googleapis.com/chart?chs=360x360&cht=qr&chl=${encodeURIComponent(payload)}&chld=L|1`;
  };

  const handlePay = async () => {
    setProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const paymentResult = {
        method,
        amount,
        bookingHold,
        timestamp: new Date().toISOString(),
        details:
          method === "upi"
            ? { upiId: upiId || FALLBACK_VPA }
            : method === "card"
            ? { maskedCard: maskCard(cardDetails.number) }
            : { bank: netbank },
      };

      onPaymentSuccess(paymentResult);
    } catch (err) {
      console.error("Payment simulation failed:", err);
      alert("Payment failed (UI). Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const maskCard = (num) => {
    if (!num) return "";
    const s = num.replace(/\s+/g, "");
    return "**** **** **** " + s.slice(-4);
  };

  if (!visible) return null;

  return (
    <div
      className="modal show fade"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.4)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">
          <div className="modal-header">
            <h5 className="modal-title">Payment - ₹{Number(amount || 0).toFixed(2)}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Select Payment Method</label>
              <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="upi">UPI (Scan QR / Show QR)</option>
                <option value="card">Card</option>
                <option value="netbank">Netbanking</option>
              </select>
            </div>

            {method === "upi" && (
              <>
                <div className="mb-2">
                  <label className="form-label">UPI ID (VPA)</label>
                  <input
                    className="form-control"
                    placeholder="Please Enter UPI ID"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  <small className="text-muted">Enter VPA or leave if prefilled. A default QR will be shown if empty.</small>
                </div>

                <div className="mt-3 text-center">
                  <p style={{ marginBottom: 6 }}>Scan this QR with your UPI app to pay ₹{Number(amount || 0).toFixed(2)}</p>
                  <img
                    alt="UPI QR"
                    src={qrDataUrl()}
                    style={{ width: 260, height: 260, borderRadius: 8, boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}
                  />
                  <div className="mt-2 d-flex justify-content-center gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        const payload = buildUpiPayload(upiId);
                        try {
                          navigator.clipboard?.writeText(payload);
                          alert("UPI payload copied to clipboard");
                        } catch (err) {
                          console.error("Clipboard error", err);
                          alert("Unable to copy to clipboard");
                        }
                      }}
                    >
                      Copy UPI Payload
                    </button>
                  </div>
                  <div className="mt-2 text-muted" style={{ fontSize: 13 }}>
                    If your UPI app supports direct payment QR, scanning this will open payment with the amount pre-filled.
                  </div>
                </div>
              </>
            )}

            {method === "card" && (
              <div className="mb-2">
                <input className="form-control mb-2" placeholder="Card Number" value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })} />
                <input className="form-control mb-2" placeholder="Name on Card" value={cardDetails.name} onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="form-control" placeholder="MM/YY" value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} />
                  <input className="form-control" placeholder="CVV" value={cardDetails.cvv} onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })} />
                </div>
              </div>
            )}

            {method === "netbank" && (
              <div className="mb-2">
                <label className="form-label">Choose Bank</label>
                <select className="form-select" value={netbank} onChange={(e) => setNetbank(e.target.value)}>
                  <option value="">Select Bank</option>
                  <option value="hdfc">HDFC</option>
                  <option value="sbi">SBI</option>
                  <option value="icici">ICICI</option>
                  <option value="axis">Axis Bank</option>
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose} disabled={processing}>Cancel</button>
            <button className="btn btn-primary" onClick={handlePay} disabled={processing}>
              {processing ? "Processing..." : `Pay ₹${Number(amount || 0).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------
   PassengersForm
   ------------------------- */
const PassengersForm = ({
  seatNumbers,
  onCancel,
  onProceedToPayment,
  tripId,
  totalAmount,
  userId,
}) => {
  const formik = useFormik({
    initialValues: {
      passengers: seatNumbers.map(() => ({ name: "", age: "", gender: "" })),
      mobile: "",
      email: "",
    },
    validationSchema: getPassengerValidationSchema(seatNumbers.length),
    onSubmit: async (values) => {
      const userIdLocal = Number(localStorage.getItem("userId")) || userId || null;
      const holdSeatsRequest = {
        tripId,
        userId: userIdLocal,
        seatIds: seatNumbers,
        totalAmount,
        contact: values.mobile,
        passengers: values.passengers,
      };

      try {
        const holdResponse = await axios.post(
          "http://localhost:9004/api/v1/bookings/hold",
          holdSeatsRequest,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const holdData = holdResponse.data;
        onProceedToPayment && onProceedToPayment({ holdData, totalAmount, contact: values.mobile, passengers: values.passengers });
      } catch (error) {
        console.error("Hold seats failed:", error);
        alert("Unable to hold seats. Please try again.");
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <p>Seats selected: {seatNumbers.join(", ")}</p>
      {seatNumbers.map((seatNo, idx) => (
        <div key={seatNo} className="border rounded p-2 mb-3">
          <h6>Passenger {idx + 1} (Seat {seatNo})</h6>
          <div className="row">
            <div className="col-md-5 mb-2">
              <input
                name={`passengers[${idx}].name`}
                placeholder="Name"
                className={`form-control ${
                  formik.touched.passengers?.[idx]?.name && formik.errors.passengers?.[idx]?.name ? "is-invalid" : ""
                }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.passengers[idx].name}
              />
              {formik.touched.passengers?.[idx]?.name && formik.errors.passengers?.[idx]?.name && (
                <div className="invalid-feedback">{formik.errors.passengers[idx].name}</div>
              )}
            </div>
            <div className="col-md-3 mb-2">
              <input
                type="number"
                name={`passengers[${idx}].age`}
                placeholder="Age"
                className={`form-control ${
                  formik.touched.passengers?.[idx]?.age && formik.errors.passengers?.[idx]?.age ? "is-invalid" : ""
                }`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.passengers[idx].age}
              />
              {formik.touched.passengers?.[idx]?.age && formik.errors.passengers?.[idx]?.age && (
                <div className="invalid-feedback">{formik.errors.passengers[idx].age}</div>
              )}
            </div>
            <div className="col-md-4 mb-2">
              <select
                name={`passengers[${idx}].gender`}
                className={`form-select ${
                  formik.touched.passengers?.[idx]?.gender && formik.errors.passengers?.[idx]?.gender ? "is-invalid" : ""
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
              {formik.touched.passengers?.[idx]?.gender && formik.errors.passengers?.[idx]?.gender && (
                <div className="invalid-feedback">{formik.errors.passengers?.[idx]?.gender}</div>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="mb-3">
        <input
          name="mobile"
          placeholder="Mobile Number"
          className={`form-control ${formik.touched.mobile && formik.errors.mobile ? "is-invalid" : ""}`}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.mobile}
          maxLength={10}
        />
        {formik.touched.mobile && formik.errors.mobile && <div className="invalid-feedback">{formik.errors.mobile}</div>}
      </div>

      <div className="mb-3">
        <input
          name="email"
          placeholder="Email"
          className={`form-control ${formik.touched.email && formik.errors.email ? "is-invalid" : ""}`}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
        />
        {formik.touched.email && formik.errors.email && <div className="invalid-feedback">{formik.errors.email}</div>}
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

/* -------------------------
   UpiPaymentModal (NEW)
   - Uses fallback VPA when none present
   - No download link, shows default QR always
   ------------------------- */
const UpiPaymentModal = ({ visible, onClose, vpa, amount, bookingId }) => {
  const buildUpiPayload = (vpaParam) => {
    const v = vpaParam && vpaParam.trim() ? vpaParam.trim() : FALLBACK_VPA;
    const params = new URLSearchParams();
    params.set("pa", v);
    params.set("pn", "Merchant");
    if (amount !== undefined && amount !== null) params.set("am", Number(amount).toFixed(2));
    params.set("cu", "INR");
    if (bookingId) params.set("tn", `Booking:${bookingId}`);
    return `upi://pay?${params.toString()}`;
  };

  const qrUrl = () => {
    const payload = buildUpiPayload(vpa);
    return `https://chart.googleapis.com/chart?chs=360x360&cht=qr&chl=${encodeURIComponent(payload)}&chld=L|1`;
  };

  if (!visible) return null;

  return (
    <div
      className="modal show fade"
      style={{
        display: "block",
        backgroundColor: "rgba(0,0,0,0.4)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 3000,
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">
          <div className="modal-header">
            <h5 className="modal-title">Pay via UPI — Booking #{bookingId || "—"}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body text-center">
            <p style={{ marginBottom: 6 }}>
              Scan the QR with your UPI app to pay <strong>₹{Number(amount || 0).toFixed(2)}</strong>.
            </p>

            <img
              alt="UPI QR"
              src={qrUrl()}
              style={{ width: 260, height: 260, borderRadius: 8, boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}
            />

            <div className="mt-2">
              <div style={{ fontSize: 13, color: "#555" }}>Payee VPA: <strong>{(vpa && vpa.trim()) || FALLBACK_VPA}</strong></div>
              <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                The UPI note contains the booking id to help reconciliation.
              </div>
            </div>

            <div className="mt-3 d-flex justify-content-center gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  const payload = buildUpiPayload(vpa);
                  try {
                    navigator.clipboard?.writeText(payload);
                    alert("UPI payload copied to clipboard");
                  } catch (err) {
                    console.error("Clipboard error", err);
                    alert("Unable to copy to clipboard");
                  }
                }}
              >
                Copy UPI Payload
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
              }}
            >
              I have paid — Finish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------
   Main BusList
   ------------------------- */
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

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [bookingHoldData, setBookingHoldData] = useState(null);

  const [upiModalVisible, setUpiModalVisible] = useState(false);
  const [upiVpa, setUpiVpa] = useState("");
  const [confirmedBookingId, setConfirmedBookingId] = useState(null);

  useEffect(() => {
    fetchBuses();
    fetchRoutes();
    fetchTrips();
  }, []);

  const fetchBuses = async () => {
    try {
      const res = await axios.get("http://localhost:9002/api/v1/buses", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBuses(res.data || []);
    } catch (err) {
      console.error("Failed to load buses", err);
      setBuses([]);
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await axios.get("http://localhost:9002/api/v1/routes", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRoutes(res.data || []);
    } catch (err) {
      console.error("Failed to load routes", err);
      setRoutes([]);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await axios.get("http://localhost:9003/api/v1/trips", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTrips((res.data || []).filter((trip) => !trip.cancelled));
    } catch (err) {
      console.error("Failed to load trips", err);
      setTrips([]);
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
      let filteredTrips = (res.data || []).filter((trip) => !trip.cancelled);

      if (busType) {
        const allowedBusIds = buses.filter((b) => b.busType === busType).map((b) => b.id);
        filteredTrips = filteredTrips.filter((trip) => allowedBusIds.includes(trip.busId));
      }
      setTrips(filteredTrips);
    } catch (err) {
      console.error("Failed to search trips", err);
      setTrips([]);
    }
  };

  const getBusDisplay = (busId) => {
    const bus = buses.find((b) => b.id === busId);
    return bus ? `${bus.busNumber} (${bus.busType})` : "Unknown Bus";
  };

  const getRouteDisplay = (routeId) => {
    const route = routes.find((r) => r.id === routeId);
    return route ? `${route.source} → ${route.destination}` : "Unknown Route";
  };

  const handleBookClick = (trip) => {
    const bus = buses.find((b) => b.id === trip.busId);
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

  const handleProceedToPayment = ({ holdData, totalAmount, contact, passengers }) => {
    setBookingHoldData({ holdData, contact, passengers });
    setPaymentAmount(totalAmount);
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      const hold = bookingHoldData?.holdData || paymentResult.bookingHold?.holdData || paymentResult.bookingHold;
      const bookingIdentifier = hold?.bookingId || hold?.id || hold?.holdId || hold?.holdToken;

      if (!bookingIdentifier) {
        alert("Cannot confirm booking: hold response did not include a booking identifier. Check backend response.");
        setPaymentModalVisible(false);
        handleModalClose();
        return;
      }

      const confirmResponse = await axios.post(
        `http://localhost:9004/api/v1/bookings/confirm/${bookingIdentifier}`,
        null,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const bookingId = confirmResponse.data.bookingId || bookingIdentifier;
      setConfirmedBookingId(bookingId);

      const maybeHold = bookingHoldData?.holdData || bookingHoldData;
      const vpaCandidate =
        maybeHold?.upi ||
        maybeHold?.vpa ||
        maybeHold?.payeeVpa ||
        maybeHold?.merchantVpa ||
        maybeHold?.payee ||
        maybeHold?.merchant ||
        "";

      setUpiVpa(vpaCandidate);

      setPaymentModalVisible(false);
      setUpiModalVisible(true);

      handleModalClose();
    } catch (err) {
      console.error("Confirm booking failed:", err);
      alert("Payment succeeded (UI) but confirming booking failed. Please contact support.");
      setPaymentModalVisible(false);
      handleModalClose();
    }
  };

  const busTypes = [...new Set(buses.map((b) => b.busType))];

  return (
    <div className="container my-4" style={{ minHeight: "450px" }}>
      <h3>Search Trips</h3>

      <form className="row g-3 mb-4" onSubmit={handleSearch}>
        <div className="col-md-3">
          <input type="text" placeholder="From" className="form-control" value={origin} onChange={(e) => setOrigin(e.target.value)} />
        </div>
        <div className="col-md-3">
          <input type="text" placeholder="To" className="form-control" value={destination} onChange={(e) => setDestination(e.target.value)} />
        </div>
        <div className="col-md-2">
          <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={busType} onChange={(e) => setBusType(e.target.value)}>
            <option value="">All Bus Types</option>
            {busTypes.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" type="submit">
            Search
          </button>
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
            {trips.map((trip) => (
              <tr key={trip.id}>
                <td>{getBusDisplay(trip.busId)}</td>
                <td>{getRouteDisplay(trip.routeId)}</td>
                <td>
                  {new Date(trip.departureTime).toLocaleString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td>{new Date(trip.arrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
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
                <h5 className="modal-title">{modalStep === "seats" ? `Select Seat(s) - ${selectedBus.busNumber}` : `Passenger Details for ${selectedBus.busNumber}`}</h5>
                <button type="button" className="btn-close" onClick={handleModalClose}></button>
              </div>
              <div className="modal-body">
                {modalStep === "seats" ? (
                  <BusSeatingArrangement tripId={selectedTrip.id} seatPrice={selectedTrip.fare} onNext={handleSeatConfirm} />
                ) : (
                  <PassengersForm
                    seatNumbers={selectedSeats}
                    tripId={selectedTrip.id}
                    totalAmount={selectedTrip.fare * selectedSeats.length}
                    onCancel={() => setModalStep("seats")}
                    onProceedToPayment={handleProceedToPayment}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        amount={paymentAmount}
        bookingHold={bookingHoldData}
        onPaymentSuccess={(paymentResult) => {
          handlePaymentSuccess({ ...paymentResult, bookingHold: bookingHoldData });
        }}
      />

      <UpiPaymentModal
        visible={upiModalVisible}
        onClose={() => {
          setUpiModalVisible(false);
          setBookingHoldData(null);
          setConfirmedBookingId(null);
          setUpiVpa("");
        }}
        vpa={upiVpa}
        amount={paymentAmount}
        bookingId={confirmedBookingId}
      />
    </div>
  );
};

export default BusList;
