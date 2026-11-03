import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Clock3, CircleCheck, ChefHat, BellRing, BadgeCheck , Circle} from "lucide-react";

function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const statuses = [
    {key: "pending", label: "Pending", icon: <Clock3 size={20}/>},
    {key: "confirmed", label: "Confirmed", icon: <CircleCheck size={20}/>},
    {key: "preparing", label: "Preparing", icon: <ChefHat size={20}/>},
    {key: "ready", label: "Ready", icon: <BellRing size={20}/>},
    {key: "served", label: "Served", icon: <BadgeCheck size={20}/>},
  ];
 

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/orders/${id}`,
        );
        setOrder(res.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div> {error} </div>;

   const currentIndex = statuses.findIndex(s => s.key === order.status);
  


  return (
    <div>
      <h2>Order #{order._id.slice(-6)}</h2>
      <p>Table {order.tableNumber}</p>
      <div>
        {statuses.map((status,index) => (
          <div key={status.key}>
            <span>{index <= currentIndex ? status.icon : <Circle size={20} color="gray" /> }</span>
            <span>{status.label}</span>
          </div>
        ))}
      </div>
    </div>
    
  );
}

export default OrderTracking;
