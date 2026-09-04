import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {ShoppingCart, Leaf , Drumstick, Plus, Trash2} from "lucide-react";


function Menu() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate()
  const qrToken = searchParams.get("token");
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectCategory, setSelectCategory] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cartItems, setCartItems] = useState(JSON.parse(localStorage.getItem("cart")|| "[]"));
  const [search , setSearch] = useState("");

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const tableRes = await axios.get(
          `http://localhost:8000/api/v1/tables/verify/${qrToken}`,
        );
        setTableData(tableRes.data.data);
        localStorage.setItem("tableId", tableRes.data.data.table._id)
        const restaurantId = tableRes.data.data.restaurant._id;
        const catRes = await axios.get(
          `http://localhost:8000/api/v1/categories/public/${restaurantId}`,
        );
        setCategories(catRes.data.data);
        setSelectCategory(catRes.data.data[0]?._id.toString());
        console.log(catRes.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTable();
  }, [qrToken]);

  useEffect(() => {
    if (!selectCategory || !tableData) return;
    const fetchMenuItems = async () => {
      try {
        const restaurantId = tableData.restaurant._id;
        const menuRes = await axios.get(
          `http://localhost:8000/api/v1/menu-items/public/${restaurantId}?categoryId=${selectCategory}`,
        );
        setMenuItems(menuRes.data.data);
        console.log(menuRes.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    };
    fetchMenuItems();
  }, [selectCategory, tableData]);

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (cartItem) => cartItem._id === item._id,
      );
      let updated;
      if (existingItem) {
         updated = prevItems.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      } else {
        updated = [...prevItems, {...item, quantity: 1}];

      }
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const filteredItem = menuItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#1A1A2E" }}>
      <div className="mx-auto min-h-screen w-full max-w-md pb-24 text-white">
        <header
          className="sticky top-0 z-10 border-b border-white/10 px-4 py-4 backdrop-blur"
          style={{ backgroundColor: "#1A1A2E" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                QR Food Order
              </p>
              <h1 className="mt-1 text-2xl font-bold leading-tight">
                {tableData.restaurant.name}
              </h1>
            </div>

            <div
              className="rounded-2xl border border-white/10 px-3 py-2 text-center"
              style={{ backgroundColor: "#16213E" }}
            >
              <p className="text-[10px] font-semibold uppercase text-white/50">
                Table
              </p>
              <p className="text-lg font-bold" style={{ color: "#FF6B35" }}>
                {tableData.table.tableNumber}
              </p>
            </div>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto px-4 py-4">
          {categories.map((cat) => {
            const isActive = selectCategory === cat._id.toString();

            return (
              <button
                key={cat._id}
                onClick={() => setSelectCategory(cat._id.toString())}
                className="shrink-0 rounded-full border px-4 py-2 text-sm font-semibold text-white"
                style={{
                  backgroundColor: isActive ? "#FF6B35" : "#16213E",
                  borderColor: isActive ? "#FF6B35" : "rgba(255,255,255,0.12)",
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="px-4 pb-2">
          <input type="text" 
          placeholder="Search dishes...."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full px-4  py-2 text-sm text-white outline-none border border-white/10"
          style={{backgroundColor: "#16213E"}}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 px-4">
          {filteredItem.map((item) => (
            <div
              key={item._id}
              className="overflow-hidden rounded-2xl border border-white/10 p-3 shadow-lg"
              style={{ backgroundColor: "#16213E" }}
            >
              <div className="relative h-32 overflow-hidden rounded-xl bg-black/10">
                <span
                  className={`absolute left-2 top-2 h-4 w-4 rounded-md border text-[10px] ${
                    item.isVeg
                      ?  <Leaf size={12} className="text-green-400" />
                      : <Drumstick size={12} className="border-red-400 text-red-400" />
                  }`}
                >
            
                </span>

                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-3 text-center text-xs text-gray-400">
                    No image available
                  </div>
                )}
              </div>

              <h3 className="mt-3 line-clamp-1 text-sm font-bold">
                {item.name}
              </h3>

              <p className="mt-1 line-clamp-2 min-h-8 text-xs text-gray-400">
                {item.description || "No Description"}
              </p>

              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="font-bold" style={{ color: "#FF6B35" }}>
                  {"\u20B9"}
                  {item.price}
                </p>

                <button
                  onClick={() => addToCart(item)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xl font-semibold text-white"
                  style={{ backgroundColor: "#FF6B35" }}
                  aria-label={`Add ${item.name} to cart`}
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {cartCount > 0 && (
          <button
          onClick={() => navigate("/cart")}
            className="fixed bottom-5 left-1/2 z-20 flex w-[calc(100%-32px)] max-w-sm -translate-x-1/2 items-center justify-between rounded-full px-5 py-3 font-bold text-white shadow-2xl"
            style={{ backgroundColor: "#FF6B35" }}
          >
            <span>{cartCount} item{cartCount > 1 ? "s" : ""}</span>
            <span>View cart</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default Menu;
