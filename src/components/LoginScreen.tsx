import React, { useState } from 'react';
import jcLogo from '../assets/logo-colorido-Justica-e-Cidadania.webp';

interface LoginScreenProps {
  onLogin: (email: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleGoogleLogin = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onLogin('atendimento@qrcomunicacao.com.br');
    }, 350);
  };

  return (
    <section className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#F2F2EB] font-['Montserrat',sans-serif]">
      {/* Left hero banner with Editora JC & Revista JC signature green and gold */}
      <div className="hidden md:flex bg-gradient-to-br from-[#003823] via-[#005d3b] to-[#008d70] p-16 text-white flex-col justify-between border-r border-[#B09147]/30 shadow-xl">
        <div>
          <div className="bg-white/95 rounded-xl p-3 shadow-md border border-[#B09147]/40 inline-block">
            <img
              src={jcLogo}
              alt="Justiça & Cidadania"
              className="h-12 w-auto max-w-[280px] object-contain"
            />
          </div>
        </div>

        <div className="max-w-xl my-auto py-12">
          <small className="inline-block text-xs font-bold tracking-[2px] text-[#B09147] bg-[#003823]/60 px-3 py-1 rounded-md uppercase mb-4 border border-[#B09147]/40">
            UMA CENTRAL. DUAS NUVENS.
          </small>
          <h1 className="text-[52px] font-normal leading-[1.15] text-[#FFFFFF] mb-6 font-['STIX_Two_Text',serif]">
            Seus arquivos.<br />
            <span className="italic text-[#d3b466]">Sem fronteiras.</span>
          </h1>
          <p className="text-[17px] leading-[1.65] text-[#f2f2eb]/90 font-light">
            Gerencie, encontre e transfira arquivos entre Microsoft Azure e Backblaze B2 na central de armazenamento unificada da Editora JC.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-[#f3e8ce]/70 pt-6 border-t border-white/10">
          <span>© 2026 Editora JC & Revista Justiça e Cidadania</span>
          <span className="font-mono text-[11px]">v2.6 · STF-Global</span>
        </div>
      </div>

      {/* Right login card */}
      <div className="grid place-items-center p-8 sm:p-12">
        <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-2xl border border-[#e2ded4] shadow-sm">
          <div className="mb-6">
            <img
              src={jcLogo}
              alt="Justiça & Cidadania"
              className="h-11 w-auto max-w-full object-contain"
            />
          </div>

          <h2 className="text-[28px] font-normal text-[#1f2124] mb-2 font-['STIX_Two_Text',serif]">
            Acesse sua conta
          </h2>
          <p className="text-[#555555] leading-[1.6] text-xs mb-8">
            Faça login com sua conta Google institucional para acessar o repositório de arquivos.
          </p>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            disabled={isVerifying}
            className="w-full bg-[#005d3b] hover:bg-[#00472e] active:bg-[#003823] text-white hover:shadow-md transition-all rounded-xl py-3.5 px-5 font-bold shadow-xs flex items-center justify-center gap-3 text-xs cursor-pointer border border-[#B09147]/50 disabled:opacity-50"
          >
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <span className="tracking-wide">
              {isVerifying ? 'Conectando ao Google...' : 'Continuar com Google'}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
