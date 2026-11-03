import { useEffect, useState } from "react";
import axios from "axios";

const NEXT_STATUS = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
};

function KitchenDashBoard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/orders/kitchen", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const advanceStatus = async (id, currentStatus) => {
    try {
      await axios.put(
        `http://localhost:8000/api/v1/orders/${id}`,
        { status: NEXT_STATUS[currentStatus] },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-4 text-white">Loading...</div>;
  if (error) return <div className="p-4 text-red-400">{error}</div>;

  return (
    <div className="min-h-screen p-4 text-white" style={{ backgroundColor: "#1A1A2E" }}>
      <h1 className="text-2xl font-bold mb-4">Kitchen Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-400">No active orders</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-lg p-4"
              style={{ backgroundColor: "#16213E" }}
            >
              <div className="flex justify-between items-center">
                <h2 className="font-bold">Table {order.tableNumber}</h2>
                <span
                  className="text-xs px-2 py-1 rounded uppercase"
                  style={{ backgroundColor: "#FF6B35" }}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{order.customerName}</p>

              <ul className="mt-3 space-y-1">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.menuItemId?.name} x {item.quantity}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => advanceStatus(order._id, order.status)}
                className="mt-4 w-full py-2 rounded font-semibold"
                style={{ backgroundColor: "#FF6B35" }}
              >
                Mark as {NEXT_STATUS[order.status]}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KitchenDashBoard;