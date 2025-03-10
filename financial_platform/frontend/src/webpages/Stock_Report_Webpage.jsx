import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Stock_Report_Webpage() {
  // Sample data for Boeing stock performance
  const dayData = [
    { time: '09:30 AM', price: 241.67 },
    { time: '10:30 AM', price: 242.10 },
    { time: '11:30 AM', price: 241.50 },
    { time: '12:30 PM', price: 240.80 },
    { time: '01:30 PM', price: 239.90 },
    { time: '02:30 PM', price: 239.20 },
    { time: '03:30 PM', price: 238.50 },
    { time: '04:00 PM', price: 238.16 }
  ];
  
  const weekData = [
    { time: 'Feb 24, 2025', price: 247.17 },
    { time: 'Feb 25, 2025', price: 247.04 },
    { time: 'Feb 26, 2025', price: 240.36 },
    { time: 'Feb 27, 2025', price: 237.30 },
    { time: 'Feb 28, 2025', price: 241.84 },
    { time: 'Mar 3, 2025', price: 238.03 }
  ];
  
  const monthData = [
    { time: 'Week 1', price: 227.56 },
    { time: 'Week 2', price: 231.78 },
    { time: 'Week 3', price: 235.90 },
    { time: 'Week 4', price: 247.04 },
    { time: 'Current', price: 238.03 }
  ];
  
  const yearData = [
    { time: 'Mar 2024', price: 192.00 },
    { time: 'Apr 2024', price: 195.20 },
    { time: 'May 2024', price: 198.10 },
    { time: 'Jun 2024', price: 202.50 },
    { time: 'Jul 2024', price: 207.80 },
    { time: 'Aug 2024', price: 212.30 },
    { time: 'Sep 2024', price: 218.90 },
    { time: 'Oct 2024', price: 225.40 },
    { time: 'Nov 2024', price: 230.60 },
    { time: 'Dec 2024', price: 250.15 },
    { time: 'Jan 2025', price: 243.85 },
    { time: 'Feb 2025', price: 241.84 },
    { time: 'Mar 2025', price: 238.03 }
  ];
  
      const [currentSlide, setCurrentSlide] = useState(0);
      const slides = [
          { data: dayData, title: "Past Day", color: "#d12e78" },
          { data: weekData, title: "Past Week", color: "#8884d8" },
          { data: monthData, title: "Past Month", color: "#82ca9d" },
          { data: yearData, title: "Past Year", color: "#ffc658" }
      ];
  
      useEffect(() => {
          const timer = setInterval(() => {
              setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
          }, 5000); // Change slide every 5 seconds
  
          return () => clearInterval(timer);
      }, []);

  return (
    
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Stock Report</h1>
        
        <form className="rounded-lg bg-gray-50 w-1/2">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter Stock Symbol (e.g., AAPL)"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit" 
              className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <h1 className="text-5xl font-extrabold text-center mb-8 bg-clip-text">Apple (AAPL)</h1>


      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Daily Range</h2>
        <div className="flex justify-between">
          <p>High: --</p>
          <p>Low: --</p>
        </div>
      </div>

     
      {/*company stock graph*/}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h2 className="text-xl font-semibold mb-2 text-center">{slides[currentSlide].title}</h2>
        <h3 className="text-center mb-4 text-gray-600">Apple Stock</h3>
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={slides[currentSlide].data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="time" stroke="#666" tickMargin={5} interval="preserveStartEnd" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: "#f9f9f9", borderColor: "#ddd", color: "#333" }} 
                labelStyle={{ color: "#333" }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
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
              className={`h-3 w-3 rounded-full transition ${currentSlide === index ? "bg-blue-600" : "bg-gray-400 hover:bg-gray-500"}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Risk Score</h2>
        <p className="text-lg">--</p>
      </div>
    </div>
  )
}