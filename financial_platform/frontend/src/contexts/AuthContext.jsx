import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is logged in on page load
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      } else {
        // Token invalid or expired
        localStorage.removeItem("token");
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        setCurrentUser({
          id: data.user_id,
          username: data.username,
        });
        setError("");
        return true;
      } else {
        setError(data.error || "Login failed");
        return false;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login");
      return false;
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        setCurrentUser({
          id: data.user_id,
          username: username,
        });
        setError("");
        return true;
      } else {
        setError(data.error || "Registration failed");
        return false;
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred during registration");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);

    // Optional: Call backend logout endpoint
    fetch(`${API_URL}/api/logout`, {
      method: "POST",
    }).catch((err) => console.error("Logout error:", err));
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    error,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
