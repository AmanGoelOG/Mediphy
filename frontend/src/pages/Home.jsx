import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(search.trim())}`);
    }
  }
  return (
    <main>
      <section className="hero">
        <p className="hero-tag">YOUR HEALTH, OUR PRIORITY</p>
        <h1>Find Your Medicines<br />At Nearby Pharmacies</h1>
        <p className="hero-description">
          Search medicines, discover nearby pharmacies and compare prices
          easily with Mediphy.
        </p>
        <form className="search-box" onSubmit={handleSearch}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter medicine name..."
          />
          <button type="submit">Search Medicine</button>
        </form>
        <div className="hero-features">
          <span>✓ Medicine Search</span>
          <span>✓ Price Comparison</span>
          <span>✓ Pharmacy Finder</span>
        </div>
      </section>
      <section className="how-it-works">
        <h2>How Mediphy Works</h2>
        <p>Find the medicines you need in three simple steps.</p>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>01. Search Medicine</h3>
            <p>Search for the medicine you need.</p>
          </div>
          <div className="feature-card">
            <h3>02. Compare Options</h3>
            <p>Explore pharmacy availability and prices.</p>
          </div>
          <div className="feature-card">
            <h3>03. Reserve Medicine</h3>
            <p>Submit a reservation request for pickup.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
