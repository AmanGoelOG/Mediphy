
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function PharmacyDetails() {
  const { id } = useParams();

  const [pharmacy, setPharmacy] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPharmacyDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const [pharmacyResponse, inventoryResponse] =
          await Promise.all([
            fetch(`${API_URL}/pharmacies/${id}`),
            fetch(`${API_URL}/inventory`)
          ]);

        const pharmacyData = await pharmacyResponse.json();
        const inventoryData = await inventoryResponse.json();

        if (!pharmacyResponse.ok) {
          throw new Error(
            pharmacyData.message || "Pharmacy not found."
          );
        }

        if (!inventoryResponse.ok) {
          throw new Error(
            inventoryData.message || "Unable to load inventory."
          );
        }

        setPharmacy(pharmacyData.pharmacy);

        const pharmacyStock = (inventoryData.inventory || []).filter(
          (item) => item.pharmacyId?._id === id
        );

        setInventory(pharmacyStock);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacyDetails();
  }, [id]);

  if (loading) {
    return (
      <section className="page-container">
        <p>Loading pharmacy details...</p>
      </section>
    );
  }

  if (error || !pharmacy) {
    return (
      <section className="page-container">
        <h2>{error || "Pharmacy not found."}</h2>
        <Link to="/pharmacies">Back to Pharmacies</Link>
      </section>
    );
  }

  return (
    <section className="page-container">

      <h1>{pharmacy.name}</h1>

      <div className="detail-panel">

        <p>
          <strong>Address:</strong> {pharmacy.address}
        </p>

        <p>
          <strong>City:</strong> {pharmacy.city}
        </p>

        <p>
          <strong>Phone:</strong> {pharmacy.phone || "Not available"}
        </p>

        <p>
          <strong>Opening Hours:</strong>{" "}
          {pharmacy.openingHours || "Not available"}
        </p>

        <a
          className="primary-btn"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${pharmacy.name} ${pharmacy.address} ${pharmacy.city}`
          )}`}
          target="_blank"
          rel="noreferrer"
        >
          Get Directions
        </a>

        <h2>Listed Medicines</h2>

        {inventory.length === 0 ? (
          <p>No medicines are currently listed at this pharmacy.</p>
        ) : (
          inventory.map((item) => (
            <div className="result-row" key={item._id}>

              <div>
                <strong>
                  {item.medicineId?.name || "Medicine unavailable"}
                </strong>

                <p>
                  {item.medicineId?.category || ""}
                </p>
              </div>

              <div>
                <strong>
                  ₹{Number(item.price).toFixed(2)}
                </strong>

                <p>{item.quantity} units listed</p>

                {item.medicineId?._id && (
                  <Link
                    to={`/price-comparison/${item.medicineId._id}`}
                    className="card-link"
                  >
                    Compare Prices
                  </Link>
                )}

              </div>

            </div>
          ))
        )}

      </div>

    </section>
  );
}

export default PharmacyDetails;
