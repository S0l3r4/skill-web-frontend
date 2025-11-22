import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './styles/App.css';


import LandingPage from "./pages/landingpage.js";
import Login from "./pages/login.js";
import SignUp from "./pages/signUp.js"; 
import EditFreelancer from "./pages/editFreelancer.js";
import EditCompany from "./pages/editCompany.js";
import UserProfile from "./pages/profile.js";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<SignUp />} />
        <Route path="/editar" element={<EditFreelancer />} />
        <Route path="/editarEmpresa" element={<EditCompany />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
