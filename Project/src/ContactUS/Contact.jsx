import React from 'react'
import ContactImg from './Contact.png'
import { useForm } from "react-hook-form"
import "leaflet/dist/leaflet.css";
import {
    FaFacebookF,
    FaLinkedinIn,
    FaYoutube,
    FaWhatsapp,
    FaInstagram
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Contact = () => {

    const {
        handleSubmit,
        formState: { errors },
    } = useForm()

    const onSubmit = (data) => {
        console.log(data);
    }

    const inputStyle =
        "w-full border-b border-gray-300 py-3 outline-none placeholder:text-gray-400 placeholder:italic focus:border-black";

    return (
        <div className="min-h-screen">

            <div className="hidden md:block w-full px-6 pt-4">
                <img
                    src={ContactImg}
                    alt="Contact Banner"
                    className="w-full h-[250px] sm:h-[350px] md:h-[500px] object-cover rounded-3xl shadow-lg"
                />
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-[60px] py-14 md:py-20 px-4 md:px-6">

                <div className="shadow-lg p-6 md:p-8 rounded-2xl bg-white flex flex-col gap-10 md:gap-[60px]">
                    <div>
                        <p className="text-3xl md:text-4xl font-bold mb-6">
                            Get In Touch
                        </p>
                        <p className="text-gray-600 leading-7 md:leading-8 text-sm md:text-base">
                            Contact us for consultation, medicines,
                            appointments or any health assistance.
                        </p>
                    </div>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <input
                            type="text"
                            name="name"
                            id="name"
                            placeholder='Name:'
                            className={inputStyle}
                        />
                        <input
                            type="text"
                            name="email"
                            id="email"
                            placeholder='Email:'
                            className={inputStyle}
                        />
                        <input
                            type="text"
                            name="Phone"
                            id="Phone"
                            placeholder='Phone No:'
                            className={inputStyle}
                        />
                        <input
                            type="text"
                            name="subject"
                            id="subject"
                            placeholder='Subject:'
                            className={inputStyle}
                        />
                        <input
                            type="text"
                            name="Message"
                            id="Message"
                            placeholder='Message:'
                            className={inputStyle}
                        />
                        <div className='flex justify-center'>
                            <input
                                type="submit"
                                value="Submit"
                                className="
                                bg-black text-white rounded-2xl p-3 w-[140px]
                                cursor-pointer hover:shadow-2xl
                                hover:scale-105 transition duration-300"
                            />
                        </div>
                    </form>
                </div>

                <div className='w-full shadow-lg p-6 md:p-8 rounded-2xl bg-white flex flex-col gap-8'>
                    <div className="content flex flex-col">
                        <p className='text-3xl md:text-4xl font-bold'>
                            We are always ready
                        </p>
                        <p className='text-3xl md:text-4xl font-bold'>
                            to help you and
                        </p>
                        <p className='text-3xl md:text-4xl font-bold'>
                            answer your
                        </p>
                        <p className='text-3xl md:text-4xl font-bold'>
                            questions
                        </p>
                    </div>
                    <p className='text-sm md:text-base leading-7'>
                        Practice holistic health, your partner in holistic practices,
                        natural healthcare support consulting services.
                    </p>
                    <div className="contact flex gap-8 flex-col">
                        <p className='font-bold text-lg'>
                            Contact Information
                        </p>
                        <div className="leftpart flex flex-col md:flex-row gap-8 md:gap-12">
                            <div className="address flex flex-col gap-2">
                                <p className='font-bold text-md'>
                                    Address
                                </p>
                                <p className='text-md'>
                                    USA, New York - 1006
                                    8th Floor, Bayview 1
                                </p>
                            </div>
                            <div className="Number flex flex-col gap-2">
                                <p className='text-md font-bold'>
                                    Contact No
                                </p>
                                <p className='text-sm'>
                                    +88 160 952 36 54
                                </p>
                                <p className='text-sm'>
                                    +123 4567 254 587
                                </p>
                            </div>
                        </div>
                        <div className="rightpart flex flex-col md:flex-row gap-8 md:gap-[60px]">
                            <div className="Email flex flex-col gap-2">
                                <p className='font-bold text-md'>
                                    Email
                                </p>
                                <p className='text-sm break-all'>
                                    mail@example.com
                                </p>
                            </div>
                            <div className="socials flex flex-col ">
                                <p className='text-md font-bold'>
                                    Social Network
                                </p>
                                <div className="networks flex items-center gap-5 md:gap-6 py-3 overflow-x-auto whitespace-nowrap">
                                    <p className='text-lg md:text-xl cursor-pointer hover:text-[#1877F2] hover:translate-x-1 transition duration-300'>
                                        <FaFacebookF />
                                    </p>
                                    <p className='text-lg md:text-xl cursor-pointer hover:text-[#000000] hover:translate-x-1 transition duration-300'>
                                        <FaXTwitter />
                                    </p>
                                    <p className='text-lg md:text-xl cursor-pointer hover:text-[#0a66c2] hover:translate-x-1 transition duration-300'>
                                        <FaLinkedinIn />
                                    </p>
                                    <p className='text-lg md:text-xl cursor-pointer hover:text-[#FF0000] hover:translate-x-1 transition duration-300'>
                                        <FaYoutube />
                                    </p>
                                    <p className='text-lg md:text-xl cursor-pointer hover:text-[#25d366] hover:translate-x-1 transition duration-300'>
                                        <FaWhatsapp />
                                    </p>
                                    <p className='text-lg md:text-xl cursor-pointer hover:text-[#c32aa3] hover:translate-x-1 transition duration-300'>
                                        <FaInstagram />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full h-[280px] sm:h-[350px] md:h-[450px] bg-gray-200 flex items-center justify-center rounded-3xl overflow-hidden mt-4">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29445.77322329087!2d88.36704967378805!3d22.701403522719467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f89c0bf0119e61%3A0xf3dedf82eaf68307!2sSodepur%2C%20Kolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1777210961428!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </div>
    )
}

export default Contact