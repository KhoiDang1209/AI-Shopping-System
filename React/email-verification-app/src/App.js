import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Register";
import VerifyEmail from "./VerifyEmail";
import HomePage from "./Homepage";
import LoginPage from "./Login"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/Homepage" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
