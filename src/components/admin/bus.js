import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminBusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [busNumber, setBusNumber] = useState("");
  const [busType, setBusType] = useState("AC");
  const [totalSeats, setTotalSeats] = useState("40");
  const [operatorName, setOperatorName] = useState("");
  const [editingBusId, setEditingBusId] = useState(null);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:9002/api/v1/buses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBuses(response.data);
    } catch (error) {
      console.error("Failed to fetch buses:", error);
    }
  };

  const resetForm = () => {
    setBusNumber("");
    setBusType("AC");
    setTotalSeats("40");
    setOperatorName("");
    setEditingBusId(null);
  };

  const handleAddOrUpdateBus = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!busNumber.trim()) return alert("Bus Number is required");
    if (!operatorName.trim()) return alert("Operator Name is required");
    const seatsNumber = Number(totalSeats);
    if (isNaN(seatsNumber) || seatsNumber <= 0)
      return alert("Total seats must be a positive number");

    // Check for duplicates only if adding new bus
    if (!editingBusId) {
      const exists = buses.find((b) => b.busNumber === busNumber.trim());
      if (exists) return alert("Bus Number already exists");
    }

    const busData = {
      busNumber: busNumber.trim(),
      busType,
      totalSeats: seatsNumber,
      operatorName: operatorName.trim(),
    };

    try {
      if (editingBusId) {
        // Update bus
        const response = await axios.put(
          `http://localhost:9002/api/v1/buses/${editingBusId}`,
          busData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setBuses(
          buses.map((bus) => (bus.id === editingBusId ? response.data : bus))
        );
      } else {
        // Add new bus
        const response = await axios.post(
          "http://localhost:9002/api/v1/buses",
          busData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setBuses([...buses, response.data]);
      }
      resetForm();
    } catch (error) {
      console.error("Failed to add/update bus:", error);
      alert("Failed to add/update bus. Check console for details.");
    }
  };

  const handleEditClick = (bus) => {
    setEditingBusId(bus.id);
    setBusNumber(bus.busNumber);
    setBusType(bus.busType);
    setTotalSeats(String(bus.totalSeats));
    setOperatorName(bus.operatorName);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bus?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:9002/api/v1/buses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBuses(buses.filter((bus) => bus.id !== id));
      if (editingBusId === id) resetForm();
    } catch (error) {
      console.error("Failed to delete bus:", error);
      alert("Failed to delete bus. Check console for details.");
    }
  };

  return (
    <div className="container my-4" style={{minHeight: '450px'}}>
      <h3>Bus Management</h3>
      <form className="mb-4" onSubmit={handleAddOrUpdateBus}>
        <div className="row g-3 align-items-center">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Bus Number"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={busType}
              onChange={(e) => setBusType(e.target.value)}
            >
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
              <option value="Sleeper">Sleeper</option>
            </select>
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Total Seats"
              value={totalSeats}
              min={1}
              onChange={(e) => {
                const val = e.target.value;
                setTotalSeats(val === "" ? "" : parseInt(val, 10));
              }}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Operator Name"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              required
            />
          </div>
          <div className="col-md-1 d-flex">
            <button className="btn btn-primary w-100" type="submit">
              {editingBusId ? "Update" : "Add"}
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

      <h5>Bus List</h5>
      {buses.length === 0 ? (
        <p>No buses added yet.</p>
      ) : (
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Bus Number</th>
              <th>Type</th>
              <th>Total Seats</th>
              <th>Operator Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buses.map(({ id, busNumber, busType, totalSeats, operatorName }) => (
              <tr key={id}>
                <td>{busNumber}</td>
                <td>{busType}</td>
                <td>{totalSeats}</td>
                <td>{operatorName}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() =>
                      handleEditClick({
                        id,
                        busNumber,
                        busType,
                        totalSeats,
                        operatorName,
                      })
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteClick(id)}
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

export default AdminBusManagement;
