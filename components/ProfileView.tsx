
import React from 'react';
import { User, UserLevel } from '../types';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center mb-12">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 p-1">
            <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden">
               {user.avatarUrl ? (
                 <img src={user.avatarUrl} className="w-full h-full object-cover" />
               ) : (
                 <span className="text-3xl font-bold text-white uppercase">{user.name.substring(0, 2)}</span>
               )}
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
            {user.level}
          </div>
        </div>
        
        <h2 className="text-3xl font-display font-bold text-white mb-1">{user.name}</h2>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Membro desde {new Date(user.joinedAt).toLocaleDateString('pt-BR')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="glass p-6 rounded-[2rem] border border-zinc-800/40">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-2">Total XP</span>
          <span className="text-2xl font-display font-bold text-white">{user.xp} <span className="text-xs text-zinc-500">pts</span></span>
        </div>
        <div className="glass p-6 rounded-[2rem] border border-zinc-800/40">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-2">Check-ins</span>
          <span className="text-2xl font-display font-bold text-white">24 <span className="text-xs text-zinc-500">locais</span></span>
        </div>
      </div>

      <div className="space-y-4 mb-12">
        <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] px-2">Configurações de Conta</h3>
        
        <button className="w-full glass p-5 rounded-2xl border border-zinc-800/40 flex justify-between items-center group hover:border-zinc-700 transition-all">
          <span className="text-sm font-bold text-zinc-300">Editar Perfil</span>
          <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
        </button>

        <button className="w-full glass p-5 rounded-2xl border border-zinc-800/40 flex justify-between items-center group hover:border-zinc-700 transition-all">
          <span className="text-sm font-bold text-zinc-300">Privacidade do Radar</span>
          <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded uppercase">Público</span>
        </button>

        <button 
          onClick={onLogout}
          className="w-full p-5 rounded-2xl border border-rose-900/20 bg-rose-500/5 flex justify-between items-center group hover:bg-rose-500/10 transition-all"
        >
          <span className="text-sm font-bold text-rose-500">Sair da Sessão</span>
          <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>

      <p className="text-center text-[9px] text-zinc-700 font-bold uppercase tracking-[0.3em]">Ferveu v1.0.4 • Beta Access</p>
    </div>
  );
};
