import React from 'react'
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import './labtest.css'
import { useForm } from "react-hook-form"

const Labtest = () => {

    const [date, setDate] = useState(new Date())

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm()

    const onSubmit = (data) => {

        const msg =
            `Hello, I am ${data.name} and I want to book a lab test.
                Name: ${data.name}
                Age: ${data.age}
                Phone: ${data.phone}
                Email: ${data.email}
                Test: ${data.labtest}
                Date: ${date.toDateString()}
                Time: ${data.time}`
        const phone = "917980972894"
        window.open(
            `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
            "_blank"
        )

    }

    return (
        <>
            <section className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 md:py-12 px-4 sm:px-6">

                <p className='text-2xl sm:text-3xl md:text-5xl font-bold text-center mb-3'>
                    Book All Your Lab Tests
                </p>

                <p className='text-center text-gray-600 mb-8 md:mb-12 text-sm md:text-lg px-2'>
                    Fast • Reliable • Home Sample Collection Available
                </p>

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">

                    <div className="bg-white shadow-2xl rounded-[35px] p-5 sm:p-7 md:p-10 border border-green-100">

                        <p className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">
                            Book Appointment
                        </p>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="flex flex-col gap-5"
                        >

                            <select
                                {...register("labtest")}
                                className="w-full p-3 md:p-4 rounded-2xl border border-gray-300 outline-none focus:border-green-500 shadow-sm"
                            >
                                <option value="">Select Lab Test</option>
                                <option value="CBC">Complete Blood Count (CBC)</option>
                                <option value="Blood Sugar">Blood Sugar Test</option>
                                <option value="Thyroid">Thyroid Profile</option>
                                <option value="Lipid">Lipid Profile</option>
                                <option value="Full Body Checkup">Full Body Checkup</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                {...register("name")}
                                className="w-full p-3 md:p-4 rounded-2xl border border-gray-300 outline-none focus:border-green-500 shadow-sm"
                            />

                            <input
                                type="number"
                                placeholder="Enter your age"
                                {...register("age")}
                                className="w-full p-3 md:p-4 rounded-2xl border border-gray-300 outline-none focus:border-green-500 shadow-sm"
                            />

                            <input
                                type="tel"
                                placeholder="Enter your contact no"
                                {...register("phone")}
                                className="w-full p-3 md:p-4 rounded-2xl border border-gray-300 outline-none focus:border-green-500 shadow-sm"
                            />

                            <input
                                type="email"
                                placeholder="Enter your email"
                                {...register("email")}
                                className="w-full p-3 md:p-4 rounded-2xl border border-gray-300 outline-none focus:border-green-500 shadow-sm"
                            />

                            <select
                                {...register("time")}
                                className="w-full p-3 md:p-4 rounded-2xl border border-gray-300 outline-none focus:border-green-500 shadow-sm"
                            >
                                <option value="">Select Time Slot</option>
                                <option value="08:00 AM">08:00 AM</option>
                                <option value="09:00 AM">09:00 AM</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="11:00 AM">11:00 AM</option>
                                <option value="12:00 PM">12:00 PM</option>
                                <option value="02:00 PM">02:00 PM</option>
                                <option value="04:00 PM">04:00 PM</option>
                            </select>

                            <div className="flex justify-center pt-4">
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white rounded-2xl px-8 md:px-10 py-3 md:py-4 font-semibold shadow-lg hover:scale-105 transition duration-300"
                                >
                                    Book Test
                                </button>
                            </div>

                        </form>

                    </div>

                    <div className="bg-white rounded-[35px] shadow-2xl p-5 sm:p-7 md:p-8 border border-green-100">

                        <p className="text-2xl md:text-3xl font-bold text-center mb-8">
                            Choose Appointment Date
                        </p>

                        <div className="flex justify-center overflow-x-auto">
                            <Calendar
                                onChange={setDate}
                                value={date}
                                className="react-calendar"
                            />
                        </div>

                        <div className="mt-6 md:mt-8 bg-green-50 rounded-3xl p-4 md:p-6 text-center">
                            <p className="text-lg md:text-xl font-semibold mb-2">
                                Selected Date
                            </p>

                            <p className="text-green-700 text-base md:text-lg font-bold">
                                {date.toDateString()}
                            </p>
                        </div>

                    </div>

                </div>

            </section>
        </>
    )
}

export default Labtest