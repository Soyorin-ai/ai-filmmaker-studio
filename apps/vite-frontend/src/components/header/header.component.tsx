'use client';

import {type JSX} from 'react';
import {Link} from '@/i18n/navigation.ts';
import {Film, FolderOpen, Wand2, Sparkles} from 'lucide-react';

export function Header(): JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-black/70 backdrop-blur-md">
      {/* 顶部装饰线 */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Film className="w-7 h-7 text-cyan-400 transition-all group-hover:text-cyan-300" style={{ filter: 'drop-shadow(0 0 10px rgba(0,245,255,0.6))' }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AI Filmmaker
            </span>
            <Sparkles className="w-4 h-4 text-purple-400 opacity-60" />
          </div>
        </Link>
        
        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link 
            to="/create/image" 
            className="flex items-center gap-2 px-4 py-2 text-cyan-300/80 hover:text-cyan-100 transition-colors text-sm rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20"
          >
            <Wand2 className="w-4 h-4" />
            <span>生图</span>
          </Link>
          <Link 
            to="/create/video" 
            className="flex items-center gap-2 px-4 py-2 text-purple-300/80 hover:text-purple-100 transition-colors text-sm rounded-lg hover:bg-purple-500/10 border border-transparent hover:border-purple-500/20"
          >
            <Film className="w-4 h-4" />
            <span>生视频</span>
          </Link>
          <Link 
            to="/assets" 
            className="flex items-center gap-2 px-4 py-2 text-emerald-300/80 hover:text-emerald-100 transition-colors text-sm rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20"
          >
            <FolderOpen className="w-4 h-4" />
            <span>素材库</span>
          </Link>
          <Link 
            to="/projects" 
            className="flex items-center gap-2 px-4 py-2 text-amber-300/80 hover:text-amber-100 transition-colors text-sm rounded-lg hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20"
          >
            <FolderOpen className="w-4 h-4" />
            <span>项目</span>
          </Link>
        </nav>
      </div>
      
      {/* 底部装饰线 */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
    </header>
  );
}
