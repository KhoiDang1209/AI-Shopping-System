import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Register";
import VerifyEmail from "./VerifyEmail";
import HomePage from "./Homepage";
import LoginPage from "./Login"
import ForgetPassword from "./ForgetPassword"
import ChangePassword from "./ChangePassword";
import FPVerifyEmail from "./FPVerifyEmail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/Homepage" element={<HomePage />} />
        <Route path="/ForgetPassword" element={<ForgetPassword />} />
        <Route path="/FPverify" element={<FPVerifyEmail />} />
        <Route path="/ChangePassword" element={<ChangePassword />} />

      </Routes>
    </Router>
  );
}

export default App;
