import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Github, Linkedin, Twitter, Mail, ArrowUpRight } from 'lucide-react';
import './FlowingMenu.css';

interface FlowingMenuItem {
  link: string;
  text: string;
  handle: string;
}

interface FlowingMenuProps {
  items: FlowingMenuItem[];
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
}

export default function FlowingMenu({
  items = [],
  speed = 15,
  textColor = '#dee2f5',
  bgColor = 'transparent',
  marqueeBgColor = '#55ddad',
  marqueeTextColor = '#0e1320',
  borderColor = 'rgba(222, 226, 245, 0.12)'
}: FlowingMenuProps) {
  return (
    <div className="menu-wrap" style={{ backgroundColor: bgColor }}>
      <nav className="menu">
        {items.map((item, idx) => (
          <MenuItem
            key={idx}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
          />
        ))}
      </nav>
    </div>
  );
}

interface MenuItemProps extends FlowingMenuItem {
  speed: number;
  textColor: string;
  marqueeBgColor: string;
  marqueeTextColor: string;
  borderColor: string;
}

function MenuItem({
  link,
  text,
  handle,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor
}: MenuItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const marqueeInnerWrapRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [repetitions, setRepetitions] = useState(4);

  const animationDefaults = { duration: 0.6, ease: 'expo' };

  const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number) => {
    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  const distMetric = (x: number, y: number, x2: number, y2: number) => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
  };

  const setupMarquee = () => {
    if (!marqueeInnerRef.current) return;

    const marqueeContent = marqueeInnerRef.current.querySelector('.marquee__part') as HTMLElement;
    if (!marqueeContent) return;

    // Use fallback estimate if offsetWidth is 0 during initial render/font-load
    const contentWidth = marqueeContent.offsetWidth || (text.length * 12 + 60);

    if (animationRef.current) {
      animationRef.current.kill();
    }

    animationRef.current = gsap.to(marqueeInnerRef.current, {
      x: -contentWidth,
      duration: speed,
      ease: 'none',
      repeat: -1
    });
  };

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;

      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee__part') as HTMLElement;
      if (!marqueeContent) return;

      const contentWidth = marqueeContent.offsetWidth || (text.length * 12 + 60);
      const viewportWidth = window.innerWidth;

      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);
  }, [text]);

  useEffect(() => {
    const timer = setTimeout(setupMarquee, 100);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [text, repetitions, speed]);

  const handleMouseEnter = (ev: React.MouseEvent) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerWrapRef.current) return;
    
    // Recalculate size and restart animation on hover to guarantee accurate scroll bounds
    setupMarquee();

    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerWrapRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerWrapRef.current], { y: '0%' }, 0);
  };

  const handleMouseLeave = (ev: React.MouseEvent) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerWrapRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerWrapRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  const getSocialIcon = (label: string) => {
    const name = label.toLowerCase();
    if (name.includes('github')) return <Github size={18} className="mx-4 text-current shrink-0" />;
    if (name.includes('linkedin')) return <Linkedin size={18} className="mx-4 text-current shrink-0" />;
    if (name.includes('twitter') || name.includes('x')) return <Twitter size={18} className="mx-4 text-current shrink-0" />;
    if (name.includes('email') || name.includes('mail')) return <Mail size={18} className="mx-4 text-current shrink-0" />;
    return null;
  };

  return (
    <div className="menu__item" ref={itemRef} style={{ borderColor }}>
      <a
        className="menu__item-link"
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ color: textColor }}
      >
        <span className="font-headline text-lg font-bold text-on-surface">
          {text}
        </span>
        <span className="flex items-center gap-3">
          <span className="font-body text-sm italic text-outline">
            {handle}
          </span>
          <ArrowUpRight
            size={16}
            className="text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </a>
      <div className="marquee" ref={marqueeRef} style={{ backgroundColor: marqueeBgColor }}>
        <div className="marquee__inner-wrap" ref={marqueeInnerWrapRef}>
          <div className="marquee__inner" ref={marqueeInnerRef} aria-hidden="true">
            {Array.from({ length: repetitions }).map((_, idx) => (
              <div className="marquee__part" key={idx} style={{ color: marqueeTextColor }}>
                <span className="font-headline text-base font-black tracking-wider">{text}</span>
                {getSocialIcon(text)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
