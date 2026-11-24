import { useEffect, useState } from "react";
import api from "../../utils/api.js";


function CategoriesTab() {
const [categories, setCategories] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [busy, setBusy] = useState(false);

const [name, setName] = useState("");
const [description, setDescription] = useState("");
const [image, setImage] = useState(null);
const [editingId, setEditingId] = useState(null);
const [fileKey, setFileKey] = useState(0);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setImage(null);
    setEditingId(null);
    setFileKey((k) => k + 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Category is required");
      return;
    }
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description);
    if (image) formData.append("image", image);

    setBusy(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
      } else {
        await api.post("/categories", formData);
      }
      resetForm();
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || "");
    setImage(null);
    setFileKey((K) => K + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toggleActive = async (cat) => {
    try {
      await api.put(`/categories/${cat._id}`, { isActive: !cat.isActive });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const remove = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"?`)) return;
    try {
      await api.delete(`/categories/${cat._id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };
  if (loading) return <p className="text-gray-400">Loading...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="rounded-lg p-4 mb-6 spacy-y-3 max-w-md"
        style={{ backgroundColor: "#16213E" }}
      >
        <h2 className="font-bold">{editingId ? "Edit" : "Add category"}</h2>

        <input
          type="text"
          placeholder="category name (eg : starters) "
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white outline-none"
        />

        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white outline-none"
        />

        <input
          key={fileKey}
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0] || null)}
          className="w-full text-sm text-gray-300"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded font-semibold disabled:opacity-60"
            style={{ backgroundColor: "#FF6B35" }}
          >
            {busy ? "please wait..." : editingId ? "update" : "Add category"}
          </button>
          {editingId && (
            <button
              type="{resetform}"
              className="px-4 py-2 rounded border border-white/20"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {categories.length === 0 ? (
        <p className="text-gray-400">
          No categories yet. Add your first one above.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="rounded-lg p-4"
              style={{ backgroundColor: " #16213E" }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{cat.name}</h3>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: cat.isActive ? "#16A34A" : "#6B7280",
                  }}
                >
                  {cat.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="mt-3 h-28 w-full object cover rounded"
                />
              ) : (
                <div className="mt-3 h-28 flex items-center justify-center rounded bg-black/20 text-xs text-gray-400">
                  No image
                </div>
              )}
              <p className="mt-2 text-sm text-gray-400">
                {cat.description || "No description"}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <button
                  onClick={() => startEdit(cat)}
                  className="py-2 rounded border border-white/20"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(cat)}
                  className="py-2 rounded border border-white/20"
                >
                  {cat.isActive ? "Hide" : "show"}
                </button>
                <button
                  onClick={() => remove(cat)}
                  className="py-2 rounded border border-red-400 text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default CategoriesTab;