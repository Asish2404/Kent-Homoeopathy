import {
  FaLeaf,
  FaUserMd,
  FaFlask,
  FaTruck,
  FaArrowRight,
} from "react-icons/fa";
import Carousel from "../components/Carousel";
import slides from "../data/Slides";
import { useRef, useEffect } from "react";
import { FaStar, FaShoppingCart } from "react-icons/fa";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import top from "./top.png";
import oc from "./oc.png";
const Home = () => {
  const sliderRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/test")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });

  }, []);
  const scrollLeft = () => {
    sliderRef.current.scrollBy({
      left: -420,
      behavior: "smooth",
    });
  };
  const scrollRight = () => {
    sliderRef.current.scrollBy({
      left: 420,
      behavior: "smooth",
    });
  };

  const products = [
    {
      id: 1,
      name: "She Care Juice",
      price: 541,
      oldPrice: 543,
      rating: 4.9,
      reviews: 8921,
      discount: "Save ₹2",
      image: "https://krishnas.com/cdn/shop/files/shecare.png",
    },
    {
      id: 2,
      name: "Diabic Care Juice",
      price: 457,
      oldPrice: 459,
      rating: 4.8,
      reviews: 8335,
      discount: "Save ₹2",
      image: "https://krishnas.com/cdn/shop/files/diabiccare.png",
    },
    {
      id: 3,
      name: "Cholesterol Care",
      price: 560,
      oldPrice: 562,
      rating: 5.0,
      reviews: 6398,
      discount: "Save ₹2",
      image: "https://krishnas.com/cdn/shop/files/cholesterolcare.png",
    },
    {
      id: 4,
      name: "Shapefix Juice",
      price: 476,
      oldPrice: 478,
      rating: 4.8,
      reviews: 7432,
      discount: "Save ₹2",
      image: "https://krishnas.com/cdn/shop/files/shapefix.png",
    },
    {
      id: 5,
      name: "Liver Wellness",
      price: 599,
      oldPrice: 649,
      rating: 4.9,
      reviews: 5911,
      discount: "Save ₹50",
      image:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200",
    },
  ];

  const services = [
    {
      icon: <FaLeaf />,
      title: "Medicines",
      desc: "100% genuine homoeopathic medicines",
      link: "/Products",
    },
    {
      icon: <FaUserMd />,
      title: "Consultation",

      desc: "Expert online doctor support",
    },
    {
      icon: <FaFlask />,
      title: "Lab Tests",
      desc: "Book accurate tests at home",
      link: "/Labtest",
    },
    {
      icon: <FaTruck />,
      title: "Fast Delivery",
      desc: "Doorstep medicine delivery",
    },
  ];

  return (
    <>
      <Carousel slides={slides} />
      <section className="py-24 overflow-hidden">
        <div className="text-center mb-14">
          <p className="text-green-600 font-semibold mb-4 text-lg">
            Featured Products
          </p>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Select Your Concern
          </h2>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[
              "Best Solutions",
              "Diabetic Wellness",
              "Digestive Wellness",
              "Pain Relief",
              "Women's Wellness",
              "Skin Wellness",
            ].map((tag, i) => (
              <button
                key={i}
                className={`
            px-6 py-3 rounded-full font-medium cursor-pointer transition
            ${i === 0
                    ? "bg-green-100 text-green-800"
                    : "bg-white shadow-md hover:bg-green-50"
                  }
            `}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={scrollLeft}
            className="hidden md:flex absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 bg-white shadow-2xl h-14 w-14 rounded-full items-center justify-center cursor-pointer hover:scale-110 transition"
          >
            <HiOutlineChevronLeft className="text-3xl" />
          </button>

          <button
            onClick={scrollRight}
            className="hidden md:flex absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 bg-white shadow-2xl h-14 w-14 rounded-full items-center justify-center cursor-pointer hover:scale-110 transition"
          >
            <HiOutlineChevronRight className="text-3xl" />
          </button>

          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar pb-6 px-2"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="
        shrink-0 
        w-[85%] 
        sm:w-[60%] 
        md:w-[45%] 
        lg:w-[30%] 
        xl:w-[23%] 
        bg-white rounded-2xl shadow-lg overflow-hidden 
        hover:-translate-y-2 transition
      "
              >
                {/* IMAGE */}
                <div className="relative bg-gradient-to-br from-green-50 to-white p-5">
                  <span className="absolute top-3 left-3 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                    {product.discount}
                  </span>

                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-[200px] md:h-[220px] object-contain"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-green-500 gap-1 text-sm">
                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStar />
                    </div>
                    <span className="text-gray-500 text-sm">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-xl md:text-2xl font-bold">
                      ₹{product.price}
                    </span>

                    <span className="ml-2 text-gray-400 line-through text-sm">
                      ₹{product.oldPrice}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                      <FaShoppingCart />
                      Add
                    </button>

                    <button className="px-4 border border-green-600 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-50">
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <button className="bg-white border-2 border-green-600 text-green-700 px-10 py-4 rounded-2xl font-bold hover:bg-green-50 transition cursor-pointer shadow-lg">
              View All Products
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
export default Home;
