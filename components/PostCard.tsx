
import React from 'react';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike }) => {
  const timeAgo = Math.floor((Date.now() - post.timestamp) / 60000);

  return (
    <div className="glass rounded-[2.5rem] overflow-hidden border border-zinc-800/40 mb-8 premium-shadow transition-all hover:border-zinc-700/60">
      {/* Header */}
      <div className="p-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-zinc-600/30 overflow-hidden flex items-center justify-center text-[10px] font-bold text-zinc-400">
            {post.userName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100">{post.userName}</h4>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{post.userLevel}</span>
              <span className="text-[12px] text-zinc-600">•</span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{timeAgo}m atrás</span>
            </div>
          </div>
        </div>
        <div className="px-3 py-1 bg-zinc-900/60 rounded-full border border-zinc-800">
           <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">@{post.placeName}</span>
        </div>
      </div>

      {/* Media Content */}
      <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden group">
        <img 
          src={post.imageUrl} 
          alt="Moment content" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
      </div>

      {/* Body & Actions */}
      <div className="p-6">
        <p className="text-sm text-zinc-300 leading-relaxed font-medium mb-5 italic">
          "{post.content}"
        </p>
        
        <div className="flex justify-between items-center">
          <button 
            onClick={() => onLike(post.id)}
            className="flex items-center gap-2 group/like"
          >
            <div className="p-2.5 rounded-full border border-zinc-800 group-hover/like:bg-rose-500/10 group-hover/like:border-rose-500/30 transition-all">
              <svg className="w-4 h-4 text-zinc-500 group-hover/like:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-[11px] font-black text-zinc-500">{post.likes}</span>
          </button>

          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-[#050505] bg-zinc-800" />
            ))}
            <div className="w-6 h-6 rounded-full border-2 border-[#050505] bg-zinc-900 flex items-center justify-center text-[8px] font-black text-zinc-500">
              +8
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
