import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route
} from "react-router-dom";
import Layout from "./Layout";
import Products from "./ProductDescription/Products"
import Contact from "./ContactUS/Contact";
import Labtest from "./Lab Tests/Labtest";
import Login from "./Login/Login";
import Home from "./Home/Home";
import Consult from "./ConsultDoctor/Consult";
import Cart from "./Cart/Cart"
import Profile from "./Profile/Profile";



function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="Labtest" element={<Labtest />} />
        <Route path="Consult" element={<Consult />} />
        <Route path="Products" element={<Products />} />
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