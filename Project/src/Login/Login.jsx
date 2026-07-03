import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaEye,
    FaEyeSlash,
    FaGoogle,
    FaFacebookF
} from "react-icons/fa";

import login from "./Login.png";

const Login = () => {

    const [signup, setSignup] = useState(false);
    const navigate = useNavigate();
    const [user_name, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("");

    const USERS_KEY = "auth_users_v1";
    const REMEMBERED_EMAIL_KEY = "auth_remembered_email_v1";

    const readUsers = () => {
        try {
            const raw = localStorage.getItem(USERS_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const writeUsers = (users) => {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    };

    useEffect(() => {
        const remembered = localStorage.getItem(REMEMBERED_EMAIL_KEY);
        if (remembered) {
            setEmail(remembered);
            setRememberMe(true);
        }
    }, []);

    const validate = () => {
        const nextErrors = {};
        if (signup && !user_name.trim()) nextErrors.user_name = "Full name is required";
        if (!email.trim()) nextErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email";
        if (!password) nextErrors.password = "Password is required";
        else if (password.length < 6) nextErrors.password = "Password must be at least 6 characters";
        if (signup && password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match";
        if (signup && !phone.trim()) nextErrors.phone = "Phone number is required";
        if (signup && !address.trim()) nextErrors.address = "Address is required";
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleAuth = () => {
        setStatus("");
        if (!validate()) return;

        const users = readUsers();

        if (signup) {
            const existing = users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
            if (existing) {
                setErrors({ email: "An account already exists with this email" });
                return;
            }

            const user = {
                user_name: user_name.trim(),
                email: email.trim(),
                password,
                phone: phone.trim(),
                address: address.trim()
            };

            writeUsers([...users, user]);
            localStorage.setItem("user", JSON.stringify(user));
            setStatus("Account created. Redirecting...");
            navigate("/");
            return;
        }

        const found = users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password);
        if (!found) {
            setErrors({ password: "Invalid email or password" });
            return;
        }

        localStorage.setItem("user", JSON.stringify(found));
        if (rememberMe) {
            localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
        } else {
            localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
        navigate("/");
    };

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
                                    value={user_name}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full p-4 rounded-2xl border border-gray-300 outline-none focus:ring-2 focus:ring-green-400 transition"
                                />
                            }
                            {signup && errors.user_name && <p className="-mt-3 text-sm text-red-500">{errors.user_name}</p>}

                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 rounded-2xl border border-gray-300 outline-none focus:ring-2 focus:ring-green-400 transition"
                            />
                            {errors.email && <p className="-mt-3 text-sm text-red-500">{errors.email}</p>}

                            {
                                signup &&
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full p-4 rounded-2xl border border-gray-300 outline-none focus:ring-2 focus:ring-green-400 transition"
                                />
                                {signup && errors.phone && <p className="-mt-3 text-sm text-red-500">{errors.phone}</p>}
                            }

                            {
                                signup &&
                                <input
                                    type="text"
                                    placeholder="Address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full p-4 rounded-2xl border border-gray-300 outline-none focus:ring-2 focus:ring-green-400 transition"
                                />
                            }
                            {signup && errors.address && <p className="-mt-3 text-sm text-red-500">{errors.address}</p>}

                            <div className="relative">

                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-4 rounded-2xl border border-gray-300 outline-none focus:ring-2 focus:ring-green-400 transition"
                                />

                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-5 text-gray-400 hover:text-green-700 transition" aria-label="Toggle password visibility">
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>

                            </div>
                            {errors.password && <p className="-mt-3 text-sm text-red-500">{errors.password}</p>}

                            {
                                signup &&
                                <div className="relative">

                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full p-4 rounded-2xl border border-gray-300 outline-none focus:ring-2 focus:ring-green-400 transition"
                                    />

                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-5 top-5 text-gray-400 hover:text-green-700 transition" aria-label="Toggle confirm password visibility">
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>

                                </div>
                            }
                            {signup && errors.confirmPassword && <p className="-mt-3 text-sm text-red-500">{errors.confirmPassword}</p>}

                            {
                                !signup &&
                                <div className="flex justify-between items-center flex-wrap gap-4 text-sm">

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                        Remember Me
                                    </label>

                                    <button type="button" onClick={() => setStatus(email ? `Password reset link queued for ${email}` : "Enter your email to reset password")} className="text-green-700 font-semibold cursor-pointer hover:underline">
                                        Forgot Password?
                                    </button>

                                </div>
                            }

                            <button
                                onClick={handleAuth}
                                className="cursor-pointer bg-gradient-to-r from-green-600 to-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition"
                            >
                                {
                                    signup
                                        ? "Create Account"
                                        : "Login"
                                }
                            </button>
                            {status && <p className="text-center text-sm text-green-700 font-medium">{status}</p>}

                            <div className="flex items-center gap-4">

                                <div className="h-[1px] bg-gray-300 flex-1"></div>

                                <p className="text-gray-500 text-xs">
                                    or continue with
                                </p>

                                <div className="h-[1px] bg-gray-300 flex-1"></div>

                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">

                                <button
                                    className="
                  border rounded-2xl py-3 font-semibold
                  flex items-center justify-center gap-3
                  cursor-pointer transition duration-300
                  hover:-translate-y-1
                  hover:shadow-lg
                  hover:bg-gray-50
                  group
                  "
                                       type="button"
                                       onClick={() => setStatus("Google sign-in is simulated in this build.")}
                                >
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

                                <button
                                    className="
                  border rounded-2xl py-3 font-semibold
                  flex items-center justify-center gap-3
                  cursor-pointer transition duration-300
                  hover:-translate-y-1
                  hover:shadow-lg
                  hover:bg-blue-50
                  group
                  "
                                       type="button"
                                       onClick={() => setStatus("Facebook sign-in is simulated in this build.")}
                                >
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
    );
};

export default Login;