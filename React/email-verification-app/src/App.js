import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Register";
import VerifyEmail from "./VerifyEmail";
import HomePage from "./Homepage";
import LoginPage from "./Login"
import ForgetPassword from "./ForgetPassword"
import ChangePassword from "./ChangePassword";
import FPVerifyEmail from "./FPVerifyEmail";
import LoginVerifyEmail from "./LoginVerifyEmail";
import Update from "./Update";
import UpdateVerifyEmail from "./UpdateVerifyEmail";

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
        <Route path="/LoginVerifyEmail" element={<LoginVerifyEmail />} />
        <Route path="/Update" element={<Update />} />
        <Route path="/UpdateVerifyEmail" element={<UpdateVerifyEmail />} />

      </Routes>
    </Router>
  );
}

export default App;
