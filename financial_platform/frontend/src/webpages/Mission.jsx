import React from "react";

const Mission = () => {
  return (
    <div className="relative w-full h-screen bg-cover bg-center" style={{ backgroundImage: "url(public/background.png)" }}>
      {/* Overlay */}
      <div className="bg-black/60 absolute top-0 left-0 w-full h-full" />

      {/* Content */}
      <div className="absolute top-0 w-full h-full flex flex-col justify-center items-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center">
          Our Mission
        </h1>
        <p className="text-lg md:text-xl text-center max-w-3xl">
        Our mission is to redefine the trading experience by providing intuitive, high-performance tools that put clarity, speed, and strategy into every investor's hands. We are committed to building a platform where traders, of any expertise, can access real-time data and transparent analytics without unnecessary complexity. By combining technology and market expertise, we aim to level the playing field and foster a new generation of informed, empowered, and confident traders in a rapidly evolving financial landscape.
        </p>
      </div>
    </div>
  );
};

export default Mission;