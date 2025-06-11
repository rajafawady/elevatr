'use client';

import React from 'react';
import Link from 'next/link';
import { useNavigation } from '@/hooks/useNavigation';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

interface FastLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  replace?: boolean;
  prefetch?: boolean;
  onHover?: () => void;
  onClick?: () => void;
  disabled?: boolean;
}

export function FastLink({ 
  href, 
  children, 
  className, 
  replace = false, 
  prefetch = true,
  onHover,
  onClick,
  disabled = false,
  ...props 
}: FastLinkProps) {
  const { navigateTo, isActive } = useNavigation();
  const { preloadRoute } = useAppStore();

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    // Call the passed onClick handler
    onClick?.();

    // Let Next.js handle the navigation for better performance
    // But still trigger our state updates
    setTimeout(() => {
      // This will be handled by useNavigation hook
    }, 0);
  };

  const handleMouseEnter = () => {
    if (!disabled && prefetch) {
      preloadRoute(href);
    }
    onHover?.();
  };

  const handleTouchStart = () => {
    // Preload on touch for mobile responsiveness
    if (!disabled && prefetch) {
      preloadRoute(href);
    }
  };

  const isCurrentlyActive = isActive(href);

  if (disabled) {
    return (
      <span 
        className={cn(className, 'cursor-not-allowed opacity-50')}
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      replace={replace}
      prefetch={prefetch}
      className={cn(
        className,
        'transition-all duration-150',
        isCurrentlyActive && 'active-link',
        'hover:scale-[1.02] active:scale-[0.98]'
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      {...props}
    >
      {children}
    </Link>
  );
}
