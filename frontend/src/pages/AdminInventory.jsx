
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/admin";

const emptyForm = {
  medicineId: "",
  pharmacyId: "",
  price: "",
  quantity: ""
};

const AdminInventory = () => {
  const { token } = useAuth();

  const [inventory, setInventory] = useState([]);
  const [medicines, setMedicines] = useState([]);
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

  // Fetch all inventory, medicines and pharmacies
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [inventoryResponse, medicineResponse, pharmacyResponse] =
        await Promise.all([
          fetch(`${API_URL}/inventory`, { headers }),
          fetch(`${API_URL}/medicines`, { headers }),
          fetch(`${API_URL}/pharmacies`, { headers })
        ]);

      const inventoryData = await inventoryResponse.json();
      const medicineData = await medicineResponse.json();
      const pharmacyData = await pharmacyResponse.json();

      if (
        !inventoryResponse.ok ||
        !medicineResponse.ok ||
        !pharmacyResponse.ok
      ) {
        throw new Error("Unable to load inventory data.");
      }

      setInventory(inventoryData.inventory);
      setMedicines(medicineData.medicines);
      setPharmacies(pharmacyData.pharmacies);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
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

  // Add or update inventory
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = editingId
        ? {
            price: Number(form.price),
            quantity: Number(form.quantity)
          }
        : {
            medicineId: form.medicineId,
            pharmacyId: form.pharmacyId,
            price: Number(form.price),
            quantity: Number(form.quantity)
          };

      const url = editingId
        ? `${API_URL}/inventory/${editingId}`
        : `${API_URL}/inventory`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save inventory.");
      }

      setMessage(
        editingId
          ? "Inventory updated successfully."
          : "Inventory added successfully."
      );

      resetForm();
      await fetchData();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Load inventory record into form
  const handleEdit = (item) => {
    setEditingId(item._id);

    setForm({
      medicineId: item.medicineId?._id || "",
      pharmacyId: item.pharmacyId?._id || "",
      price: item.price ?? "",
      quantity: item.quantity ?? ""
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Delete inventory record
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inventory record?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/inventory/${id}`, {
        method: "DELETE",
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete inventory.");
      }

      setMessage("Inventory record deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await fetchData();

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-page">

      <div className="admin-page-header">
        <div>
          <p className="admin-subtitle">ADMIN PANEL</p>
          <h1>Manage Inventory</h1>
          <p>Control medicine prices and availability across pharmacies.</p>
        </div>

        <span className="admin-count">
          {inventory.length} Records
        </span>
      </div>

      {message && (
        <div className="admin-success">{message}</div>
      )}

      {error && (
        <div className="admin-error">{error}</div>
      )}

      {/* Inventory Form */}
      <section className="admin-form-section">
        <h2>
          {editingId ? "Update Inventory" : "Add Inventory Record"}
        </h2>

        <form onSubmit={handleSubmit} className="admin-form">

          <div className="admin-form-grid">

            <div className="admin-form-group">
              <label>Medicine *</label>

              <select
                name="medicineId"
                value={form.medicineId}
                onChange={handleChange}
                required
                disabled={Boolean(editingId)}
              >
                <option value="">Select Medicine</option>

                {medicines.map((medicine) => (
                  <option key={medicine._id} value={medicine._id}>
                    {medicine.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label>Pharmacy *</label>

              <select
                name="pharmacyId"
                value={form.pharmacyId}
                onChange={handleChange}
                required
                disabled={Boolean(editingId)}
              >
                <option value="">Select Pharmacy</option>

                {pharmacies.map((pharmacy) => (
                  <option key={pharmacy._id} value={pharmacy._id}>
                    {pharmacy.name} - {pharmacy.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label>Price (₹) *</label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Available Quantity *</label>

              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                min="0"
                step="1"
                required
              />
            </div>

          </div>

          <div className="admin-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Inventory"
                  : "Add Inventory"}
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

      {/* Inventory Table */}
      <section className="admin-table-section">
        <h2>Inventory Dataset</h2>

        {loading ? (
          <p>Loading inventory...</p>
        ) : inventory.length === 0 ? (
          <p>No inventory records found.</p>
        ) : (

          <div className="admin-table-wrapper">
            <table className="admin-table">

              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Pharmacy</th>
                  <th>City</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {inventory.map((item) => (
                  <tr key={item._id}>

                    <td>
                      {item.medicineId?.name || "Medicine unavailable"}
                    </td>

                    <td>
                      {item.pharmacyId?.name || "Pharmacy unavailable"}
                    </td>

                    <td>
                      {item.pharmacyId?.city || "-"}
                    </td>

                    <td>
                      ₹{Number(item.price).toFixed(2)}
                    </td>

                    <td>
                      {item.quantity}
                    </td>

                    <td>
                      <div className="admin-table-actions">

                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => handleDelete(item._id)}
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

export default AdminInventory;
