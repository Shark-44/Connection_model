import { Route, Routes } from "react-router-dom";
import './App.css'
import Home from "./pages/Home";
import Forget from "./pages/ForgotPassword";
import Reset from "./pages/ResetPassword"
import Verify from "./pages/VerifyOTP";
import Politique from "./pages/PolitiqueConfidentialite";

function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Reset" element={<Reset />} />
        <Route path="/Forget" element={<Forget />} />
        <Route path="/Verify" element={<Verify />} />
        <Route path="/politique-confidentialite" element={<Politique />} />
      </Routes>
    </>
  )
}

export default App
