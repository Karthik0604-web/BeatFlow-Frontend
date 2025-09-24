import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Create the context
const AuthContext = createContext();

// Define the API endpoint for your backend
const API_URL = "/api/auth";

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// The provider component that wraps your app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check for a token in local storage when the app first loads
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        // Optional: Check if the token is expired
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser({ email: decodedUser.sub }); // 'sub' (subject) is the email in our JWT
        } else {
          localStorage.removeItem("token"); // Token is expired
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Signup function
  const signup = async (name, email, password) => {
    try {
      // The keys { name, email, password } must match the backend DTO fields
      await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
      });
      // After a successful signup, automatically log the user in
      return await login(email, password);
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      return { success: false, message: "Signup failed. The email may already be in use." };
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      // The keys { email, password } must match the backend DTO fields
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem("token", token); // Store the token
      const decodedUser = jwtDecode(token);
      setUser({ email: decodedUser.sub }); // Set the user state

      return { success: true };
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      return { success: false, message: "Login failed. Please check your credentials." };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  // The value provided to the context consumers
  const value = {
    user,
    signup,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
