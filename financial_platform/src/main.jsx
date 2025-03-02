import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Stock_Report_Webpage from "./Stock_Report_Webpage.jsx"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Stock_Report_Webpage />
    {/* <App /> */}
  </StrictMode>,
)
