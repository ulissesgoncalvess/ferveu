
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (name: string, email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsAuthenticating(true);
    setTimeout(() => {
      onLogin(name, email || `${name.toLowerCase()}@ferveu.app`);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-rose-500/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-500/5 blur-[120px] rounded-full animate-pulse delay-700" />

      <div className="w-full max-w-sm z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="mb-12 text-center">
          <h1 className="font-display text-6xl font-bold tracking-[-0.06em] text-white mb-2">
            FERVEU<span className="text-rose-500">.</span>
          </h1>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Sinta o pulso da cidade</p>
        </div>

        {!isAuthenticating ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group relative">
              <label className="absolute -top-2 left-4 px-1 bg-[#050505] text-[9px] font-black text-zinc-500 uppercase tracking-widest z-10">
                Nome de Usuário
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Leo Rolê"
                className="w-full bg-transparent border border-zinc-800 rounded-2xl px-6 py-5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/5 transition-all font-medium"
              />
            </div>

            {isRegister && (
              <div className="group relative animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="absolute -top-2 left-4 px-1 bg-[#050505] text-[9px] font-black text-zinc-500 uppercase tracking-widest z-10">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-transparent border border-zinc-800 rounded-2xl px-6 py-5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/5 transition-all font-medium"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-white text-black font-bold py-5 rounded-2xl uppercase text-[11px] tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-30 mt-4"
            >
              {isRegister ? 'Criar Conta' : 'Acessar Radar'}
            </button>

            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="w-full py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors"
            >
              {isRegister ? 'Já tenho acesso' : 'Quero me cadastrar'}
            </button>

            <p className="text-center text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed mt-6">
              Ao entrar, você concorda em compartilhar sua <br/> vibe em tempo real com a comunidade.
            </p>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-zinc-800 rounded-full" />
              <div className="absolute inset-0 border-t-2 border-rose-500 rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">
                {isRegister ? 'CRIANDO PERFIL...' : 'Sincronizando Pulso...'}
              </p>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-2 italic">Acessando hotspots em São Paulo</p>
            </div>
          </div>
        )}
      </div>

      {/* Decorative footer */}
      <div className="absolute bottom-12 flex gap-4 opacity-20">
        <div className="w-1 h-1 bg-white rounded-full" />
        <div className="w-1 h-1 bg-white rounded-full" />
        <div className="w-1 h-1 bg-white rounded-full" />
      </div>
    </div>
  );
};
