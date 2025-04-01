import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Home = () => {
  // Sample data for Boeing stock performance
  const weekData = [
    { date: "Mon", Price: 189.42 },
    { date: "Tue", Price: 192.57 },
    { date: "Wed", Price: 195.14 },
    { date: "Thu", Price: 196.82 },
    { date: "Fri", Price: 198.35 },
  ];

  const monthData = [
    { date: "Week 1", Price: 185.25 },
    { date: "Week 2", Price: 189.42 },
    { date: "Week 3", Price: 162.36 },
    { date: "Week 4", Price: 198.35 },
  ];

  const yearData = [
    { date: "Jan", Price: 167.85 },
    { date: "Feb", Price: 175.32 },
    { date: "Mar", Price: 182.46 },
    { date: "Apr", Price: 179.58 },
    { date: "May", Price: 143.74 },
    { date: "Jun", Price: 185.62 },
    { date: "Jul", Price: 188.91 },
    { date: "Aug", Price: 123.45 },
    { date: "Sep", Price: 189.75 },
    { date: "Oct", Price: 192.36 },
    { date: "Nov", Price: 195.84 },
    { date: "Dec", Price: 198.35 },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      data: weekData,
      title: "Turtle Mode 🐢 (Weekly Performance)",
      color: "#8884d8",
    },
    {
      data: monthData,
      title: "Rabbit Mode 🐇 (Monthly Performance)",
      color: "#82ca9d",
    },
    {
      data: yearData,
      title: "Eagle Mode 🦅 (Yearly Performance)",
      color: "#ffc658",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-screen">
      <img
        className="top-0 left-0 w-full h-screen object-cover"
        src="https://fox5sandiego.com/wp-content/uploads/sites/15/2020/03/AP20086453484483.jpg?w=2560&h=1440&crop=1"
        alt="/"
      />
      <div className="bg-black/60 absolute top-0 left-0 w-full h-[112vh]" />
      <div className="absolute top-0 w-full h-full flex flex-col justify-center text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto p-4">
          {/* Left Column - Text */}
          <div className="space-y-5 flex flex-col justify-center">
            <p>Welcome To</p>
            <h1 className="font-bold text-5xl md:text-7xl drop-shadow-lg">
              Artemis Trading
            </h1>
            <p className="max-w-[600px] drop-shadow-2xl py-2 text-m">
              A one-stop shop for everything and anything related to stocks.
              Click below to sign up and gain access to our premium features,
              including but not limited to stock reports, a personalized
              portfolio, and advice from verified financial advisors.
            </p>
            <div>
              <button className="bg-white text-black font-sans hover:bg-gray-200 transition-all">
                Sign Up Now
              </button>
            </div>
          </div>

          {/* Right Column - Stock Graph */}
          <div className="bg-gray-900/80 rounded-lg p-4 shadow-lg transform translate-x-12 md:mt-15">
            <h2 className="text-xl font-bold mb-2 text-center">
              {slides[currentSlide].title}
            </h2>
            <h3 className="text-center mb-4">Boeing Stock</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={slides[currentSlide].data}
                  margin={{ top: 5, right: 26, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="date"
                    stroke="#fff"
                    tickMargin={10}
                    interval={0}
                  />
                  <YAxis stroke="#fff" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#333",
                      borderColor: "#444",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Price"
                    stroke={slides[currentSlide].color}
                    strokeWidth={3}
                    dot={{ fill: slides[currentSlide].color, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4 space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    currentSlide === index ? "bg-white" : "bg-gray-500"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
