import React, { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';

export default function SummerGlow() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // 35 particles: mixture of vibrant green/gold leaves and warm glowing sun dust
    const newParticles = Array.from({ length: 35 }).map((_, i) => {
      const isLeaf = Math.random() > 0.45;
      const sizeVal = isLeaf ? Math.random() * 14 + 10 : Math.random() * 8 + 4;
      return {
        id: i,
        type: isLeaf ? 'leaf' : 'glow',
        left: Math.random() * 100 + '%',
        animationDuration: Math.random() * 12 + 12 + 's', // Smooth, organic falling speed
        animationDelay: Math.random() * -15 + 's', // Negative delay so they start already spread across the screen
        opacity: isLeaf ? Math.random() * 0.45 + 0.35 : Math.random() * 0.6 + 0.3,
        size: sizeVal + 'px',
        color: isLeaf 
          ? (Math.random() > 0.6 
              ? '#84cc16' // lime-500
              : Math.random() > 0.3 
                ? '#22c55e' // green-500
                : '#eab308') // yellow-500 (gold leaf)
          : '#fef08a', // yellow-200 (warm sun dust)
        rotation: Math.random() * 360,
      };
    });
    setParticles(newParticles);
  }, []);

  return (
    <>
      <style>{`
        @keyframes driftLeaf {
          0% { 
            transform: translateY(-10vh) translateX(0) rotate(var(--start-rot)); 
          }
          33% { 
            transform: translateY(30vh) translateX(30px) rotate(calc(var(--start-rot) + 120deg)); 
          }
          66% { 
            transform: translateY(70vh) translateX(-20px) rotate(calc(var(--start-rot) + 240deg)); 
          }
          100% { 
            transform: translateY(110vh) translateX(10px) rotate(calc(var(--start-rot) + 360deg)); 
          }
        }
        @keyframes twinkleGlow {
          0%, 100% { opacity: 0.2; transform: translateY(-10vh) scale(0.8); }
          50% { opacity: 0.8; transform: translateY(50vh) scale(1.2); }
        }
        .summer-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 40;
          overflow: hidden;
        }
        /* Top sun glow simulation */
        .summer-sun-flare {
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 400px;
          background: radial-gradient(circle, rgba(253, 224, 71, 0.08) 0%, rgba(251, 146, 60, 0.02) 50%, transparent 80%);
          filter: blur(40px);
          pointer-events: none;
          z-index: 1;
        }
        .summer-particle {
          position: absolute;
          top: -40px;
          user-select: none;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .summer-leaf-node {
          animation-name: driftLeaf;
        }
        .summer-glow-dot {
          background-color: currentColor;
          border-radius: 50%;
          box-shadow: 0 0 12px 4px rgba(254, 240, 138, 0.4);
          filter: blur(0.5px);
          animation-name: driftLeaf;
        }
      `}</style>
      
      <div className="summer-container">
        <div className="summer-sun-flare" />
        {particles.map(p => (
          p.type === 'leaf' ? (
            <Leaf
              key={p.id}
              className="summer-particle summer-leaf-node"
              fill="currentColor" /* Added fill to make leaves solid and beautifully colored */
              style={{
                left: p.left,
                animationDuration: p.animationDuration,
                animationDelay: p.animationDelay,
                opacity: p.opacity,
                width: p.size,
                height: p.size,
                color: p.color,
                '--start-rot': `${p.rotation}deg`,
              } as React.CSSProperties}
            />
          ) : (
            <div
              key={p.id}
              className="summer-particle summer-glow-dot"
              style={{
                left: p.left,
                animationDuration: p.animationDuration,
                animationDelay: p.animationDelay,
                opacity: p.opacity,
                width: p.size,
                height: p.size,
                color: p.color,
                '--start-rot': `${p.rotation}deg`,
              } as React.CSSProperties}
            />
          )
        ))}
      </div>
    </>
  );
}
