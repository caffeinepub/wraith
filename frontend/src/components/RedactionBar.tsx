import React from 'react';

interface RedactionBarProps {
  width?: string;
  className?: string;
}

export default function RedactionBar({ width = 'w-24', className = '' }: RedactionBarProps) {
  return (
    <span
      className={`inline-block h-4 bg-ops-bg rounded-none select-none ${width} ${className}`}
      aria-hidden="true"
    />
  );
}
