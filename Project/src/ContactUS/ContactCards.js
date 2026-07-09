import {
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaClock,
} from "react-icons/fa";

const contactCards = [
    {
        icon: FaPhoneAlt,
        title: "Phone",
        primary: "08910863893",
        tone: "from-[var(--brand-500)] to-[var(--brand-700)]",
    },
    {
        icon: FaEnvelope,
        title: "Email",
        primary: "care@drkenthomoeo.com / support@drkenthomoeo.com",
        link: "mailto:care@drkenthomoeo.com",
        tone: "from-emerald-500 to-emerald-700",
    },
    {
        icon: FaMapMarkerAlt,
        title: "Office Address",
        primary:
            "1st Floor, 9, Barasat Rd, Above HDFC Bank, Burmah Shell Colony, Sodepur, Kolkata, West Bengal 700110",
        link: "#map",
        tone: "from-teal-500 to-teal-700",
    },
    {
        icon: FaClock,
        title: "Business Hours",
        primary: "Mon - Sat: 9 AM - 9PM",
        secondary: "Sunday: Closed",
        link: null,
        tone: "from-[var(--brand-600)] to-emerald-700",
    },
];

export default contactCards;