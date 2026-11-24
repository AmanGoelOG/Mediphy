
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api";

function ReserveMedicine() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const { token, isLoggedIn } = useAuth();

  const [medicine, setMedicine] = useState(null);
  const [availablePharmacies, setAvailablePharmacies] = useState([]);

  const [pharmacyId, setPharmacyId] = useState(
    params.get("pharmacy") || ""
  );

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch medicine and its available pharmacy inventory
  useEffect(() => {
    const fetchReservationData = async () => {
      try {
        setLoading(true);
        setError("");

        const [medicineResponse, inventoryResponse] =
          await Promise.all([
            fetch(`${API_URL}/medicines/${id}`),
            fetch(`${API_URL}/inventory/medicine/${id}`)
          ]);

        const medicineData = await medicineResponse.json();
        const inventoryData = await inventoryResponse.json();

        if (!medicineResponse.ok) {
          throw new Error(
            medicineData.message || "Unable to find medicine."
          );
        }

        if (!inventoryResponse.ok) {
          throw new Error(
            inventoryData.message || "Unable to load pharmacy inventory."
          );
        }

        setMedicine(medicineData.medicine);

        const pharmacies = (inventoryData.inventory || []).filter(
          (item) =>
            item.quantity > 0 &&
            item.pharmacyId &&
            item.pharmacyId._id
        );

        setAvailablePharmacies(pharmacies);

        // Keep the selected pharmacy only if it has available stock
        const requestedPharmacy = params.get("pharmacy");

        if (
          requestedPharmacy &&
          pharmacies.some(
            (item) => item.pharmacyId._id === requestedPharmacy
          )
        ) {
          setPharmacyId(requestedPharmacy);
        } else {
          setPharmacyId("");
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservationData();
  }, [id, params]);

  // Submit reservation to MongoDB through backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn || !token) {
      alert("Please log in before making a reservation.");
      navigate("/login");
      return;
    }

    const selectedInventory = availablePharmacies.find(
      (item) => item.pharmacyId._id === pharmacyId
    );

    const requestedQuantity = Number(quantity);

    if (
      !selectedInventory ||
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1 ||
      requestedQuantity > selectedInventory.quantity
    ) {
      setError("Please select a valid pharmacy and quantity.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          medicineId: id,
          pharmacyId,
          quantity: requestedQuantity
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to submit reservation."
        );
      }

      alert("Reservation request submitted successfully!");

      navigate("/my-reservations");

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="page-container">
        <p>Loading reservation details...</p>
      </section>
    );
  }

  if (!medicine) {
    return (
      <section className="page-container">
        <h2>{error || "Medicine not found."}</h2>
      </section>
    );
  }

  return (
    <section className="page-container">
      <h1>Reserve Medicine</h1>

      <p className="page-subtitle">
        Submit a reservation request for pharmacy pickup.
      </p>

      <form className="form-card" onSubmit={handleSubmit}>
        <h2>{medicine.name}</h2>

        <p>
          <strong>Category:</strong>{" "}
          {medicine.category || "Not specified"}
        </p>

        <label>Select Pharmacy</label>

        <select
          value={pharmacyId}
          onChange={(e) => setPharmacyId(e.target.value)}
          required
        >
          <option value="">Choose a pharmacy</option>

          {availablePharmacies.map((item) => (
            <option
              key={item._id}
              value={item.pharmacyId._id}
            >
              {item.pharmacyId.name} - ₹
              {Number(item.price).toFixed(2)} (
              {item.quantity} available)
            </option>
          ))}
        </select>

        {availablePharmacies.length === 0 && (
          <p className="form-note">
            This medicine is currently not listed as available
            at any pharmacy.
          </p>
        )}

        <label>Quantity</label>

        <input
          type="number"
          min="1"
          max={
            availablePharmacies.find(
              (item) => item.pharmacyId._id === pharmacyId
            )?.quantity || 1
          }
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        {pharmacyId && (
          <p className="form-note">
            Available quantity: {
              availablePharmacies.find(
                (item) => item.pharmacyId._id === pharmacyId
              )?.quantity || 0
            }
          </p>
        )}

        {error && (
          <p className="admin-error">{error}</p>
        )}

        <button
          type="submit"
          disabled={
            submitting ||
            availablePharmacies.length === 0
          }
        >
          {submitting ? "Submitting..." : "Submit Reservation"}
        </button>

        <p className="form-note">
          Your reservation request will be saved in the Mediphy
          database with Pending status.
        </p>
      </form>
    </section>
  );
}

export default ReserveMedicine;
