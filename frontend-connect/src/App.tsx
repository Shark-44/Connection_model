import { Route, Routes } from "react-router-dom";
import './App.css'
import Home from "./pages/Home";
import Forget from "./pages/ForgotPassword";
import Reset from "./pages/ResetPassword"

function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Reset" element={<Reset />} />
        <Route path="/Forget" element={<Forget />} />
      </Routes>
    </>
  )
}

export default App
