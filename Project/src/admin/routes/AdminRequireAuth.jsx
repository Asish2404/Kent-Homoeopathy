import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const AdminRequireAuth = () => {
  const location = useLocation();

  const role = window.localStorage.getItem("role");
  const authed = role === "admin";

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AdminRequireAuth;


