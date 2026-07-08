import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

const Layout = () => {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, [location.pathname]);

    return (
        <>
            <div className="min-h-screen flex flex-col">
                <Navbar />

                <main className="flex-grow">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </>
    )
}

export default Layout