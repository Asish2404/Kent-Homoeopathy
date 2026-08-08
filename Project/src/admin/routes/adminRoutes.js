

import Dashboard from "../pages/Dashboard";

import AdminLayout from "../layout/AdminLayout";
import AdminRequireAuth from "./AdminRequireAuth";

import Products from "../pages/Products";
import Doctors from "../pages/Doctors";
import Orders from "../pages/Orders";
import Customers from "../pages/Customers";
import Inventory from "../pages/Inventory";
import Analytics from "../pages/Analytics";
import Reports from "../pages/Reports";
import Categories from "../pages/Categories";
import Coupons from "../pages/Coupons";
import Reviews from "../pages/Reviews";
import HomepageManagement from "../pages/HomepageManagement";
import Settings from "../pages/SettingsPlaceholder";


const adminRoutes = [

  {
    path: "/admin",
    element: <AdminRequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "products", element: <Products /> },
          { path: "doctors", element: <Doctors /> },
          { path: "orders", element: <Orders /> },
          { path: "customers", element: <Customers /> },
          { path: "inventory", element: <Inventory /> },
          { path: "analytics", element: <Analytics /> },
          { path: "reports", element: <Reports /> },
          { path: "categories", element: <Categories /> },
          { path: "coupons", element: <Coupons /> },
{ path: "reviews", element: <Reviews /> },
          { path: "homepage", element: <HomepageManagement /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
];

export default adminRoutes;


