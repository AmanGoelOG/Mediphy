
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api";

function MyReservations() {
  const { token } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/reservations/my-reservations`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load reservations."
          );
        }

        setReservations(data.reservations || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchReservations();
    } else {
      setLoading(false);
      setError("Please log in to view your reservations.");
    }
  }, [token]);

  if (loading) {
    return (
      <section className="page-container">
        <h1>My Reservations</h1>
        <p>Loading your reservations...</p>
      </section>
    );
  }

  return (
    <section className="page-container">
      <h1>My Reservations</h1>
      <p className="page-subtitle">
        View your submitted medicine reservation requests.
      </p>

      {error && (
        <div className="detail-panel">
          <p className="error-message">{error}</p>
        </div>
      )}

      {!error && reservations.length === 0 && (
        <div className="detail-panel">
          <p>You haven't made any reservations yet.</p>
        </div>
      )}

      {!error && reservations.length > 0 && (
        <div className="detail-panel">
          {reservations.map((item) => (
            <div className="result-row" key={item._id}>
              <div>
                <strong>
                  {item.medicineId?.name || "Medicine unavailable"}
                </strong>

                <p>
                  {item.pharmacyId?.name || "Pharmacy unavailable"}
                </p>

                <p>
                  Quantity: {item.quantity}
                </p>

                <p>
                  Date: {new Date(item.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>

              <div>
                <strong>
                  ₹{(item.unitPrice * item.quantity).toFixed(2)}
                </strong>

                <p>
                  Status: {item.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyReservations;
