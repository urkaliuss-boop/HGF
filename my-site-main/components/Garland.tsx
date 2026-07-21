import React from 'react';

const Garland: React.FC = () => {
  return (
    <div className="absolute -top-16 left-0 right-0 w-full h-32 pointer-events-none z-20 flex justify-center overflow-visible">
      <div className="relative w-full max-w-2xl">
        {/* Wire */}
        <svg className="absolute top-0 left-0 w-full h-full text-slate-800 dark:text-slate-600" viewBox="0 0 400 60" preserveAspectRatio="none">
          <path d="M0,0 Q200,60 400,0" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>

        {/* Lights */}
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(9)].map((_, i) => {
            // Calculate position along the curve roughly
            // Quadratic bezier curve logic: simple approximation for visual placement
            const pct = (i + 1) / 10;
            const yDrop = 4 * pct * (1 - pct) * 100; // approximate parabola
            
            // Colors cycle: Red, Gold, Green, Blue
            const colors = [
                'bg-red-500 shadow-red-500/50', 
                'bg-yellow-400 shadow-yellow-400/50', 
                'bg-green-500 shadow-green-500/50',
                'bg-blue-500 shadow-blue-500/50'
            ];
            const colorClass = colors[i % 4];

            return (
              <div 
                key={i}
                className={`absolute w-3 h-3 md:w-4 md:h-4 rounded-full shadow-[0_0_15px_3px_rgba(0,0,0,0.3)] ${colorClass} animate-pulse`}
                style={{
                  left: `${pct * 100}%`,
                  top: `${yDrop * 0.55}%`, // Adjust based on SVG curve depth
                  animationDuration: `${1.5 + i * 0.2}s`,
                  transform: 'translate(-50%, 0)'
                }}
              >
                {/* Socket */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-2 bg-slate-700 dark:bg-slate-500 rounded-sm"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Garland;