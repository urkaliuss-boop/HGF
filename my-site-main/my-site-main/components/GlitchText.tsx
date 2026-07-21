import React from 'react';

interface GlitchTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  align?: 'left' | 'center';
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, as: Tag = 'h2', className = '', align = 'center' }) => {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';
  
  return (
    <div className={`mb-12 ${alignClass} ${className}`}>
      <Tag className="font-heading text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        {text}
      </Tag>
      <div className={`h-1.5 w-24 bg-gradient-to-r from-primary-600 to-indigo-500 mt-4 rounded-full ${align === 'center' ? 'mx-auto' : ''}`}></div>
    </div>
  );
};

export default GlitchText;