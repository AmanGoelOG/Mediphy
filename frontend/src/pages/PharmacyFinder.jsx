
import { useEffect, useState } from "react";
import PharmacyCard from "../components/PharmacyCard";

const API_URL = "http://localhost:5000/api";

function PharmacyFinder() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/pharmacies`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to fetch pharmacies."
          );
        }

        setPharmacies(data.pharmacies || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  return (
    <section className="page-container">
      <h1>Find Pharmacies</h1>

      <p className="page-subtitle">
        Explore pharmacy listings and their locations.
      </p>

      {loading ? (
        <p>Loading pharmacies...</p>
      ) : error ? (
        <p className="admin-error">{error}</p>
      ) : pharmacies.length > 0 ? (
        <div className="card-grid">
          {pharmacies.map((pharmacy) => (
            <PharmacyCard
              key={pharmacy._id}
              pharmacy={pharmacy}
            />
          ))}
        </div>
      ) : (
        <p>No pharmacies found in the database.</p>
      )}

      <div className="map-panel">
        <h2>Explore on Google Maps</h2>

        <p>
          Search for pharmacies near your location using Google Maps.
        </p>

        <a
          className="primary-btn"
          href="https://www.google.com/maps/search/pharmacy+near+me"
          target="_blank"
          rel="noreferrer"
        >
          Open Google Maps
        </a>
      </div>
    </section>
  );
}

export default PharmacyFinder;
