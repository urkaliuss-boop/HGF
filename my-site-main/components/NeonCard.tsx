import React from 'react';

interface NeonCardProps {
  children: React.ReactNode;
  color?: 'green' | 'blue' | 'red'; 
  className?: string;
  highlight?: boolean;
}

const NeonCard: React.FC<NeonCardProps> = ({ children, className = '', highlight = false }) => {
  // Clean Apple-style Card
  const baseStyle = `
    relative 
    bg-white dark:bg-[#1c1c1e] 
    rounded-[32px] p-8 
    transition-all duration-300 
    border border-transparent
    flex flex-col
  `;
  
  // Highlight adds a subtle border and larger shadow, regular has soft shadow
  const highlightStyle = highlight 
    ? "shadow-apple-hover scale-[1.02] z-10 border-primary-500/10" 
    : "shadow-apple hover:shadow-apple-hover hover:-translate-y-1";

  return (
    <div className={`${baseStyle} ${highlightStyle} ${className}`}>
      {children}
    </div>
  );
};

export default NeonCard;