import React from 'react'
import logo from "./TradingBuddyLogo.png"
import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <nav>
            <header className = "flex justify-between items-center text-black py-3 px-8 md:px-32 bg-gray-900 drop-shadow-md relative z-50">
                <Link to="/">
                    <img src={logo} alt="" className="w-12 hover:scale-105 transition-all rounded-full border-2 border-white"/>
                </Link>
                <ul className="hidden xl:flex items-center gap-12 font-semibold text-base text-white">
                    <li className= "p-3 hover:bg-sky-400 hover:text-white rounded md transition-all cursor-pointer">Mission</li>
                    <li className= "p-3 hover:bg-sky-400 hover:text-white rounded md transition-all cursor-pointer">Team</li>
                    <li className="p-3 hover:bg-sky-400 hover:text-white rounded transition-all cursor-pointer relative group">
                        Services
                        <ul className="absolute left-0 mt-5 w-40 bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <li className="p-2 hover:bg-sky-400 cursor-pointer">Stock Alerts</li>
                            <li className="p-2 hover:bg-sky-400 cursor-pointer">
                                <Link to="/stock-report">
                                Company Stocks
                                </Link>
                            </li>
                            <li className="p-2 hover:bg-sky-400 cursor-pointer">
                            <Link to="/personal-portfolio">
                                Personal Portfolio
                            </Link>
                            </li>
                        </ul>
                    </li>
                </ul>
            </header>
        </nav>
    )
}

export default Navbar
