import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client.js";
import { isFirebaseConfigured, signInWithGoogle } from "../lib/firebase.js";

const AuthContext = createContext(null);

function persistSession({ user, token }) {
  localStorage.setItem("chainproof_token", token);
  localStorage.setItem("chainproof_user", JSON.stringify(user));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("chainproof_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("chainproof_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem("chainproof_token");
        localStorage.removeItem("chainproof_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const applyAuthResponse = (data) => {
    persistSession(data);
    setUser(data.user);
    return data;
  };

  const exchangeFirebaseToken = async (idToken, name) => {
    const { data } = await api.post("/auth/firebase", { idToken, ...(name ? { name } : {}) });
    return applyAuthResponse(data.data);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    return applyAuthResponse(data.data);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    return applyAuthResponse(data.data);
  };

  const loginWithGoogle = async (name) => {
    const idToken = await signInWithGoogle();
    return exchangeFirebaseToken(idToken, name);
  };

  const logout = () => {
    localStorage.removeItem("chainproof_token");
    localStorage.removeItem("chainproof_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
        firebaseEnabled: isFirebaseConfigured(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
