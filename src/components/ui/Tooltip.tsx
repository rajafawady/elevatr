import React from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <span
      className={`relative inline-block ${className ?? ''}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {children}
      {visible && (
        <span className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-white text-xs whitespace-nowrap shadow-lg pointer-events-none animate-fade-in">
          {content}
        </span>
      )}
    </span>
  );
};
