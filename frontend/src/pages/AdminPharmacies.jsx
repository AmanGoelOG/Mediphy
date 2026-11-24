
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/admin";

const emptyForm = {
  name: "",
  address: "",
  city: "Delhi",
  phone: "",
  latitude: "",
  longitude: "",
  openingHours: ""
};

const AdminPharmacies = () => {
  const { token } = useAuth();

  const [pharmacies, setPharmacies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/pharmacies`, {
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch pharmacies.");
      }

      setPharmacies(data.pharmacies);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPharmacies();
  }, [token]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        ...form,
        latitude: form.latitude === "" ? undefined : Number(form.latitude),
        longitude: form.longitude === "" ? undefined : Number(form.longitude)
      };

      const url = editingId
        ? `${API_URL}/pharmacies/${editingId}`
        : `${API_URL}/pharmacies`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save pharmacy.");
      }

      setMessage(
        editingId
          ? "Pharmacy updated successfully."
          : "Pharmacy added successfully."
      );

      resetForm();
      await fetchPharmacies();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pharmacy) => {
    setEditingId(pharmacy._id);

    setForm({
      name: pharmacy.name || "",
      address: pharmacy.address || "",
      city: pharmacy.city || "",
      phone: pharmacy.phone || "",
      latitude: pharmacy.latitude ?? "",
      longitude: pharmacy.longitude ?? "",
      openingHours: pharmacy.openingHours || ""
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this pharmacy? Its inventory records will also be deleted."
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/pharmacies/${id}`, {
        method: "DELETE",
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete pharmacy.");
      }

      setMessage("Pharmacy deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await fetchPharmacies();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-subtitle">ADMIN PANEL</p>
          <h1>Manage Pharmacies</h1>
          <p>Add, update and manage pharmacy information.</p>
        </div>

        <span className="admin-count">
          {pharmacies.length} Pharmacies
        </span>
      </div>

      {message && (
        <div className="admin-success">{message}</div>
      )}

      {error && (
        <div className="admin-error">{error}</div>
      )}

      <section className="admin-form-section">
        <h2>
          {editingId ? "Edit Pharmacy" : "Add New Pharmacy"}
        </h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Pharmacy Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter pharmacy name"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>

            <div className="admin-form-group">
              <label>Opening Hours</label>
              <input
                type="text"
                name="openingHours"
                value={form.openingHours}
                onChange={handleChange}
                placeholder="e.g. 9 AM - 10 PM"
              />
            </div>

            <div className="admin-form-group">
              <label>Latitude</label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="Enter latitude"
              />
            </div>

            <div className="admin-form-group">
              <label>Longitude</label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="Enter longitude"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Full Address *</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter complete pharmacy address"
              rows="3"
              required
            />
          </div>

          <div className="admin-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Pharmacy"
                  : "Add Pharmacy"}
            </button>

            {editingId && (
              <button
                type="button"
                className="admin-cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin-table-section">
        <h2>Pharmacy Dataset</h2>

        {loading ? (
          <p>Loading pharmacies...</p>
        ) : pharmacies.length === 0 ? (
          <p>No pharmacies found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pharmacy</th>
                  <th>City</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {pharmacies.map((pharmacy) => (
                  <tr key={pharmacy._id}>
                    <td>{pharmacy.name}</td>
                    <td>{pharmacy.city}</td>
                    <td>{pharmacy.address}</td>
                    <td>{pharmacy.phone || "Not specified"}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          onClick={() => handleEdit(pharmacy)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => handleDelete(pharmacy._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
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

export default AdminPharmacies;
