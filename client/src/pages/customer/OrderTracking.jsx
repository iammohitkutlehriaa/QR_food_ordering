import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Clock3,
  CircleCheck,
  ChefHat,
  BellRing,
  BadgeCheck,
  Circle,
} from "lucide-react";

const statuses = [
  { key: "pending", label: "Pending", icon: <Clock3 size={20} /> },
  { key: "confirmed", label: "Confirmed", icon: <CircleCheck size={20} /> },
  { key: "preparing", label: "Preparing", icon: <ChefHat size={20} /> },
  { key: "ready", label: "Ready", icon: <BellRing size={20} /> },
  { key: "served", label: "Served", icon: <BadgeCheck size={20} /> },
];

function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/v1/orders/${id}`);
        setOrder(res.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="p-4 text-white">Loading...</div>;
  if (error) return <div className="p-4 text-red-400">{error}</div>;

  const currentIndex = statuses.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen p-4 text-white" style={{ backgroundColor: "#1A1A2E" }}>
      <h2 className="text-2xl font-bold">Order #{order._id.slice(-6)}</h2>
      <p className="text-gray-400">Table {order.tableNumber}</p>

      <div className="mt-6 space-y-4">
        {statuses.map((status, index) => (
          <div
            key={status.key}
            className="flex items-center gap-3"
            style={{ color: index <= currentIndex ? "#FF6B35" : "#6B7280" }}
          >
            {index <= currentIndex ? status.icon : <Circle size={20} />}
            <span className="font-semibold">{status.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderTracking;