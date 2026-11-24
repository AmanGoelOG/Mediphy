
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function PriceComparison() {
  const { id } = useParams();

  const [medicine, setMedicine] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPriceComparison = async () => {
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
            inventoryData.message || "Unable to fetch pharmacy prices."
          );
        }

        setMedicine(medicineData.medicine);

        const availableOptions = (inventoryData.inventory || [])
          .filter(
            (item) =>
              item.quantity > 0 &&
              item.pharmacyId
          )
          .sort((a, b) => a.price - b.price);

        setOptions(availableOptions);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceComparison();
  }, [id]);

  if (loading) {
    return (
      <section className="page-container">
        <p>Loading price comparison...</p>
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
      <h1>Price Comparison</h1>

      <p className="page-subtitle">
        Compare listed prices for {medicine.name}.
      </p>

      <div className="detail-panel">
        {options.map((option, index) => (
          <div className="result-row" key={option._id}>
            <div>
              <strong>{option.pharmacyId.name}</strong>

              <p>
                {option.pharmacyId.address}
              </p>

              <p>
                {option.pharmacyId.city}
              </p>

              {index === 0 && (
                <span className="category">
                  Lowest listed price
                </span>
              )}
            </div>

            <div>
              <h2>
                ₹{Number(option.price).toFixed(2)}
              </h2>

              <p>
                {option.quantity} units available
              </p>

              <Link
                to={`/reserve/${medicine._id}?pharmacy=${option.pharmacyId._id}`}
                className="card-link"
              >
                Reserve
              </Link>
            </div>
          </div>
        ))}

        {options.length === 0 && (
          <p>No in-stock listings are available for this medicine.</p>
        )}
      </div>
    </section>
  );
}

export default PriceComparison;
