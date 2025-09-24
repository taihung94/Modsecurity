
import React from 'react';
import Header from './components/Header';
import RuleTester from './components/RuleTester';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 selection:bg-cyan-300 selection:text-cyan-900">
      <div className="relative isolate overflow-hidden">
        <svg
          className="absolute inset-0 -z-10 h-full w-full stroke-cyan-400/20 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 200V.5H200" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth={0} fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)" />
        </svg>
      </div>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <Header />
        <RuleTester />
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        <p>Powered by Google Gemini. Built for educational purposes.</p>
      </footer>
    </div>
  );
};

export default App;
