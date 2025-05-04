import React from "react";
import { Link } from "react-router-dom"; // Add this import

const Mission = () => {
  return (
    <div
      className="relative w-full h-screen bg-cover bg-center filter brightness-75"
      style={{
        backgroundImage:
          "url(https://images.ctfassets.net/1aemqu6a6t65/1NNaQlkh6PCMQonW9gzPG2/1fc6b2a5ede1e03d4791c1f7250039bc/new-york-stock-exchange-julienne-schaer-077)"
      }}
    >
      {/* Stronger Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 md:mb-6 leading-tight text-white opacity-0 animate-fade-in">
          Our Mission
        </h1>
        <p className="text-base md:text-lg lg:text-xl max-w-3xl text-gray-100 leading-relaxed tracking-wide opacity-0 animate-fade-in delay-200">
          We redefine the trading experience with intuitive, high‑performance tools
          that bring clarity and speed to every investor. Whether you're just
          starting out or managing a large portfolio, access real‑time data and
          transparent analytics—no fluff, no hidden fees. By merging cutting‑edge
          tech with deep market know‑how, we level the playing field and empower
          confident trading in a dynamic financial world.
        </p>

        <Link 
          to="/signup"
          className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-full text-white font-medium opacity-0 animate-fade-in delay-400"
        >
          Get Started
        </Link>
      </div>

      {/* Tailwind animation utilities */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 1s forwards;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Mission;