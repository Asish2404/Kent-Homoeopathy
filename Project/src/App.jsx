import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route
} from "react-router-dom";
import Layout from "./Layout";
import ProductsCatalog from "./ProductsCatalog"
import ProductsDetails from "./ProductDescription/Products";
import Contact from "./ContactUS/Contact";
import Labtest from "./Lab Tests/Labtest";
import Login from "./Login/Login";
import Home from "./Home/Home";
import Consult from "./ConsultDoctor/Consult";
import Cart from "./Cart/Cart"
import Profile from "./Profile/Profile";




import CartProvider from "./Cart/CartProvider";


function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<CartProvider>
          <Layout />
        </CartProvider>}>
        <Route index element={<Home />} />
        <Route path="Labtest" element={<Labtest />} />
        <Route path="Consult" element={<Consult />} />
        <Route path="Products" element={<ProductsCatalog />} />
        <Route path="products/:productId" element={<ProductsDetails />} />
        <Route path="Contact" element={<Contact />} />
        <Route path="Cart" element={<Cart />} />
        <Route path="Login" element={<Login />} />
        <Route path="Profile" element={<Profile />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />

}

export default App;