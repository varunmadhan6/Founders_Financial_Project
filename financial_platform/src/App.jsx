import { useState } from 'react'
import Home from './webpages/home.jsx'
import Navbar from './webpages/Navbar.jsx'
import Stock_Report_Webpage from "./webpages/Stock_Report_Webpage.jsx"
import {Route, Routes} from "react-router-dom"
export default function App() {
  return (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stock-report" element={<Stock_Report_Webpage />} />
        </Routes>
      </>
  )
}

