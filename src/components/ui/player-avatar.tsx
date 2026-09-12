'use client';

import React from 'react';
import NextImage from 'next/image';
import { D } from '@/lib/design-system';

interface PlayerAvatarProps {
  name: string;
  size?: number;
  color?: string;
  imageUrl?: string;
  className?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function PlayerAvatar({ name, size = 32, color = D.indigo, imageUrl, className = '' }: PlayerAvatarProps) {
  const fontSize = Math.round(size * 0.35);

  if (imageUrl) {
    return (
      <div
        className={`shrink-0 overflow-hidden ${className}`}
        style={{ width: size, height: size, borderRadius: '50%', border: `1px solid ${color}44` }}
      >
        <NextImage
          src={imageUrl}
          alt={name}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 inline-flex items-center justify-center select-none ${className}`}
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${color}33, ${color}55)`,
        border: `1px solid ${color}44`,
        fontFamily: D.mono,
        fontSize,
        fontWeight: 700,
        color: color,
        letterSpacing: '0.02em',
      }}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}

export default PlayerAvatar;
