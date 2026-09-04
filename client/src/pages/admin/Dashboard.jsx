import axios from "axios";
import { useEffect, useState } from "react";

function Dashboard() {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/api/v1/menu-items", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMenuItems(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchMenuItems();
  }, []);

  return (
    <div className="bg-[#1A1A2E] min-h-screen p-8">
      {menuItems.map((item) => (
        <div key={item._id} className="text-white">
          <div>{item.name}</div>
          <div>{item.price}</div>
        </div>
      ))}
    </div>
  );
}


export default Dashboard;