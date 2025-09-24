import React from 'react';
import { ShieldIcon } from './icons/ShieldIcon';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-10">
      <div className="inline-flex items-center justify-center bg-cyan-900/50 rounded-full p-4 mb-4 border border-cyan-500/30">
        <ShieldIcon className="h-12 w-12 text-cyan-400" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-cyan-400">
        ModSecurity AI Analyst
      </h1>
      <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-400">
        Diagnose HTTP requests, identify threats, and generate ModSecurity whitelist rules to resolve false positives.
      </p>
    </header>
  );
};

export default Header;