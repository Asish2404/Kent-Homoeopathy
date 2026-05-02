import React, { useState } from "react"
import {
    FaEye,
    FaGoogle,
    FaFacebookF
} from "react-icons/fa"

import login from "./Login.png"

const Login = () => {

    const [signup, setSignup] = useState(false)

    return (
        <>
            <section className="min-h-screen flex items-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 md:px-8 py-8">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
                    <div className="hidden lg:flex justify-center items-center">
                        <img
                            src={login}
                            alt="login"
                            className="rounded-[32px] shadow-2xl w-full max-w-[540px] object-cover"
                        />
                    </div>
                    <div className="bg-white rounded-[34px] shadow-2xl p-6 sm:p-8 md:p-10 border border-green-100 w-full max-w-xl mx-auto">
                        <div className="flex justify-center mb-8 bg-green-50 rounded-full p-1 w-full">
                            <button
                                onClick={() => setSignup(false)}
                                className={`w-1/2 py-3 rounded-full font-semibold cursor-pointer transition ${!signup
                                        ? "bg-green-600 text-white shadow-md"
                                        : "text-green-700 hover:bg-green-100"
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setSignup(true)}
                                className={`w-1/2 py-3 rounded-full font-semibold cursor-pointer transition ${signup
                                        ? "bg-green-600 text-white shadow-md"
                                        : "text-green-700 hover:bg-green-100"
                                    }`}
                            >
                                Sign Up
                            </button>

                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
                            {signup ? "Create Account" : "Login"}
                        </h2>

                        <p className="text-center text-gray-500 text-sm mb-8">
                            {
                                signup
                                    ? "Create your account to get started"
                                    : "Enter your details to access account"
                            }
                        </p>

                        <div className="flex flex-col gap-5">

                            {
                                signup &&
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full p-4 rounded-2xl border border-gray-300 outline-none focus:ring-2 focus:ring-green-400 transition"
                                />
                            }

                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full p-4 rounded-2xl border border-gray-300 outline-none focus:ring-2 focus:ring-green-400 transition"
                            />
                            {
                                signup &&
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    className="w-full p-4 rounded-2xl border border-gray-300 outline-none focus:ring-2 focus:ring-green-400 transition"
                                />
                            }
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full p-4 rounded-2xl border border-gray-300 outline-none focus:ring-2 focus:ring-green-400 transition"
                                />

                                <FaEye className="absolute right-5 top-5 text-gray-400 cursor-pointer hover:text-green-700 transition" />
                            </div>
                            {
                                signup &&
                                <div className="relative">
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        className="w-full p-4 rounded-2xl border border-gray-300 outline-none focus:ring-2 focus:ring-green-400 transition"
                                    />

                                    <FaEye className="absolute right-5 top-5 text-gray-400 cursor-pointer hover:text-green-700 transition" />
                                </div>
                            }
                            {
                                !signup &&
                                <div className="flex justify-between items-center flex-wrap gap-4 text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" />
                                        Remember Me
                                    </label>
                                    <button className="text-green-700 font-semibold cursor-pointer hover:underline">
                                        Forgot Password?
                                    </button>
                                </div>
                            }
                            <button className="cursor-pointer bg-gradient-to-r from-green-600 to-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition">
                                {
                                    signup
                                        ? "Create Account"
                                        : "Login"
                                }
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="h-[1px] bg-gray-300 flex-1"></div>

                                <p className="text-gray-500 text-xs">
                                    or continue with
                                </p>
                                <div className="h-[1px] bg-gray-300 flex-1"></div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <button className="
                                            border rounded-2xl py-3 font-semibold
                                            flex items-center justify-center gap-3
                                            cursor-pointer transition duration-300
                                            hover:-translate-y-1
                                            hover:shadow-lg
                                            hover:bg-gray-50
                                            group
                                            ">
                                    <FaGoogle
                                        className="
                                        text-[#DB4437]
                                        transition duration-300
                                        group-hover:rotate-12
                                        group-hover:scale-125
                                        "
                                    />

                                    <span className="group-hover:text-[#4285F4] transition">
                                        Google
                                    </span>
                                </button>
                                <button className="
                                        border rounded-2xl py-3 font-semibold
                                        flex items-center justify-center gap-3
                                        cursor-pointer transition duration-300
                                        hover:-translate-y-1
                                        hover:shadow-lg
                                        hover:bg-blue-50
                                        group
                                        ">
                                    <FaFacebookF
                                        className="
                                            text-[#4267B2]
                                            transition duration-300
                                            group-hover:scale-125
                                            group-hover:-rotate-12
                                            "
                                    />

                                    <span className="group-hover:text-[#4267B2] transition">
                                        Facebook
                                    </span>
                                </button>

                            </div>
                            <p className="text-center text-sm pt-4">
                                {
                                    signup
                                        ? "Already have an account?"
                                        : "Don’t have an account?"
                                }

                                <button
                                    onClick={() => setSignup(!signup)}
                                    className="ml-2 text-green-700 font-bold cursor-pointer hover:underline"
                                >
                                    {
                                        signup
                                            ? "Login"
                                            : "Sign Up"
                                    }
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Login