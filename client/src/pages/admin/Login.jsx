import { useState } from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom"


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();    
  
  const handleLogin = async() => {
    try {
        const res = await axios.post("http://localhost:8000/api/v1/auth/login", {
            email,
            password
        });
        localStorage.setItem("token", res.data.data.token)
        navigate("/admin")
        console.log(res.data)
    }
    catch(err) {
        console.log(err)
    }
}
  return (
    <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center">
      <div className="bg-[#16213E] p-8 rounded-lg w-96">
        <input
          type="email"
          className="w-full p-2 rounded bg-gray-800 text-white"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-2 rounded bg-gray-800 text-white"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default Login;
