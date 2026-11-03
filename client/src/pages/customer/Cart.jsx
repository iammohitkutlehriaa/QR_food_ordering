  import { useState } from "react";
  import axios from "axios";
  import {Plus, Trash2} from "lucide-react";
  import {useNavigate} from "react-router-dom";

  function Cart() {
      const [customerName, setCustomerName] = useState("");
    const tableId = localStorage.getItem("tableId");
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState(
      JSON.parse(localStorage.getItem("cart") || "[]"),
    );
    const [isPlacingOrder , setIsPlacingOrder] = useState(false);


    const total = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    const updateQuantity = (id, change) => {
    const newCart = cartItems.map(item => {
      if(item._id !== id) return item;
      const newQuantity = item.quantity+ change;
      if(newQuantity < 1) return null;
      return { ...item , quantity: newQuantity} 
    }).filter(item => item !== null);

    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart))
  };

 const placeOrder = async() => {
  if(cartItems.length === 0 ) {
    alert("Your cart is empty");
    return;
  }
  if(!customerName.trim()) {
    alert("Please enter your name");
    return;
  }
  if(!tableId) {
    alert("Table not found . Please scan the QR code again");
    return;
  }
  setIsPlacingOrder(true);
  try{
    const items = cartItems.map(item =>({
      menuItemId : item._id,
      quantity: item.quantity,
      price: Number(item.price)
    }));
    const res  = await axios.post(`http://localhost:8000/api/v1/orders`,{
      tableId,
      customerName,
      items,
      totalAmount : total
    });
    localStorage.removeItem("cart");
    setCartItems([]);
    navigate(`/order/${res.data.data._id}`);
  } catch(err) {
    console.log(err);
    alert("order failed : " + err.response?.data?.message || err.message);
  }
  finally {
    setIsPlacingOrder(false);
  }
 };

  
    return (
      <div
        className="min-h-screen p-4 text-white"
        style={{ backgroundColor: "#1A1A2E" }}
      >
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <div>
          {cartItems.length === 0 ? (
            <p className="text-gray-400 mt-4">Your Cart is Empty</p>
          ) : (
            <div className="mt-4 space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="rounded-lg p-3"
                  style={{ backgroundColor: "#16213E" }}
                >
                  <h3 className="font-semibold">{item.name}</h3>
                  <p style={{ color: "#FF6B35" }}>
                    {"\u20B9"}
                    {item.price} * {item.quantity}
                  </p>
                  <div className="flex items-center gap-2 mt-2 ">
                      <button onClick={() => updateQuantity(item._id, -1)}>
                          -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, +1) }>
                          +
                      </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <h2 className="text-x1 font-bold mt-4">
            Total Amount : {"\u20B9"} {total}
          </h2>
        </div>
        <input type="text"
        placeholder="Your name"
        value={customerName}
      onChange={(e) => setCustomerName(e.target.value)}
        />
        <button onClick={placeOrder} disabled={isPlacingOrder}>{isPlacingOrder ? "Placing..." :"place Order" }</button>
      </div>
    );
  }  

  export default Cart;
