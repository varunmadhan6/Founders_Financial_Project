<<<<<<< HEAD
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
=======
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ApiTest from "./components/api_test.jsx";
>>>>>>> origin/dilan

createRoot(document.getElementById("root")).render(
  <StrictMode>
<<<<<<< HEAD
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
=======
    <App />
  </StrictMode>
);
>>>>>>> origin/dilan
