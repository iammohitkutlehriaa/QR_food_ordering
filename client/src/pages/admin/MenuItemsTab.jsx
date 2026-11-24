import { useEffect, useState } from "react";
import api from "../../utils/api.js";


function MenuItemsTab() {
const [items, setItems] = useState([]);
const [categories, setCategories] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [busy, setBusy] = useState(false);

const [name, setName] = useState("");
const [price, setPrice] = useState("");
const [categoryId, setCategoryId] = useState("");
const [description, setDescription] = useState("");
const [isVeg, setIsVeg] = useState(true);
const [image, setImage] = useState(null);
const [editingId, setEditingId] = useState(null);
const [fileKey, setFileKey] = useState(0);


const fetchAll = async () => {
  try {
    const [itemsRes, catRes] = await Promise.all([
      api.get("/menu-items?limit=100"),
      api.get("/categories"),
    ]);
    setItems(itemsRes.data.data || []);
    setCategories(catRes.data.data || []);
    setError("");
  } catch (err) {
    setError(err.response?.data?.message || err.message);
  } finally {
    setLoading(false);
  }
};

    useEffect(() => {
        fetchAll();
    },[]);

    const resetForm = () => {
        setName("");
        setPrice("");
        setCategoryId("");
        setDescription("");
        setIsVeg(true);
        setImage(null);
        setEditingId(null);
        setFileKey((K) => K + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!name.trim() || !price || !categoryId) {
            alert("Name , price and category is required");
            return ;
        } 
        if(Number(price) < 0 || Number.isNaN(Number(price))) {
            alert("Enter a valid price");
            return ;
        }
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("price" , price);
        formData.append("description", description);
        formData.append("isVeg" , String(isVeg));

        if(!editingId) formData.append("categoryId" , categoryId);
        if(image) formData.append("image" , image);

        setBusy(true);
        try{
            if(editingId) {
                await api.put(`/menu-items/${editingId}`, formData);
            } else {
                await api.post("/menu-items", formData);
            }
            resetForm();
            await fetchAll();
        } catch(err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setBusy(false);
        }
    };

    const startEdit = (item) => {
        setEditingId(item._id);
        setName(item.name);
        setPrice(String(item.price));
        setCategoryId(item.categoryId?._id || "");
        setDescription(item.description || "");
        setIsVeg(item.isVeg);
        setImage(null);
        setFileKey((K) => K + 1);
        window.scrollTo({top : 0, behavior: "smooth"}); 
    };

    const toggleAvailable = async (item) => {
        try {
            await api.put(`/menu-items/${item._id}`,{
                isAvailable:String(!item.isAvailable),
            });
            fetchAll();
        } catch(err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const remove = async(item) => {
        if(!window.confirm(`Delete"${item.name}"?`)) return;
        try{
            await api.delete(`/menu-items/${item._id}`);
            fetchAll();
        } catch(err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    if(loading) return <p className="text-gray-400">Loading...</p>
    if(error) return <p className="text-red-400">{error}</p>
    

    return (
        <div>
            <form onSubmit={handleSubmit}
            className="rounded-lg p-4 mb-6 space-y-3 max-w-md"
            style={{backgroundColor: "#16213E"}}>
            
            <h2 className="font-bold">{editingId?"Edit Menu Item" : "Add Menu Item"}</h2>
            {categories.length === 0  && (<p className="text-sm text-yellow-400">Create a Category first (Categories Tab).</p>)}

            <input type="text"
            placeholder="item name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white outline-none"/>

            
            <input type="number"
            min="0"
            placeholder="Price" 
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white outline-none"/>


           <select value={categoryId}
           onChange={(e) =>setCategoryId(e.target.value)}
           disabled={!!editingId}
           className="w-full p-2 rounded bg-gray-800 text-white outline-none disabled:opacity-60">
            <option value="">Select category</option>
            {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
           </select>

           
            <input type="text"
            placeholder="Description (optional)" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white outline-none"/>

            <label className="flex items-center gap-2 text-sm">
                <input
                type="checkbox"
                checked={isVeg}
                onChange={(e) => setIsveg(e.target.checked)} />
                Vegetarian
            </label>

            <input key={fileKey}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0] || null)}
            className="w-full text-sm text-gray-300" />

            <div
            className="flex gap-2">
                <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded rounded font-semibold disabled:opacity-60"
                style={{backgroundColor: "#FF6B35"}}>
                    {busy ? "please wait..." : editingId ? "Update" : "Add Item"}
                </button>

                {editingId && (
                    <button type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded border border-white/20">Cancel</button>
                )}
            </div>
            </form>
            {items.length === 0 ? (
                <p className="text-gray-400">No menu items yet</p>
            ): (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                        <div 
                        key={item._id}
                        className="rounded-lg p-4"
                        style={{backgroundColor: "#16213E"}}>
                            {item.image ?(
                                <img src={item.image} alt="item.name"
                                className="h-32 w-full object-cover rounded" />
                            ): (
                                <div
                                className="h-32 flex items-center justify-center rounded bg-black/20 text-xs text-gray-400">
                                    No image
                                </div>
                            )}
                            <div className="mt-3 flex items-start justify-between gap-2">
                                <h3 className="font-bold">{item.name}</h3>
                                <span style={{color: "#FF6B35"}} className="font-bold">{"\u20B9"} {item.price}</span>
                            </div>
                            <p className="text-xs text-gray-400">
                                {item.categoryId?.name || " category"} . {""}
                                {item.isVeg ? "Veg" : "Non-veg"} . {""}
                                {item.isAvailable ? "Available" : "Unavailable"} 
                            </p>
                            <p className="mt-1 text-sm text-gray-400">
                                {item.description || "No description"}
                            </p>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                                <button 
                                onClick={() => startEdit(item)}
                                className="py-2 rounded border border-white/20">Edit</button>
 
                                <button 
                                onClick={() => toggleAvailable(item)}
                                className="py-2 rounded border border-white/20">
                                    {item.isAvailable ? "Hide" : "Show"}
                                </button>
                                <button
                                onClick={() => remove(item)}
                                className="py-2 rounded border border-red-400 text-red-400">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MenuItemsTab;