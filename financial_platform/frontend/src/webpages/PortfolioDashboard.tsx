import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const dummyStocks = [
  { name: "AAPL", price: "$150.23", change: "+2.45%", amount: "15" },
  { name: "TSLA", price: "$800.50", change: "-1.23%", amount: "14" },
  { name: "GOOGL", price: "$2750.00", change: "+0.75%", amount: "112" },
  { name: "AMZN", price: "$3400.75", change: "-0.50%", amount: "9" },
  { name: "MSFT", price: "$299.99", change: "+1.10%", amount: "18" }
];

const dummyGraphData = [
  { date: "Mon", value: 120 },
  { date: "Tue", value: 150 },
  { date: "Wed", value: 100 },
  { date: "Thu", value: 170 },
  { date: "Fri", value: 140 },
];

const Card = ({ children }) => (
  <div className="p-5 bg-white bg-opacity-80 rounded-2xl shadow-lg h-full">{children}</div>
);

const PortfolioDashboard = () => {
  return (
    <div className="relative w-full h-screen bg-cover bg-center" style={{backgroundImage: "url(public/background.png)" }}>
      
      <div className="grid grid-cols-2 gap-4 p-10 bg-black bg-opacity-60 h-full">
        {/* Stock List */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Stock Portfolio</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Stock</th>
                <th className="text-left p-2">Amt Invested</th>
                <th className="text-left p-2">Price</th>
                <th className="text-left p-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {dummyStocks.map((stock, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{stock.name}</td>
                  <td className="p-2">{stock.amount}</td> 
                  <td className="p-2">{stock.price}</td>
                  <td className={`p-2 ${stock.change.includes("+") ? "text-green-500" : "text-red-500"}`}>
                    {stock.change} 
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Graph */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Portfolio Value Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dummyGraphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
