import { BrowserRouter , Routes , Route} from "react-router-dom";
import Login from "./pages/admin/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Menu from "./pages/customer/Menu.jsx";
import Cart from "./pages/customer/Cart.jsx";
import OrderTracking from"./pages/customer/OrderTracking.jsx";
import KitchenDashBoard from "./pages/kitchen/KitchenDashBoard.jsx";

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<h1 className="text-black"> Home</h1>}/>
      <Route path="/login" element={<Login />} />
      <Route path="/menu" element={<Menu />}/>
      <Route path="/cart" element={<Cart />}/>
      <Route path="/order/:id" element={<OrderTracking/>}/>
      <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
      <Route path="/Kitchen" element={<ProtectedRoute><KitchenDashBoard /></ProtectedRoute>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App;