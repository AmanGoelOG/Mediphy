
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MedicineCard from "../components/MedicineCard";

const API_URL = "http://localhost:5000/api";

function MedicineSearch() {
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState(
    params.get("search") || ""
  );

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch medicines from MongoDB
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/medicines`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to fetch medicines."
          );
        }

        setMedicines(data.medicines || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  // Filter medicines by name or category
  const filteredMedicines = medicines.filter((medicine) =>
    `${medicine.name || ""} ${medicine.category || ""} ${
      medicine.manufacturer || ""
    }`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  // Update search query in URL
  const handleSearch = (e) => {
    e.preventDefault();

    const searchValue = search.trim();

    setParams(
      searchValue ? { search: searchValue } : {}
    );
  };

  return (
    <section className="page-container">
      <h1>Find Medicines</h1>

      <p className="page-subtitle">
        Search for medicines by name, category or manufacturer.
      </p>

      <form
        className="medicine-search-form"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search medicine..."
        />

        <button type="submit">
          Search
        </button>
      </form>

      <h2 className="section-heading">
        Available Medicines
      </h2>

      {loading ? (
        <p>Loading medicines...</p>
      ) : error ? (
        <p className="admin-error">{error}</p>
      ) : (
        <div className="card-grid">
          {filteredMedicines.length > 0 ? (
            filteredMedicines.map((medicine) => (
              <MedicineCard
                key={medicine._id}
                medicine={medicine}
              />
            ))
          ) : (
            <p>No matching medicines found.</p>
          )}
        </div>
      )}
    </section>
  );
}

export default MedicineSearch;
