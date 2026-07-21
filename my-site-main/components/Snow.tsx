import React, { useEffect, useState } from 'react';

export default function Snow() {
  const [flakes, setFlakes] = useState<any[]>([]);

  useEffect(() => {
    // Уменьшили количество до 25 (чтобы не рябило)
    const newFlakes = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      // Увеличили время падения: от 15 до 25 секунд (очень медленно)
      animationDuration: Math.random() * 10 + 15 + 's', 
      animationDelay: Math.random() * 5 + 's',
      // Сделали очень прозрачными: от 0.1 до 0.3
      opacity: Math.random() * 0.2 + 0.1,             
      size: Math.random() * 6 + 4 + 'px' // Чуть меньше размер
    }));
    setFlakes(newFlakes);
  }, []);

  return (
    <>
      <style>{`
        @keyframes snowfall {
          0% { transform: translateY(-10vh) translateX(0); }
          100% { transform: translateY(110vh) translateX(20px); }
        }
        .snow-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 40; /* Ниже меню и модалок */
          overflow: hidden;
        }
        .snowflake {
          position: absolute;
          top: -20px;
          color: white;
          user-select: none;
          animation-name: snowfall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          filter: blur(1px); /* Легкое размытие для мягкости */
        }
        /* В светлой теме - еле заметный серый */
        html:not(.dark) .snowflake {
            color: #cbd5e1; 
        }
      `}</style>
      
      <div className="snow-container">
        {flakes.map(flake => (
          <div
            key={flake.id}
            className="snowflake"
            style={{
              left: flake.left,
              animationDuration: flake.animationDuration,
              animationDelay: flake.animationDelay,
              opacity: flake.opacity,
              fontSize: flake.size
            }}
          >
            ❄
          </div>
        ))}
      </div>
    </>
  );
}
