"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-left" | "fade-right" | "zoom-in" | "flip-up" | "blur-in";
  delay?: number;
  duration?: number;
}

export function AnimatedSection({
  children,
  className = "",
  animation = "fade-up",
  delay = 0,
  duration = 800,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const transforms: Record<string, { from: React.CSSProperties; to: React.CSSProperties }> = {
    "fade-up": {
      from: { opacity: 0, transform: "translateY(50px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    },
    "fade-left": {
      from: { opacity: 0, transform: "translateX(-50px)" },
      to: { opacity: 1, transform: "translateX(0)" },
    },
    "fade-right": {
      from: { opacity: 0, transform: "translateX(50px)" },
      to: { opacity: 1, transform: "translateX(0)" },
    },
    "zoom-in": {
      from: { opacity: 0, transform: "scale(0.85)" },
      to: { opacity: 1, transform: "scale(1)" },
    },
    "flip-up": {
      from: { opacity: 0, transform: "perspective(600px) rotateX(15deg) translateY(30px)" },
      to: { opacity: 1, transform: "perspective(600px) rotateX(0deg) translateY(0)" },
    },
    "blur-in": {
      from: { opacity: 0, filter: "blur(10px)" },
      to: { opacity: 1, filter: "blur(0)" },
    },
  };

  const { from, to } = transforms[animation];
  const style: React.CSSProperties = {
    ...(visible ? to : from),
    transition: `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
    transitionDelay: `${delay}ms`,
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

export function AnimatedCard({
  children,
  className = "",
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
        transition: `all 700ms cubic-bezier(0.16, 1, 0.3, 1)`,
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {children}
    </div>
  );
}
