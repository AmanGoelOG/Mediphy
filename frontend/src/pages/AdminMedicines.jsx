
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/admin";

const emptyForm = {
  name: "",
  category: "",
  manufacturer: "",
  description: "",
  image: ""
};

const AdminMedicines = () => {
  const { token } = useAuth();

  const [medicines, setMedicines] = useState([]);
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

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/medicines`, {
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch medicines.");
      }

      setMedicines(data.medicines);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMedicines();
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

      const url = editingId
        ? `${API_URL}/medicines/${editingId}`
        : `${API_URL}/medicines`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers,
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save medicine.");
      }

      setMessage(
        editingId
          ? "Medicine updated successfully."
          : "Medicine added successfully."
      );

      resetForm();
      await fetchMedicines();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (medicine) => {
    setEditingId(medicine._id);

    setForm({
      name: medicine.name || "",
      category: medicine.category || "",
      manufacturer: medicine.manufacturer || "",
      description: medicine.description || "",
      image: medicine.image || ""
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
      "Are you sure you want to delete this medicine? Its inventory records will also be deleted."
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/medicines/${id}`, {
        method: "DELETE",
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete medicine.");
      }

      setMessage("Medicine deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await fetchMedicines();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-subtitle">ADMIN PANEL</p>
          <h1>Manage Medicines</h1>
          <p>Add, update and manage the medicine dataset.</p>
        </div>

        <span className="admin-count">
          {medicines.length} Medicines
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
          {editingId ? "Edit Medicine" : "Add New Medicine"}
        </h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Medicine Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter medicine name"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Category *</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Pain Relief"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Manufacturer</label>
              <input
                type="text"
                name="manufacturer"
                value={form.manufacturer}
                onChange={handleChange}
                placeholder="Enter manufacturer"
              />
            </div>

            <div className="admin-form-group">
              <label>Image URL</label>
              <input
                type="url"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="Enter image URL"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter medicine description"
              rows="4"
            />
          </div>

          <div className="admin-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Medicine"
                  : "Add Medicine"}
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
        <h2>Medicine Dataset</h2>

        {loading ? (
          <p>Loading medicines...</p>
        ) : medicines.length === 0 ? (
          <p>No medicines found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Manufacturer</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {medicines.map((medicine) => (
                  <tr key={medicine._id}>
                    <td>{medicine.name}</td>
                    <td>{medicine.category}</td>
                    <td>
                      {medicine.manufacturer || "Not specified"}
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          onClick={() => handleEdit(medicine)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => handleDelete(medicine._id)}
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

export default AdminMedicines;
