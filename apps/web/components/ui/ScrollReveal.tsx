"use client";

import { useEffect, useRef, useState } from "react";

type Animation =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "zoom-out"
  | "flip-up"
  | "blur-in"
  | "slide-up"
  | "slide-left"
  | "slide-right"
  | "rotate-in";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: Animation;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
  stagger?: number;
}

const animationStyles: Record<Animation, { from: string; to: string }> = {
  "fade-up": {
    from: "opacity-0 translate-y-12",
    to: "opacity-100 translate-y-0",
  },
  "fade-down": {
    from: "opacity-0 -translate-y-12",
    to: "opacity-100 translate-y-0",
  },
  "fade-left": {
    from: "opacity-0 translate-x-12",
    to: "opacity-100 translate-x-0",
  },
  "fade-right": {
    from: "opacity-0 -translate-x-12",
    to: "opacity-100 translate-x-0",
  },
  "zoom-in": {
    from: "opacity-0 scale-[0.85]",
    to: "opacity-100 scale-100",
  },
  "zoom-out": {
    from: "opacity-0 scale-110",
    to: "opacity-100 scale-100",
  },
  "flip-up": {
    from: "opacity-0 [transform:perspective(600px)_rotateX(15deg)_translateY(20px)]",
    to: "opacity-100 [transform:perspective(600px)_rotateX(0deg)_translateY(0)]",
  },
  "blur-in": {
    from: "opacity-0 blur-[8px]",
    to: "opacity-100 blur-0",
  },
  "slide-up": {
    from: "opacity-0 translate-y-20",
    to: "opacity-100 translate-y-0",
  },
  "slide-left": {
    from: "opacity-0 translate-x-20",
    to: "opacity-100 translate-x-0",
  },
  "slide-right": {
    from: "opacity-0 -translate-x-20",
    to: "opacity-100 translate-x-0",
  },
  "rotate-in": {
    from: "opacity-0 rotate-6 scale-95",
    to: "opacity-100 rotate-0 scale-100",
  },
};

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 700,
  threshold = 0.15,
  className = "",
  once = true,
  stagger = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const { from, to } = animationStyles[animation];
  const totalDelay = delay + stagger;

  return (
    <div
      ref={ref}
      className={`transition-all ${visible ? to : from} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${totalDelay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}

export function StaggerReveal({
  children,
  animation = "fade-up",
  baseDelay = 0,
  staggerDelay = 100,
  duration = 700,
  className = "",
}: {
  children: React.ReactNode[];
  animation?: Animation;
  baseDelay?: number;
  staggerDelay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <>
      {children.map((child, i) => (
        <ScrollReveal
          key={i}
          animation={animation}
          delay={baseDelay}
          stagger={i * staggerDelay}
          duration={duration}
          className={className}
        >
          {child}
        </ScrollReveal>
      ))}
    </>
  );
}
