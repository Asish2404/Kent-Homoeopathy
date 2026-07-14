import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { adminStorage } from "../utils/storage";

const AdminRequireAuth = () => {
  const location = useLocation();
  const authed = adminStorage.isAdmin();

  if (!authed) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AdminRequireAuth;

