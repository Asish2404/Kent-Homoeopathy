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




function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="Labtest" element={<Labtest />} />
        <Route path="Consult" element={<Consult />} />
        <Route path="Products" element={<Products />} />
        <Route path="Contact" element={<Contact />} />
        <Route path="Cart" element={<h1>Cart</h1>} />
        <Route path="Login" element={<Login />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />

}

export default App;