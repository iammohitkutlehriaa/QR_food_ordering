import { BrowserRouter , Routes , Route} from "react-router-dom";
import Login from "./pages/admin/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function app() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<h1 className="text-black"> Home</h1>}/>
      <Route path="/login" element={<Login />} />
      <Route path="/menu" element={<h1 className="text-white"> Home</h1>}/>
      <Route path="/admin" element={<ProtectedRoute><h1>Admin</h1></ProtectedRoute>}/>
      <Route path="/Kitchen" element={<h1 className="text-white">Kitchen </h1>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default app;