import React from "react";
import {
  FaLeaf,
  FaGlobe,
  FaShareAlt,
  FaExternalLinkAlt,
  FaArrowRight,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black/90 text-gray-300 mt-auto rounded-t-2xl w-full">

      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10 py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-700 p-3 rounded-full">
              <FaLeaf className="text-white"/>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Dr. Kent
              </h2>

              <p className="tracking-[3px] md:tracking-[4px] text-xs md:text-sm text-gray-400">
                HOMOEO PHARMACY
              </p>
            </div>
          </div>

          <p className="leading-7 md:leading-8 mb-8 text-sm md:text-base">
            Your trusted destination for authentic homoeopathic medicines
            and expert consultations. Serving the community for over 25 years.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="bg-zinc-800 p-3 rounded-lg hover:bg-green-700">
              <FaGlobe />
            </button>

            <button className="bg-zinc-800 p-3 rounded-lg hover:bg-green-700">
              <FaShareAlt />
            </button>

            <button className="bg-zinc-800 p-3 rounded-lg hover:bg-green-700">
              <FaExternalLinkAlt />
            </button>

            <button className="bg-zinc-800 p-3 rounded-lg hover:bg-green-700">
              <FaArrowRight />
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">
            Quick Links
          </h2>

          <ul className="space-y-4 md:space-y-5 text-sm md:text-base">
            <li>About Us</li>
            <li>Products</li>
            <li>Book Appointment</li>
            <li>Online Consultation</li>
            <li>Track Order</li>
            <li>Blog</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">
            Categories
          </h2>

          <ul className="space-y-4 md:space-y-5 text-sm md:text-base">
            <li>Dilutions</li>
            <li>Mother Tinctures</li>
            <li>Biochemic Salts</li>
            <li>Tonics & Syrups</li>
            <li>External Applications</li>
            <li>Wellness Products</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">
            Contact Us
          </h2>

          <div className="space-y-5 md:space-y-6 text-sm md:text-base">

            <div className="flex gap-4 items-start">
              <FaMapMarkerAlt className="text-green-500 mt-1 shrink-0"/>
              <p>42 Wellness Lane, Green Park, New Delhi -110016</p>
            </div>

            <div className="flex gap-4 items-center">
              <FaPhoneAlt className="text-green-500 shrink-0"/>
              <p>+91 98765 43210</p>
            </div>

            <div className="flex gap-4 items-center break-all">
              <FaEnvelope className="text-green-500 shrink-0"/>
              <p>care@drkenthomoeo.com</p>
            </div>

            <div className="flex gap-4 items-start">
              <FaClock className="text-green-500 mt-1 shrink-0"/>
              <p>
                Mon-Sat: 9AM - 8PM <br/>
                Sunday: Closed
              </p>
            </div>

          </div>
        </div>

      </div>

      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-10 py-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">

          <p className="text-sm md:text-base">
            © 2026 Dr. Kent Homoeo Pharmacy. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-sm md:text-base">
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
            <p>Refund Policy</p>
          </div>

        </div>
      </div>

    </footer>
  );
};

export default Footer;