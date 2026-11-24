import { useEffect, useState } from "react";
import api from "../../utils/api.js";

function TableTab() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const[error, setError] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchTables = async () => {
    try {
      const res = await api.get("/tables");
      setTables(res.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const addTable = async (e) => {
    e.preventDefault();
    if (!tableNumber || Number(tableNumber) < 1) {
      alert("Enter a valid table Number ");
      return;
    }
    setBusy(true);
    try {
      await api.post("/tables", { tableNumber: Number(tableNumber) });
      setTableNumber("");
      await fetchTables();
      await fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (table) => {
    try {
      await api.patch(`/tables/${table._id}`, { isActive: !table.isActive });
      fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const regenerate = async (table) => {
    if (
      !window.confirm(
        `Regenerate QR for Table ${table.tableNumber}? The old QR will stop working.`,
      )
    )
      return;
    setBusy(true);
    try {
      await api.post(`/tables/${table._id}/regenerate-qr`);
      await fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (table) => {
    if (
      !window.confirm(
        `Delete Table ${table.tableNumber}? This cannot be undone.`,
      )
    )
      return;
    try {
      await api.delete(`/tables/${table._id}`);
      fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };
  if (loading) return <p className="text-gray-400">Loading...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  const sorted = [...tables].sort((a, b) => a.tableNumber - b.tableNumber);

  return (
    <div>
      <form onSubmit={addTable} className="flex gap-2 mb-6">
        <input
          type="number"
          min="1"
          placeholder="Table Number"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="w-40 p-2 rounded bg-gray-800 text-white outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 rounded font-semibold disabled:opacity-60"
          style={{ backgroundColor: "#FF6B35" }}
        >
          {busy ? "please wait..." : "Add Table"}
        </button>
      </form>

      {sorted.length === 0 ? (
        <p className="text-gray-400">
          No tables yet. Add your first table above.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((table) => (
            <div
              key={table._id}
              className="rounded-lg p-4"
              style={{ backgroundColor: "#16213E" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Table{table.tableNumber}</h2>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: table.isActive ? "#16A34A" : "#6B7280",
                  }}
                >
                  {table.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {table.qrCode ? (
                <img
                  src={table.qrCode}
                  alt={`QR for table ${table.tableNumber}`}
                  className="mt-3 w-40 h-40 bg-white p-2 rounded mx-auto"
                />
              ) : (
                <p className="mt-3 text-sm text-gray-400">No QR yet</p>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <button
                  onClick={() => toggleActive(table)}
                  className="py-2 rounded border border-white/20"
                >
                  {table.isActive ? "Deactivate" : "Activate"}
                </button>
                <a
                  href={table.qrCode}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 rounded border border-white/20 text-center"
                >
                  Open QR
                </a>
                <button
                  onClick={() => regenerate(table)}
                  disabled={busy}
                  className="py-2 rounded border border-white/20 disabled:opacity-60"
                >
                  Regenerate QR
                </button>
                <button
                  onClick={() => remove(table)}
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

export default TableTab;
