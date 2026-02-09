import React, { useState } from "react";
import { authService } from "../services/authService";
import { User } from "../types";
import { SgaLogo } from "./icons/SgaLogo";
import Sgalogotipo from "/components/conteudo/imagem/sga_logo.png";

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await authService.login(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || "Erro ao efetuar login.");
    } finally {
      setLoading(false);
    }
  };

  const users = authService.getAvailableUsers();

  return (
    <div className="min-h-screen bg-sga-bg flex font-sans">
      {/* Left Side - Brand & Imagery (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'url("https://static.vecteezy.com/ti/fotos-gratis/t2/25524967-aeroporto-predio-internacional-terminal-correndo-pessoas-para-terra-borrado-fundo-ai-gerado-imagem-foto.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        {/* Gradient Overlay */}
       <div
          className="absolute inset-0 bg-gradient-to-t from-sga-bg via-slate-900/90 to-sga-brand/30 z-10"
          style={{
            "--tw-gradient-stops":
              "var(--tw-gradient-from), rgb(232 232 232 / 90%) var(--tw-gradient-via-position), rgb(43 108 176)",
          }}
        ></div>

        <div className="relative z-20 flex flex-col justify-end p-16 h-full text-white">
          <div className="mb-6">
            <div className="h-50 w-100 p-8 rounded-xl flex items-center justify-center shadow-6xl shadow-white/50 mb-10">
              <img src={Sgalogotipo} alt="SGA Logo" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Excelência Operacional
            </h1>
          </div>
          <p className="text-slate-300 text-sm max-w-md leading-relaxed border-l-4 border-sga-brand pl-4">
            Plataforma integrada para gestão estratégica de portfólio,
            monitoramento de riscos e otimização de recursos da Sociedade
            Gestora de Aeroportos.
          </p>
          <div className="mt-8 pt-8 border-t border-white/10 flex justify-between text-xs text-slate-500 font-medium">
            <span>© 2024 SGA S.A.</span>
            <span>v2.5.0 (Corporate Edition)</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-12 relative bg-sga-bg">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="h-16 w-16 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                <SgaLogo className="h-12 w-12" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Centro Corporativo de Projetos e Inovação
            </h2>
            <p className="mt-2 text-sm text-sga-text">
              Autenticação segura SGA
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300"
                >
                  Email Corporativo
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-slate-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-sga-border rounded-lg leading-5 bg-sga-surface text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sga-brand focus:border-sga-brand sm:text-sm transition-all"
                    placeholder="nome@sga.ao"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300"
                >
                  Senha
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-slate-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-sga-border rounded-lg leading-5 bg-sga-surface text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sga-brand focus:border-sga-brand sm:text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-sga-brand focus:ring-sga-brand border-gray-600 rounded bg-sga-surface"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-sga-text"
                >
                  Lembrar-me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-sga-brand hover:text-sga-accent transition-colors"
                >
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-900/20 p-4 border border-red-500/20 flex items-start">
                <svg
                  className="h-5 w-5 text-red-500 mt-0.5 mr-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-sga-brand hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sga-brand disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sga-brand/20"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Autenticando...
                  </div>
                ) : (
                  "Acessar Plataforma"
                )}
              </button>
            </div>
          </form>

          {/* Development Hints Toggle */}
          <div className="mt-8 border-t border-sga-border pt-6">
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center justify-center w-full text-xs text-sga-text hover:text-white transition-colors gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              {showHints ? "Ocultar Ferramentas de Teste" : "Ambiente de Teste"}
            </button>

            {showHints && (
              <div className="mt-4 bg-sga-surface rounded-lg p-4 border border-sga-border animate-fadeIn">
                <p className="text-center text-xs text-sga-brand mb-3 font-mono">
                  Senha Padrão: sga2024
                </p>
                <div className="space-y-2">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setEmail(u.email)}
                      className="w-full flex justify-between items-center text-xs text-sga-text bg-sga-bg p-2 rounded hover:bg-slate-700 hover:text-white transition-colors border border-transparent hover:border-sga-border"
                    >
                      <span className="font-semibold">{u.role}</span>
                      <span className="font-mono opacity-75">{u.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
