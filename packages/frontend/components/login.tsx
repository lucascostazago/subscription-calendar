import React from "react";

const BACKEND_URL = "http://localhost:3001";

const Login: React.FC = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  return (
    <div className="relative">
      <div className="w-[640px] bg-[#0f0f0f] rounded-3xl border border-white/10 font-mono px-8 py-10 text-center">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Subscription Calendar
            </h1>
            <p className="mt-3 text-sm text-white/60 max-w-[420px]">
              Faça login com sua conta Google para salvar, organizar e
              sincronizar suas assinaturas no seu calendário.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="group flex items-center justify-center gap-3 bg-[#fd6732] px-6 py-3 rounded-3xl text-black text-base font-semibold hover:bg-[#e0572ada] hover:cursor-pointer transition-all duration-300"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-sm font-bold">
              G
            </span>
            <span>Continuar com Google</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default Login;

