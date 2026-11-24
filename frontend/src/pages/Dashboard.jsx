
import { Link, Navigate } from "react-router-dom";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("mediphyUser") || "null");

  if (!user) return <Navigate to="/login" replace />;

  return (
    <section className="page-container">
      <h1>Welcome, {user.name}!</h1>
      <p className="page-subtitle">Your Mediphy dashboard.</p>

      <div className="feature-cards">
        <Link to="/medicines" className="feature-card dashboard-card">
          <h3>Find Medicine</h3>
          <p>Search for the medicines you need.</p>
        </Link>

        <Link to="/pharmacies" className="feature-card dashboard-card">
          <h3>Find Pharmacy</h3>
          <p>Explore pharmacy listings.</p>
        </Link>

        <Link to="/reservations" className="feature-card dashboard-card">
          <h3>My Reservations</h3>
          <p>View your submitted requests.</p>
        </Link>
      </div>
    </section>
  );
}

export default Dashboard;
