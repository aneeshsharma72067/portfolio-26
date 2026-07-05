import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight scroll-reveal hook using IntersectionObserver.
 * Replaces framer-motion's `useInView` — no dependency, fires once.
 * Returns a ref to attach and a boolean that flips true when the element
 * scrolls into view.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  rootMargin = '-80px'
) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // reveal once, then stop observing
        }
      },
      { rootMargin, threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, visible };
}
