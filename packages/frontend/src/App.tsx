import React, { useEffect, useState } from "react";
import "./index.css";
import Calendar from "../components/calendar";
import Login from "../components/login";
import AuthCallback from "../components/auth-callback";

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("auth_token"));
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorage = () => {
      setIsAuthenticated(Boolean(localStorage.getItem("auth_token")));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const path = typeof window !== "undefined" ? window.location.pathname : "/";

  if (path === "/auth/callback") {
    return <AuthCallback />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="justify-center items-center w-full">
      <Calendar />
    </div>
  );
}

export default App;
