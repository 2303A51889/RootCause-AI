import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLMotionProps<'div'> {
  hoverable?: boolean;
  padded?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  hoverable = false,
  padded = true,
  className,
  children,
  ...props
}) => {
  return (
    <motion.div
      whileHover={
        hoverable ? { y: -2, boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.08)' } : undefined
      }
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'bg-white rounded-2xl border border-[#E5E7EB] shadow-soft transition-all duration-200 overflow-hidden',
        padded && 'p-6',
        hoverable && 'cursor-pointer hover:border-slate-300',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
