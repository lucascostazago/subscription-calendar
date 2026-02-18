import React, { useEffect } from "react";

const AuthCallback: React.FC = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("auth_token", token);
      window.location.replace("/");
    } else {
      window.location.replace("/?error=auth_failed");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 border border-slate-800 p-8 shadow-xl text-center">
        <p className="text-sm text-slate-300 mb-2">
          Finalizando autenticação com Google...
        </p>
        <p className="text-xs text-slate-500">
          Você será redirecionado em instantes.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;

