import { useEffect, useState } from "react";
import api from "../../utils/api.js";

const FILTERS = ["all", "pending", "confirmed", "preparing", "ready", "served"];

const STATUS_COLORS = {
  pending: "#EAB308",
  confirmed: "#3B82F6",
  preparing: "#FF6B35",
  ready: "#16A34A",
  served: "#6B7280",
};

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const statusQuery = statusFilter === "all" ? "" : `&status=${statusFilter}`;
        const res = await api.get(`/orders?page=${page}&limit=10${statusQuery}`);
        const data = res.data.data;
        const list  = Array.isArray(data) ? data  : data.orders || [];
        setOrders(list);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total ?? list.length);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [page, statusFilter]);

  const changeFilter = (f) => {
    setStatusFilter(f);
    setPage(1);
    setLoading(true);
  };

  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-3">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => changeFilter(f)}
            className="shrink-0 rounded-full px-3 py-1 text-sm capitalize"
            style={{ backgroundColor: statusFilter === f ? "#FF6B35" : "#16213E" }}
          >
            {f}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-400 mb-3">
        {total} order{total === 1 ? "" : "s"} (auto-refreshes every 10 seconds)
      </p>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400">No orders found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-lg p-4"
              style={{ backgroundColor: "#16213E" }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold">#{order._id.slice(-6)}</h3>
                <span
                  className="text-xs px-2 py-1 rounded uppercase"
                  style={{ backgroundColor: STATUS_COLORS[order.status] || "#6B7280" }}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Table {order.tableNumber} • {order.customerName || "Guest"}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleString()}
              </p>

              <ul className="mt-3 space-y-1 text-sm">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.menuItemId?.name || item.name || "Item"} x {item.quantity}
                  </li>
                ))}
              </ul>

              <p className="mt-3 font-bold" style={{ color: "#FF6B35" }}>
                Total: {"\u20B9"}
                {order.totalAmount}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={page <= 1}
          className="px-4 py-2 rounded border border-white/20 disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages}
          className="px-4 py-2 rounded border border-white/20 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default OrdersTab;