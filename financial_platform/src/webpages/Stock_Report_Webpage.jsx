import React from "react"

export default function Stock_Report_Webpage() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Stock Report</h1>


      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Daily Range</h2>
        <div className="flex justify-between">
          <p>High: --</p>
          <p>Low: --</p>
        </div>
      </div>

     
      <div className="mb-6 p-4 border rounded-lg h-40 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Graph Placeholder</p>
      </div>

      
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Risk Score</h2>
        <p className="text-lg">--</p>
      </div>
    </div>
  )
}