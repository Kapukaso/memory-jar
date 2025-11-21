import React from 'react';
import { Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <header className="text-center mb-8">
      <div className="inline-flex items-center justify-center p-4 bg-pastel-white-pink/40 backdrop-blur-md rounded-full shadow-lg border border-white/50">
        <Sparkles className="w-8 h-8 text-pastel-peach mr-3" />
        <h1 className="text-3xl font-bold text-slate-700 tracking-wide drop-shadow-sm">
          Memory Jar
        </h1>
      </div>
    </header>
  );
};

export default Header;
