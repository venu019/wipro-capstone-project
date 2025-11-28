import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "./navbar";

// --- Main Component ---
const SellerBusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [busNumber, setBusNumber] = useState("");
  const [busType, setBusType] = useState("AC");
  const [totalSeats, setTotalSeats] = useState("40");
  const [editingBusId, setEditingBusId] = useState(null);

  // --- GET SELLER-SPECIFIC DATA FROM LOCALSTORAGE ---
  const token = localStorage.getItem("token");
  const sellerId = localStorage.getItem("sellerId");
  // The operator name is now retrieved directly from localStorage
  const operatorName = localStorage.getItem("travelsName");

  // --- FETCH SELLER'S BUSES ---
  const fetchBuses = useCallback(async () => {
    // If there's no sellerId, don't attempt to fetch buses
    if (!sellerId) {
      console.error("Seller ID not found. Please log in as a seller.");
      return;
    }
    try {
      const response = await axios.get(
        // **CHANGE**: Use the new seller-specific endpoint
        `http://localhost:9002/api/v1/seller/${sellerId}/buses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBuses(response.data);
    } catch (error) {
      console.error("Failed to fetch buses:", error);
      alert("Could not load your buses. Please try again later.");
    }
  }, [token, sellerId]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const resetForm = () => {
    setBusNumber("");
    setBusType("AC");
    setTotalSeats("40");
    setEditingBusId(null);
  };

  // --- ADD OR UPDATE BUS ---
  const handleAddOrUpdateBus = async (e) => {
    e.preventDefault();

    if (!busNumber.trim()) return alert("Bus Number is required");
    const seatsNumber = Number(totalSeats);
    if (isNaN(seatsNumber) || seatsNumber <= 0) return alert("Total seats must be a positive number");

    if (!editingBusId) {
      const exists = buses.find((b) => b.busNumber === busNumber.trim());
      if (exists) return alert("A bus with this number already exists.");
    }

    // **CHANGE**: Include sellerId and the automatically retrieved operatorName
    const busData = {
      busNumber: busNumber.trim(),
      busType,
      totalSeats: seatsNumber,
      operatorName: operatorName, 
      sellerId: sellerId,         
    };

    try {
      if (editingBusId) {
        // --- UPDATE ---
        const response = await axios.put(
          `http://localhost:9002/api/v1/buses/${editingBusId}`,
          busData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBuses(buses.map((bus) => (bus.id === editingBusId ? response.data : bus)));
      } else {
        // --- ADD NEW ---
        console.log("Adding bus with data:", busData);
        const response = await axios.post(
          "http://localhost:9002/api/v1/buses",
          busData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBuses([...buses, response.data]);
      }
      resetForm();
    } catch (error) {
      console.error("Failed to add/update bus:", error);
      alert(`Operation failed: ${error.response?.data?.message || 'Please check console.'}`);
    }
  };

  const handleEditClick = (bus) => {
    setEditingBusId(bus.id);
    setBusNumber(bus.busNumber);
    setBusType(bus.busType);
    setTotalSeats(String(bus.totalSeats));
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bus?")) return;
    try {
      await axios.delete(`http://localhost:9002/api/v1/buses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuses(buses.filter((bus) => bus.id !== id));
      if (editingBusId === id) resetForm();
    } catch (error) {
      console.error("Failed to delete bus:", error);
      alert(`Deletion failed: ${error.response?.data?.message || 'Please check console.'}`);
    }
  };

  return (
    <div className="container my-4" style={{ minHeight: '450px' }}>
      <AdminNavbar />
      <h3>My Bus Fleet</h3>
      <p>Operator: <strong>{operatorName || 'Not Available'}</strong></p>

      <form className="mb-4 card p-3 bg-light" onSubmit={handleAddOrUpdateBus}>
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Bus Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., AP01 AB 1234"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Bus Type</label>
            <select
              className="form-select"
              value={busType}
              onChange={(e) => setBusType(e.target.value)}
            >
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
              <option value="Sleeper">Sleeper</option>
              <option value="AC Sleeper">AC Sleeper</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Total Seats</label>
            <input
              type="number"
              className="form-control"
              placeholder="Seats"
              value={totalSeats}
              min={1}
              onChange={(e) => setTotalSeats(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button className="btn btn-primary w-100" type="submit">
              {editingBusId ? "Update Bus" : "Add Bus"}
            </button>
            {editingBusId && (
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <h5>My Bus List</h5>
      {buses.length === 0 ? (
        <p>You haven't added any buses yet. Use the form above to add your first bus.</p>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Bus Number</th>
              <th>Type</th>
              <th>Seats</th>
              <th>Operator</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus.id}>
                <td>{bus.busNumber}</td>
                <td>{bus.busType}</td>
                <td>{bus.totalSeats}</td>
                <td>{bus.operatorName}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() => handleEditClick(bus)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteClick(bus.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SellerBusManagement;
