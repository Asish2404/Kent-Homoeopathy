import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import Layout from "./Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import ProductsCatalog from "./ProductsCatalog";
import ProductsDetails from "./ProductDescription/Products";
import Contact from "./ContactUS/Contact";
import Labtest from "./Lab Tests/Labtest";
import Login from "./Login/Login";
import Home from "./Home/Home";
import Consult from "./ConsultDoctor/Consult";
import Cart from "./Cart/Cart";
import Profile from "./Profile/Profile";
import OrderTracking from "./pages/OrderTracking";
import NotFound from "./pages/NotFound";

import CartProvider from "./Cart/CartProvider";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import OrderSuccess from "./pages/OrderSuccess";

import AdminLayout from "./admin/layout/AdminLayout";
import AdminRequireAuth from "./admin/routes/AdminRequireAuth";

import Dashboard from "./admin/pages/Dashboard";
import Products from "./admin/pages/Products";
import Doctors from "./admin/pages/Doctors";
import Orders from "./admin/pages/Orders";
import Customers from "./admin/pages/Customers";
import Inventory from "./admin/pages/Inventory";
import Analytics from "./admin/pages/Analytics";
import Reports from "./admin/pages/Reports";
import Categories from "./admin/pages/Categories";
import Coupons from "./admin/pages/Coupons";
import Reviews from "./admin/pages/Reviews";
import Settings from "./admin/pages/SettingsPlaceholder";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<CartProvider><Layout /></CartProvider>}>
        <Route index element={<Home />} />
        <Route path="Labtest" element={<Labtest />} />
        <Route path="Consult" element={<Consult />} />
        <Route path="Products" element={<ProductsCatalog />} />
        <Route path="products/:productId" element={<ProductsDetails />} />
        <Route path="Contact" element={<Contact />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="Profile" element={<Profile />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="payment" element={<Payment />} />
<Route path="order-success" element={<OrderSuccess />} />
        <Route path="orders/:orderId" element={<OrderTracking />} />

        {/* ADMIN */}
        <Route path="admin" element={<AdminRequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="categories" element={<Categories />} />
            <Route path="coupons" element={<Coupons />} />
<Route path="reviews" element={<Reviews />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* 404 - Catch all unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
