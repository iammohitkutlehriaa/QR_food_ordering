import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TablesTab from "./TableTab.jsx";
import CategoriesTab from"./CategoriesTab.jsx";
import MenuItemsTab from "./MenuItemsTab.jsx";
import OrdersTab from "./OrdersTab.jsx";

const TABS = [
  { key: "tables", label: "Tables & QR" },
  { key: "categories", label: "Categories" },
  { key: "menu", label: "Menu Items" },
  { key: "orders", label: "Orders" },
];

function Dashboard() {
  const [activeTab, setActiveTab] = useState("tables");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#1A1A2E" }}>
      <header
        className="flex items-center justify-between px-4 py-3 border-b border-white/10"
        style={{ backgroundColor: "#16213E" }}
      >
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="px-3 py-1 rounded text-sm border border-white/20"
        >
          Logout
        </button>
      </header>

      <nav className="flex gap-2 overflow-x-auto px-4 py-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold"
            style={{
              backgroundColor: activeTab === tab.key ? "#FF6B35" : "#16213E",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="px-4 pb-8">
        {activeTab === "tables" && <TablesTab />}
        {activeTab === "categories" && <CategoriesTab/>}
        {activeTab === "menu" && <MenuItemsTab/>}
        {activeTab === "orders" && <OrdersTab />}
      </main>
    </div>
  );
}

export default Dashboard;