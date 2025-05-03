import React, { useState } from "react";
import logo from "../../public/logo.png";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false); // State for Services dropdown

  return (
    <nav>
      <header className="flex justify-between items-center text-black py-3 px-8 md:px-32 bg-gray-900 drop-shadow-md relative z-50">
        {/* Logo */}
        <Link to="/">
          <img
            src={logo}
            alt="Logo"
            className="w-12 hover:scale-105 transition-all rounded-full border-2 border-white"
          />
        </Link>

        {/* Hamburger Menu for Mobile */}
        <button
          className="xl:hidden text-white text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>

        {/* Navigation Links */}
        <ul
          className={`${
            isMenuOpen ? "flex" : "hidden"
          } xl:flex flex-col xl:flex-row items-center gap-6 font-semibold text-base text-white absolute xl:static top-16 left-0 w-full xl:w-auto bg-gray-900 xl:bg-transparent p-4 xl:p-0`}
        >
          <li className="p-3 hover:bg-sky-400 hover:text-white rounded transition-all cursor-pointer">
            <Link to="/mission" onClick={() => setIsMenuOpen(false)}>Mission</Link>
          </li>
          <li className="p-3 hover:bg-sky-400 hover:text-white rounded transition-all cursor-pointer">
            <Link to="/team" onClick={() => setIsMenuOpen(false)}>Team</Link>
          </li>
          <li className="p-3 hover:bg-sky-400 hover:text-white rounded transition-all cursor-pointer relative border-none"
              onClick={() => setIsServicesOpen(!isServicesOpen)}>
              Services
            {isServicesOpen && (
              <ul className="absolute left-0 mt-2 w-40 bg-gray-900 rounded shadow-lg z-50">
                <li className="p-2 hover:bg-sky-400 cursor-pointer">
                  Newsletter
                </li>
                <li className="p-2 hover:bg-sky-400 cursor-pointer">
                  <Link to="/stock-report" onClick={() => setIsMenuOpen(false)}>Company Stocks</Link>
                </li>
                <li className="p-2 hover:bg-sky-400 cursor-pointer">
                  Personal Portfolio
                </li>
              </ul>
            )}
          </li>

          {currentUser && currentUser.username === "admin" && (
            <li className="p-3 hover:bg-sky-400 hover:text-white rounded transition-all cursor-pointer relative group">
              Admin
              <ul className="absolute left-0 mt-5 w-40 bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <li className="p-2 hover:bg-sky-400 cursor-pointer">
                  <Link to="/market-pulse" onClick={() => setIsMenuOpen(false)}>Market Pulse</Link>
                </li>
              </ul>
            </li>
          )}

          {/* Auth Section */}
          {currentUser ? (
            <li className="flex flex-col xl:flex-row items-center gap-4">
              <Link
                to="/profile"
                className="p-3 hover:bg-sky-400 hover:text-white rounded transition-all cursor-pointer"
              >
                Profile ({currentUser.username})
              </Link>
              <button
                onClick={logout}
                className="p-3 bg-red-500 hover:bg-red-600 text-white rounded transition-all cursor-pointer"
              >
                Logout
              </button>
            </li>
          ) : (
            <li className="flex flex-col xl:flex-row items-center gap-4">
              <Link
                to="/login"
                className="p-3 hover:bg-sky-400 hover:text-white rounded transition-all cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="p-3 bg-sky-400 hover:bg-sky-500 text-white rounded transition-all cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </li>
          )}
        </ul>
      </header>
    </nav>
  );
};

export default Navbar;
