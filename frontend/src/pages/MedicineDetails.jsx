
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function MedicineDetails() {
  const { id } = useParams();

  const [medicine, setMedicine] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMedicineDetails = async () => {
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
            medicineData.message || "Medicine not found."
          );
        }

        if (!inventoryResponse.ok) {
          throw new Error(
            inventoryData.message || "Unable to fetch pharmacy availability."
          );
        }

        setMedicine(medicineData.medicine);

        const pharmacyOptions = (inventoryData.inventory || [])
          .filter((item) => item.pharmacyId)
          .sort((a, b) => a.price - b.price);

        setOptions(pharmacyOptions);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicineDetails();
  }, [id]);

  if (loading) {
    return (
      <section className="page-container">
        <p>Loading medicine details...</p>
      </section>
    );
  }

  if (error || !medicine) {
    return (
      <section className="page-container">
        <h2>{error || "Medicine not found."}</h2>
        <Link to="/medicines">Back to Medicines</Link>
      </section>
    );
  }

  return (
    <section className="page-container">
      <h1>{medicine.name}</h1>

      <p className="page-subtitle">
        {medicine.category || "General Medicine"}
      </p>

      <div className="detail-panel">
        <h2>About this medicine</h2>

        <p>
          {medicine.description || "No description available."}
        </p>

        {medicine.manufacturer && (
          <p>
            <strong>Manufacturer:</strong> {medicine.manufacturer}
          </p>
        )}

        <h2>Pharmacy Availability</h2>

        {options.length > 0 ? (
          options.map((option) => (
            <div className="result-row" key={option._id}>
              <div>
                <strong>{option.pharmacyId.name}</strong>

                <p>{option.pharmacyId.address}</p>

                <p>{option.pharmacyId.city}</p>

                <p>
                  {option.quantity} units listed
                </p>
              </div>

              <div>
                <h2>
                  ₹{Number(option.price).toFixed(2)}
                </h2>

                <p>
                  {option.quantity > 0
                    ? "Listed in stock"
                    : "Out of stock"}
                </p>

                <Link
                  to={`/price-comparison/${id}`}
                  className="card-link"
                >
                  Compare Prices
                </Link>

                {option.quantity > 0 && (
                  <Link
                    to={`/reserve/${id}?pharmacy=${option.pharmacyId._id}`}
                    className="card-link"
                  >
                    Reserve
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No pharmacy listings found for this medicine.</p>
        )}
      </div>
    </section>
  );
}

export default MedicineDetails;
