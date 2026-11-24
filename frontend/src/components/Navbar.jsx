
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <span className="logo-icon">✚</span>
        <span>Mediphy</span>
      </Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/medicines">Medicines</Link>
        <Link to="/pharmacies">Pharmacies</Link>

        {isLoggedIn && !isAdmin && (
          <>
            <Link to="/my-reservations">My Reservations</Link>
          </>
        )}

        {isLoggedIn && isAdmin && (
          <Link to="/admin/dashboard">
            Admin Dashboard
          </Link>
        )}
      </div>

      <div className="navbar-actions">
        {isLoggedIn ? (
          <>
            <span className="navbar-user">
              {isAdmin ? "Admin" : "Hi"}, {user.name}
            </span>

            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-btn">
              Login
            </Link>

            <Link to="/register" className="register-btn">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
