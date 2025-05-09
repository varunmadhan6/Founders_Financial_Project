import Home from "./webpages/Home.jsx";
import Navbar from "./components/Navbar.jsx"; // Updated path
import Stock_Report_Webpage from "./webpages/Stock_Report_Webpage.jsx";
import Team from "./webpages/Team.jsx"
import Login from "./webpages/Login.jsx";
import Signup from "./webpages/Signup.jsx";
import Profile from "./webpages/Profile.jsx";
import Mission from "./webpages/Mission.jsx";
import MarketPulseDashboard from "./components/MarketPulse.jsx";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";

export default function App() {

  return (
    <AuthProvider>
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stock-report" element={<Stock_Report_Webpage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/market-pulse" element={<MarketPulseDashboard />} />
          <Route path="/team" element={<Team />} />
        </Routes>
      </>
    </AuthProvider>
  );
}
