
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/admin";

const AdminDashboard = () => {
  const { user, token } = useAuth();

  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalMedicines: 0,
    totalPharmacies: 0,
    totalInventory: 0,
    totalReservations: 0,
    pendingReservations: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load dashboard.");
        }

        setStatistics(data.statistics);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    }
  }, [token]);

  const statCards = [
    {
      title: "Total Users",
      value: statistics.totalUsers,
      icon: "👥",
      color: "blue"
    },
    {
      title: "Total Medicines",
      value: statistics.totalMedicines,
      icon: "💊",
      color: "green"
    },
    {
      title: "Total Pharmacies",
      value: statistics.totalPharmacies,
      icon: "🏥",
      color: "purple"
    },
    {
      title: "Inventory Records",
      value: statistics.totalInventory,
      icon: "📦",
      color: "orange"
    },
    {
      title: "Total Reservations",
      value: statistics.totalReservations,
      icon: "📋",
      color: "pink"
    },
    {
      title: "Pending Reservations",
      value: statistics.pendingReservations,
      icon: "⏳",
      color: "red"
    }
  ];

  const managementLinks = [
    {
      title: "Manage Medicines",
      description: "Add, edit and delete medicines.",
      icon: "💊",
      path: "/admin/medicines"
    },
    {
      title: "Manage Pharmacies",
      description: "Manage pharmacy information.",
      icon: "🏥",
      path: "/admin/pharmacies"
    },
    {
      title: "Manage Inventory",
      description: "Update medicine prices and quantities.",
      icon: "📦",
      path: "/admin/inventory"
    },
    {
      title: "Manage Reservations",
      description: "View and update reservation statuses.",
      icon: "📋",
      path: "/admin/reservations"
    },
    {
      title: "Manage Users",
      description: "View registered user accounts.",
      icon: "👥",
      path: "/admin/users"
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-welcome">
        <div>
          <p className="admin-subtitle">ADMIN PANEL</p>
          <h1>Welcome, {user?.name}!</h1>
          <p>Manage your Mediphy application from one place.</p>
        </div>

        <span className="admin-badge">Administrator</span>
      </div>

      {loading ? (
        <p className="admin-message">Loading dashboard...</p>
      ) : error ? (
        <p className="admin-error">{error}</p>
      ) : (
        <>
          <section className="admin-statistics">
            <h2>Dashboard Overview</h2>

            <div className="admin-stat-grid">
              {statCards.map((card) => (
                <div
                  className={`admin-stat-card ${card.color}`}
                  key={card.title}
                >
                  <div className="admin-stat-icon">{card.icon}</div>
                  <div>
                    <p>{card.title}</p>
                    <h3>{card.value}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-management">
            <h2>Manage Application</h2>

            <div className="admin-management-grid">
              {managementLinks.map((item) => (
                <div className="admin-management-card" key={item.title}>
                  <span className="admin-management-icon">
                    {item.icon}
                  </span>

                  <h3>{item.title}</h3>
                  <p>{item.description}</p>

                  <Link to={item.path}>
                    Manage →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
