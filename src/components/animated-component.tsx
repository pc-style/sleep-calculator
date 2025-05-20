"use client";

import React, { ReactNode } from "react";
import { motion, Variants } from "framer-motion";

interface AnimatedComponentProps {
  children: ReactNode;
  animation: Variants;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
}

export function AnimatedComponent({
  children,
  animation,
  className = "",
  delay = 0,
  duration,
  once = true,
}: AnimatedComponentProps) {
  // const { theme } = useApp(); // Commented out as it's not currently used
  
  // Customize animation based on theme
  const customAnimation = {
    ...animation,
    visible: {
      ...animation.visible,
      transition: {
        ...(animation.visible && typeof animation.visible === 'object' && 'transition' in animation.visible 
          ? animation.visible.transition as Record<string, unknown>
          : {}),
        delay,
        ...(duration && { duration }),
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      variants={customAnimation}
      whileHover={animation.hover ? "hover" : undefined}
      whileTap={animation.tap ? "tap" : undefined}
      exit={animation.exit ? "exit" : undefined}
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

export function AnimatedList({
  children,
  className = "",
  delay = 0,
  staggerDelay = 0.1,
}: {
  children: ReactNode[];
  className?: string;
  delay?: number;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 24,
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export function AnimatedText({
  text,
  className = "",
  delay = 0,
  staggerDelay = 0.02,
}: {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          className="inline-block"
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 24,
              },
            },
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
