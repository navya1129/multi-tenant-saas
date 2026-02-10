import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/auth.api";
import { setToken, getToken, clearToken } from "../utils/token";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (getToken()) {
      getMe().then(res => setUser(res.data.data)).catch(logout);
    }
  }, []);

  const login = (token) => {
    setToken(token);
    return getMe().then(res => setUser(res.data.data));
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
