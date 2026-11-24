
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/admin";

const AdminUsers = () => {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch users."
        );
      }

      setUsers(data.users || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const filteredUsers = users.filter((user) => {
    const searchValue = search.toLowerCase();

    return (
      user.name?.toLowerCase().includes(searchValue) ||
      user.email?.toLowerCase().includes(searchValue)
    );
  });

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="admin-page">

      <div className="admin-page-header">
        <div>
          <p className="admin-subtitle">ADMIN PANEL</p>
          <h1>Registered Users</h1>
          <p>View and manage information about Mediphy users.</p>
        </div>

        <span className="admin-count">
          {users.length} Users
        </span>
      </div>

      {error && (
        <div className="admin-error">{error}</div>
      )}

      <section className="admin-table-section">

        <div className="admin-section-heading">
          <h2>All Users</h2>

          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (

          <div className="admin-table-wrapper">
            <table className="admin-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Registration Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="reservation-status status-confirmed">
                        User
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </section>

    </div>
  );
};

export default AdminUsers;
