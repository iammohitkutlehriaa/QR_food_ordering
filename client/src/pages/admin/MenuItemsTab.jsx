import { isValidElement, useEffect, useState } from "react";
import api from "../../utils/api.js";


function MenuItemsTab() {
    const [items ,setItems] = useState([]);
    const [categories , setCategories] = useState();
    const [loading , setLoading] = useState([]);
    const [error , setError] =useState("");
    const [busy ,  setBusy] = useState(false);
    
    
    const [name , setName] = useState("");
    const [price , setPrice] = useState("");
    const [categoryId , setCategoryId] = useState("");
    cosnt [description , setDescription] = useState("");
    const [isVeg , setIsveg] = useState(true);
    const [image , setImage] = useState(null);
    const [editingId , setEditingId] = useState(null);
    const [fileKey , setFileKey] = useState(0);


    const fetchAll = async() => {
        try{
            const [itemsRes, catRes] = await Promise.all([
                api.get("/menu-items?limit=100"),
                api.get("/categories"),
            ]);
            setItems(itemsRes.data.data);
            setItems(catRes.data.data);
            setError("");
        } catch(err) {
            setError(err.respone?.data?.message || err.message);
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
        setIsveg(true);
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
        formData.apend("price" , price);
        formData.apend("description", description);
        formData.apend("isVeg" , String(isVeg));

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
        setIsveg(item.isVeg);
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
}