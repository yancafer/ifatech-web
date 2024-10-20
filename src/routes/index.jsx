import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";

import Private from "./Private";
import CheckQRCode from "../pages/Dashboards/checkQRCode";
import FilesStudents from "../pages/Dashboards/filesStudents";
import RegisterStudents from "../pages/Dashboards/registerStudents";
import Report from "../pages/Dashboards/report";
import ConfigsAdmin from "../pages/Dashboards/configsAdmin";

function RoutesApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/checkqrcode" element={<Private> <CheckQRCode/> </Private>} />
        <Route path="/filesstudents" element={<Private> <FilesStudents/> </Private>} />
        <Route path="/registerstudets" element={<Private> <RegisterStudents/> </Private>} />
        <Route path="/reports" element={<Private> <Report/> </Private>} />
        <Route path="/configsadmin" element={<Private> <ConfigsAdmin/> </Private>} />

      </Routes>
    </Router>
  );
}

export default RoutesApp;
