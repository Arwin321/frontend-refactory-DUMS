import { createContext, useContext, useState, useEffect } from "react";
import { SendRequest } from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch user info saat mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await SendRequest({ prefix: "/auth/me", method: "GET" });
        setUser(res);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = (accessToken) => {
    localStorage.setItem("token", accessToken);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/signin";
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
