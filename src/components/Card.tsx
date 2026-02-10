import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl shadow-lg p-6 hover:shadow-xl transition ${
        className || ''
      }`}
      {...props}
    >
      {children}
    </div>
  );
}
