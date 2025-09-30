import { useState, useEffect } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function NotFound() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      const newRipple: Ripple = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100
      };
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 3000);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 overflow-hidden">
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute w-32 h-32 rounded-full bg-red-200 pointer-events-none"
          style={{
            left: `${ripple.x}%`,
            top: `${ripple.y}%`,
            animation: 'ripple 3s ease-out forwards'
          }}
        />
      ))}

      <style>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div className="relative z-10 max-w-2xl w-full text-center">
        <div 
          className="absolute -top-20 -left-20 w-40 h-40 border-2 border-gray-300 rounded-full opacity-20"
          style={{ animation: 'float 6s ease-in-out infinite' }}
        />
        <div 
          className="absolute -bottom-20 -right-20 w-32 h-32 border-2 border-gray-400 opacity-20"
          style={{ 
            animation: 'float 8s ease-in-out infinite, rotate 20s linear infinite',
            animationDelay: '1s'
          }}
        />

        <div 
          className="relative mb-8 transition-all duration-1000"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0) scale(1)' : 'translateY(-30px) scale(0.9)'
          }}
        >
          <h1 className="text-9xl font-bold text-gray-900 tracking-tight relative">
            <span className="inline-block transition-transform duration-300 hover:scale-110">4</span>
            <span 
              className="inline-block transition-transform duration-300 hover:scale-110"
              style={{ animationDelay: '0.1s' }}
            >0</span>
            <span 
              className="inline-block transition-transform duration-300 hover:scale-110"
              style={{ animationDelay: '0.2s' }}
            >4</span>
          </h1>
          <div className="absolute inset-0 text-9xl font-bold text-gray-300 -z-10 blur-md opacity-50">
            404
          </div>
        </div>

        <h2 
          className="text-3xl font-semibold text-gray-900 mb-4 transition-all duration-1000 delay-200"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-20px)'
          }}
        >
          Page not found
        </h2>

        <p 
          className="text-lg text-gray-600 mb-10 leading-relaxed transition-all duration-1000 delay-300"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-20px)'
          }}
        >
          Sorry, we couldn't find the page you're looking for.
        </p>

        <div 
          className="transition-all duration-1000 delay-500"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-20px)'
          }}
        >
          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
          >
            <svg 
              className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go back home
          </a>
        </div>
      </div>
    </div>
  );
}