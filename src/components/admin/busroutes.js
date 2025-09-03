import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminRouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [editingRouteId, setEditingRouteId] = useState(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:9002/api/v1/routes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoutes(response.data);
    } catch (error) {
      console.error("Failed to fetch routes:", error);
    }
  };

  const resetForm = () => {
    setSource("");
    setDestination("");
    setDistance("");
    setDuration("");
    setEditingRouteId(null);
  };

  const handleAddOrUpdateRoute = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!source.trim()) return alert("Source is required");
    if (!destination.trim()) return alert("Destination is required");

    const distNum = parseFloat(distance);
    if (distance !== "" && (isNaN(distNum) || distNum < 0))
      return alert("Distance must be a positive number");

    const durNum = parseInt(duration, 10);
    if (duration !== "" && (isNaN(durNum) || durNum < 0))
      return alert("Duration must be a positive integer");

    const routeData = {
      source: source.trim(),
      destination: destination.trim(),
      distance: distance === "" ? 0 : distNum,
      duration: duration === "" ? 0 : durNum,
    };

    try {
      if (editingRouteId) {
        // Update route
        const response = await axios.put(
          `http://localhost:9002/api/v1/routes/${editingRouteId}`,
          routeData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setRoutes(
          routes.map((route) =>
            route.id === editingRouteId ? response.data : route
          )
        );
      } else {
        // Add new route
        const response = await axios.post(
          "http://localhost:9002/api/v1/routes",
          routeData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setRoutes([...routes, response.data]);
      }
      resetForm();
    } catch (error) {
      console.error("Failed to add/update route:", error);
      alert("Failed to add/update route. Check console for details.");
    }
  };

  const handleEditClick = (route) => {
    setEditingRouteId(route.id);
    setSource(route.source);
    setDestination(route.destination);
    setDistance(String(route.distance));
    setDuration(String(route.duration));
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:9002/api/v1/routes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoutes(routes.filter((route) => route.id !== id));
      if (editingRouteId === id) resetForm();
    } catch (error) {
      console.error("Failed to delete route:", error);
      alert("Failed to delete route. Check console for details.");
    }
  };

  return (
    <div className="container my-4" style={{minHeight: '450px'}}>
      <h3>Route Management</h3>

      <form className="mb-4" onSubmit={handleAddOrUpdateRoute}>
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Distance (km)"
              value={distance}
              min="0"
              step="0.1"
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Duration (min)"
              value={duration}
              min="0"
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div className="col-md-2 d-flex">
            <button className="btn btn-primary w-100" type="submit">
              {editingRouteId ? "Update" : "Add"} Route
            </button>
            {editingRouteId && (
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

      <h5>Route List</h5>
      {routes.length === 0 ? (
        <p>No routes added yet.</p>
      ) : (
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Source</th>
              <th>Destination</th>
              <th>Distance (km)</th>
              <th>Duration (min)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(({ id, source, destination, distance, duration }) => (
              <tr key={id}>
                <td>{source}</td>
                <td>{destination}</td>
                <td>{distance}</td>
                <td>{duration}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() =>
                      handleEditClick({
                        id,
                        source,
                        destination,
                        distance,
                        duration,
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

export default AdminRouteManagement;
