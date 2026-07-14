import Dashboard from "../pages/Dashboard";
import AdminLogin from "../pages/AdminLogin";
import AdminLayout from "../layout/AdminLayout";
import AdminRequireAuth from "./AdminRequireAuth";

import Products from "../pages/Products";
import Orders from "../pages/Orders";
import Customers from "../pages/Customers";
import Inventory from "../pages/Inventory";
import Analytics from "../pages/Analytics";
import Reports from "../pages/Reports";
import Categories from "../pages/Categories";
import Coupons from "../pages/Coupons";
import Reviews from "../pages/Reviews";
import Settings from "../pages/Settings";

const adminRoutes = [
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: <AdminRequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "products", element: <Products /> },
          { path: "orders", element: <Orders /> },
          { path: "customers", element: <Customers /> },
          { path: "inventory", element: <Inventory /> },
          { path: "analytics", element: <Analytics /> },
          { path: "reports", element: <Reports /> },
          { path: "categories", element: <Categories /> },
          { path: "coupons", element: <Coupons /> },
          { path: "reviews", element: <Reviews /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
];

export default adminRoutes;

