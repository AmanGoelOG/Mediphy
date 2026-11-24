
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/admin";

const AdminReservations = () => {
  const { token } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/reservations`,
        { headers }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch reservations."
        );
      }

      setReservations(data.reservations || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchReservations();
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/reservations/${id}/status`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update reservation."
        );
      }

      setMessage("Reservation status updated successfully.");
      await fetchReservations();

    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReservations =
    filter === "All"
      ? reservations
      : reservations.filter(
          (reservation) => reservation.status === filter
        );

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  const getTotal = (reservation) => {
    return (
      Number(reservation.unitPrice || 0) *
      Number(reservation.quantity || 0)
    ).toFixed(2);
  };

  return (
    <div className="admin-page">

      <div className="admin-page-header">
        <div>
          <p className="admin-subtitle">ADMIN PANEL</p>
          <h1>Manage Reservations</h1>
          <p>View and manage medicine reservations made by users.</p>
        </div>

        <span className="admin-count">
          {reservations.length} Reservations
        </span>
      </div>

      {message && (
        <div className="admin-success">{message}</div>
      )}

      {error && (
        <div className="admin-error">{error}</div>
      )}

      <section className="admin-table-section">

        <div className="admin-section-heading">
          <h2>All Reservations</h2>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Ready for Pickup">Ready for Pickup</option>
            <option value="Collected">Collected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <p>Loading reservations...</p>
        ) : filteredReservations.length === 0 ? (
          <p>No reservations found.</p>
        ) : (

          <div className="admin-table-wrapper">
            <table className="admin-table">

              <thead>
                <tr>
                  <th>User</th>
                  <th>Medicine</th>
                  <th>Pharmacy</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Reservation Date</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredReservations.map((reservation) => (
                  <tr key={reservation._id}>

                    <td>
                      <strong>
                        {reservation.userId?.name || "User unavailable"}
                      </strong>
                      <br />
                      <small>
                        {reservation.userId?.email || "-"}
                      </small>
                    </td>

                    <td>
                      {reservation.medicineId?.name || "Medicine unavailable"}
                    </td>

                    <td>
                      {reservation.pharmacyId?.name || "Pharmacy unavailable"}
                    </td>

                    <td>{reservation.quantity}</td>

                    <td>₹{getTotal(reservation)}</td>

                    <td>{formatDate(reservation.createdAt)}</td>

                    <td>
                      <span className={`reservation-status status-${reservation.status?.toLowerCase().replaceAll(" ", "-")}`}>
                        {reservation.status}
                      </span>
                    </td>

                    <td>
                      <select
                        value={reservation.status}
                        disabled={updatingId === reservation._id}
                        onChange={(e) =>
                          updateStatus(reservation._id, e.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Ready for Pickup">Ready for Pickup</option>
                        <option value="Collected">Collected</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </section>

    </div>
  );
};

export default AdminReservations;
