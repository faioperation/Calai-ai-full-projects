import { createContext, useState } from "react";
import Cookies from "js-cookie";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const logOutUser = () => {
    Cookies.remove("Access-Token");
    Cookies.remove("role");
    localStorage.removeItem("user");
    setUser(null);
  };

  const userInfo = {
    user,
    setUser,
    loading,
    setLoading,
    logOutUser,
  };

  return (
    <AuthContext.Provider value={userInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
