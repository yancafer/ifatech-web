import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";

import Private from "./Private";
import AdminDashboard from "../pages/Dashboards/AdminDashboard";
import CheckQRCode from "../pages/Dashboards/checkQRCode";
import FilesStudents from "../pages/Dashboards/filesStudents";
import RegisterStudents from "../pages/Dashboards/registerStudents";
import Report from "../pages/Dashboards/report";

function RoutesApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />


        <Route path="/admindashboard" element={<Private> <AdminDashboard/> </Private>} />
        <Route path="/checkqrcode" element={<Private> <CheckQRCode/> </Private>} />
        <Route path="/filesstudents" element={<Private> <FilesStudents/> </Private>} />
        <Route path="/registerstudets" element={<Private> <RegisterStudents/> </Private>} />
        <Route path="/reports" element={<Private> <Report/> </Private>} />


      </Routes>
    </Router>
  );
}

export default RoutesApp;
