import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Clock3,
  CircleCheck,
  ChefHat,
  BellRing,
  BadgeCheck,
  Circle,
} from "lucide-react";

const API = "http://localhost:8000/api/v1";

const statuses = [
  { key: "pending", label: "Pending", icon: <Clock3 size={20} /> },
  { key: "confirmed", label: "Confirmed", icon: <CircleCheck size={20} /> },
  { key: "preparing", label: "Preparing", icon: <ChefHat size={20} /> },
  { key: "ready", label: "Ready", icon: <BellRing size={20} /> },
  { key: "served", label: "Served", icon: <BadgeCheck size={20} /> },
];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/orders/${id}`);
      setOrder(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const payNow = async () => {
    setPaying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Could not load the payment window. Check your internet.");
        return;
      }
      const res = await axios.post(`${API}/payments/create`, {
        orderId: order._id,
      });
      const { razorpayOrderId, amount, currency, key } = res.data.data;

      const options = {
        key,
        amount,
        currency,
        name: "QR Food Ordering",
        description: `Order #${order._id.slice(-6)}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await axios.post(`${API}/payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });
            await fetchOrder();
          } catch (err) {
            alert(err.response?.data?.message || err.message);
          }
        },
        prefill: { name: order.customerName || "" },
        theme: { color: "#FF6B35" },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        alert(resp.error?.description || "Payment failed");
      });
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="p-4 text-white">Loading...</div>;
  if (error) return <div className="p-4 text-red-400">{error}</div>;

  const currentIndex = statuses.findIndex((s) => s.key === order.status);
  const isPaid = order.paymentStatus === "paid";

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

      <div className="mt-8 rounded-lg p-4 max-w-sm" style={{ backgroundColor: "#16213E" }}>
        <ul className="space-y-1 text-sm">
          {order.items.map((item, i) => (
            <li key={i}>
              {item.menuItemId?.name || item.name} x {item.quantity}
            </li>
          ))}
        </ul>
        <p className="mt-3 font-bold" style={{ color: "#FF6B35" }}>
          Total: {"\u20B9"}
          {order.totalAmount}
        </p>
        <p
          className="mt-1 text-sm font-semibold"
          style={{ color: isPaid ? "#16A34A" : "#EAB308" }}
        >
          {isPaid ? "Payment: Paid" : "Payment: Unpaid"}
        </p>

        {!isPaid && order.status !== "cancelled" && (
          <button
            onClick={payNow}
            disabled={paying}
            className="mt-4 w-full py-2 rounded font-semibold disabled:opacity-60"
            style={{ backgroundColor: "#FF6B35" }}
          >
            {paying ? "Please wait..." : "Pay now"}
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderTracking;