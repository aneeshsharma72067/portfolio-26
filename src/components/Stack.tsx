import { useEffect, useRef, useState } from 'react';
import SectionHeading from './SectionHeading';

/* ─────────────────────────────────────────────────────────────────
 * Stack / Skills — Interactive Neural Net Graph
 *
 * Renders skills as nodes in a connected neural net on HTML5 Canvas.
 * Features:
 *   • Connected structure based on skill relationships.
 *   • Interactive drag & drop of nodes.
 *   • Hover highlight of nodes & active connection wires.
 *   • Energy pulses (charge dots) constantly traveling through connections.
 *   • Mouse hover shoots extra rapid pulses to neighbors.
 *   • Faint dot grid background.
 * ───────────────────────────────────────────────────────────────── */

interface SkillNode {
  id: string;
  label: string;
  group: string;
  // Normalized positions (0 to 1) for responsiveness
  px: number;
  py: number;
  // Current screen-space positions (pixels)
  x: number;
  y: number;
  // Physics velocity for dragging/floating damping
  vx: number;
  vy: number;
  // Floating phase for gentle idle movement
  phase: number;
  // Dimensions for interaction boundary
  width: number;
  height: number;
}

interface SkillLink {
  source: string;
  target: string;
  sourceNode?: SkillNode;
  targetNode?: SkillNode;
}

interface Pulse {
  sourceId: string;
  targetId: string;
  progress: number; // 0 to 1
  speed: number;
  color: string;
}

const NODES_DATA = [
  // Frontend (Left)
  { id: 'js', label: 'JavaScript', group: 'Frontend', px: 0.16, py: 0.25 },
  { id: 'ts', label: 'TypeScript', group: 'Frontend', px: 0.22, py: 0.15 },
  { id: 'react', label: 'React', group: 'Frontend', px: 0.28, py: 0.32 },
  { id: 'next', label: 'Next.js', group: 'Frontend', px: 0.36, py: 0.22 },
  { id: 'vue', label: 'Vue.js', group: 'Frontend', px: 0.12, py: 0.40 },
  { id: 'tailwind', label: 'Tailwind', group: 'Frontend', px: 0.26, py: 0.48 },

  // Mobile (Bottom Left)
  { id: 'rn', label: 'React Native', group: 'Mobile', px: 0.18, py: 0.72 },
  { id: 'expo', label: 'Expo', group: 'Mobile', px: 0.32, py: 0.80 },

  // Backend (Center)
  { id: 'node', label: 'Node.js', group: 'Backend', px: 0.50, py: 0.20 },
  { id: 'express', label: 'Express', group: 'Backend', px: 0.45, py: 0.38 },
  { id: 'nestjs', label: 'NestJS', group: 'Backend', px: 0.55, py: 0.45 },
  { id: 'python', label: 'Python', group: 'Backend', px: 0.50, py: 0.65 },
  { id: 'django', label: 'Django', group: 'Backend', px: 0.42, py: 0.82 },
  { id: 'flask', label: 'Flask', group: 'Backend', px: 0.58, py: 0.80 },

  // Data (Top/Mid Right)
  { id: 'mongo', label: 'MongoDB', group: 'Data', px: 0.74, py: 0.22 },
  { id: 'postgres', label: 'PostgreSQL', group: 'Data', px: 0.84, py: 0.35 },
  { id: 'firestore', label: 'Firestore', group: 'Data', px: 0.72, py: 0.48 },

  // Cloud (Bottom Right)
  { id: 'aws', label: 'AWS', group: 'Cloud', px: 0.82, py: 0.62 },
  { id: 'docker', label: 'Docker', group: 'Cloud', px: 0.70, py: 0.75 },
  { id: 'azure', label: 'Azure', group: 'Cloud', px: 0.86, py: 0.78 },
];

const LINKS_DATA: SkillLink[] = [
  // Frontend
  { source: 'ts', target: 'js' },
  { source: 'react', target: 'js' },
  { source: 'react', target: 'ts' },
  { source: 'next', target: 'react' },
  { source: 'next', target: 'node' },
  { source: 'vue', target: 'js' },
  { source: 'tailwind', target: 'react' },
  { source: 'tailwind', target: 'vue' },
  // Mobile
  { source: 'rn', target: 'react' },
  { source: 'rn', target: 'ts' },
  { source: 'expo', target: 'rn' },
  // Backend
  { source: 'node', target: 'js' },
  { source: 'express', target: 'node' },
  { source: 'nestjs', target: 'node' },
  { source: 'nestjs', target: 'ts' },
  { source: 'django', target: 'python' },
  { source: 'flask', target: 'python' },
  // Data
  { source: 'mongo', target: 'node' },
  { source: 'postgres', target: 'node' },
  { source: 'postgres', target: 'python' },
  { source: 'firestore', target: 'react' },
  { source: 'firestore', target: 'rn' },
  // Cloud
  { source: 'docker', target: 'node' },
  { source: 'docker', target: 'python' },
  { source: 'aws', target: 'docker' },
  { source: 'azure', target: 'docker' },
];

export default function Stack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Build nodes array with screen space mapping
    let nodes: SkillNode[] = NODES_DATA.map((n) => ({
      ...n,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      phase: Math.random() * Math.PI * 2,
      width: 0,
      height: 0,
    }));

    // Setup active linkages
    const links: SkillLink[] = LINKS_DATA.map((l) => {
      const srcNode = nodes.find((n) => n.id === l.source);
      const tgtNode = nodes.find((n) => n.id === l.target);
      return { ...l, sourceNode: srcNode, targetNode: tgtNode };
    });

    let pulses: Pulse[] = [];
    let hoveredIdRef: string | null = null;
    let draggedNode: SkillNode | null = null;

    // Track mouse coordinates relative to canvas
    const mouse = { x: -1000, y: -1000 };

    const resize = () => {
      const parent = containerRef.current;
      if (!parent) return;
      
      // Handle high DPI displays
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = 540 * dpr; // fixed display height
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `540px`;
      ctx.scale(dpr, dpr);

      // Re-map nodes coordinates relative to sizing
      nodes.forEach((n) => {
        n.x = n.px * rect.width;
        n.y = n.py * 540;
      });
    };

    resize();
    window.addEventListener('resize', resize);

    // Setup initial pulses periodically
    const spawnPulse = (srcId: string, tgtId: string) => {
      pulses.push({
        sourceId: srcId,
        targetId: tgtId,
        progress: 0,
        speed: 0.012 + Math.random() * 0.008,
        color: '#55ddad',
      });
    };

    // Auto-pulsing timer
    const pulseTimer = setInterval(() => {
      if (links.length === 0) return;
      const randomLink = links[Math.floor(Math.random() * links.length)];
      if (randomLink.sourceNode && randomLink.targetNode) {
        spawnPulse(randomLink.source, randomLink.target);
      }
    }, 450);

    let rafId = 0;
    let time = 0;

    // Draw and physics loop
    const render = () => {
      time += 0.008;

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width, height);

      // ── 1. Draw Dot Grid Background ──
      const gridSpacing = 28;
      ctx.fillStyle = 'rgba(85, 221, 173, 0.06)'; // very faint mint dots
      for (let x = gridSpacing / 2; x < width; x += gridSpacing) {
        for (let y = gridSpacing / 2; y < height; y += gridSpacing) {
          ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
        }
      }

      // ── 2. Gentle Floating Physics & Hover Dragging ──
      nodes.forEach((n) => {
        if (n === draggedNode) {
          n.x += (mouse.x - n.x) * 0.25;
          n.y += (mouse.y - n.y) * 0.25;
          n.vx = 0;
          n.vy = 0;
        } else {
          // Gentle idle drift using trig function
          const ox = Math.cos(time + n.phase) * 0.08;
          const oy = Math.sin(time + n.phase) * 0.08;
          n.vx += ox;
          n.vy += oy;

          // Damping/friction
          n.vx *= 0.95;
          n.vy *= 0.95;

          n.x += n.vx;
          n.y += n.vy;

          // Keep nodes within boundary safezone
          n.x = Math.max(50, Math.min(width - 50, n.x));
          n.y = Math.max(30, Math.min(height - 30, n.y));
        }
      });

      // ── 3. Draw Wires (Links) ──
      ctx.lineWidth = 1.0;
      links.forEach((l) => {
        if (!l.sourceNode || !l.targetNode) return;
        
        const isRelatedToHover =
          hoveredIdRef === l.source || hoveredIdRef === l.target;

        ctx.beginPath();
        ctx.moveTo(l.sourceNode.x, l.sourceNode.y);
        ctx.lineTo(l.targetNode.x, l.targetNode.y);
        
        if (isRelatedToHover) {
          ctx.strokeStyle = 'rgba(85, 221, 173, 0.35)';
          ctx.shadowColor = '#55ddad';
          ctx.shadowBlur = 4;
        } else {
          ctx.strokeStyle = 'rgba(222, 226, 245, 0.08)';
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
      });
      ctx.shadowBlur = 0; // reset

      // ── 4. Update & Draw Energy Pulses ──
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        const src = nodes.find((n) => n.id === p.sourceId);
        const tgt = nodes.find((n) => n.id === p.targetId);

        if (!src || !tgt) {
          pulses.splice(i, 1);
          continue;
        }

        p.progress += p.speed;

        if (p.progress >= 1.0) {
          pulses.splice(i, 1);
          continue;
        }

        // Interpolate coordinate position
        const px = src.x + (tgt.x - src.x) * p.progress;
        const py = src.y + (tgt.y - src.y) * p.progress;

        // Draw pulsing energy charge
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      ctx.shadowBlur = 0; // reset

      // ── 5. Draw Skill Nodes (Pills) ──
      nodes.forEach((n) => {
        const isHovered = hoveredIdRef === n.id;
        const isNeighbor =
          hoveredIdRef !== null &&
          links.some(
            (l) =>
              (l.source === n.id && l.target === hoveredIdRef) ||
              (l.target === n.id && l.source === hoveredIdRef)
          );

        // Configure typography metrics
        ctx.font = 'bold 11px font-label, Manrope, sans-serif';
        const textWidth = ctx.measureText(n.label.toUpperCase()).width;
        
        // Pill size based on text spacing
        const padX = 12;
        const padY = 8;
        n.width = textWidth + padX * 2 + 10; // plus extra space for status dot
        n.height = 11 + padY * 2;

        const rx = n.x - n.width / 2;
        const ry = n.y - n.height / 2;

        // Draw pill boundary
        ctx.beginPath();
        // Custom roundRect support fallback
        if (ctx.roundRect) {
          ctx.roundRect(rx, ry, n.width, n.height, 6);
        } else {
          ctx.rect(rx, ry, n.width, n.height);
        }

        // Color ramp
        if (isHovered) {
          ctx.fillStyle = '#121620';
          ctx.strokeStyle = '#55ddad';
          ctx.lineWidth = 1.5;
          ctx.shadowColor = '#55ddad';
          ctx.shadowBlur = 6;
        } else if (isNeighbor) {
          ctx.fillStyle = '#0e1320';
          ctx.strokeStyle = 'rgba(85, 221, 173, 0.4)';
          ctx.lineWidth = 1.0;
        } else {
          ctx.fillStyle = '#0e1320';
          ctx.strokeStyle = 'rgba(222, 226, 245, 0.12)';
          ctx.lineWidth = 1.0;
        }
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Draw tiny status dot inside pill
        ctx.beginPath();
        const dotX = rx + padX + 2;
        const dotY = n.y;
        ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isHovered || isNeighbor ? '#55ddad' : 'rgba(85, 221, 173, 0.35)';
        if (isHovered) {
          ctx.shadowColor = '#55ddad';
          ctx.shadowBlur = 5;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw text label
        ctx.fillStyle = isHovered
          ? '#55ddad'
          : isNeighbor
          ? '#dee2f5'
          : 'rgba(222, 226, 245, 0.6)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.label.toUpperCase(), rx + padX + 10, n.y + 0.5);
      });

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    // Mouse interactive handlers
    const getCanvasMousePos = (e: MouseEvent | Touch) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const touch = 'touches' in e ? e.touches[0] : e;
      if (!touch) return;

      const pos = getCanvasMousePos(touch);
      mouse.x = pos.x;
      mouse.y = pos.y;

      if (draggedNode) return;

      // Detect node under cursor
      let foundHoverNode: SkillNode | null = null;
      for (const n of nodes) {
        const hWidth = n.width / 2;
        const hHeight = n.height / 2;
        if (
          pos.x >= n.x - hWidth &&
          pos.x <= n.x + hWidth &&
          pos.y >= n.y - hHeight &&
          pos.y <= n.y + hHeight
        ) {
          foundHoverNode = n;
          break;
        }
      }

      if (foundHoverNode) {
        if (hoveredIdRef !== foundHoverNode.id) {
          hoveredIdRef = foundHoverNode.id;
          setHoveredNodeId(foundHoverNode.id);

          // Shoot quick pulses to all neighbors on hover
          const neighbors = links.filter(
            (l) => l.source === foundHoverNode!.id || l.target === foundHoverNode!.id
          );
          neighbors.forEach((l) => {
            if (l.source === foundHoverNode!.id) {
              spawnPulse(l.source, l.target);
            } else {
              spawnPulse(l.target, l.source);
            }
          });
        }
      } else {
        if (hoveredIdRef !== null) {
          hoveredIdRef = null;
          setHoveredNodeId(null);
        }
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const touch = 'touches' in e ? e.touches[0] : e;
      if (!touch) return;

      const pos = getCanvasMousePos(touch);

      for (const n of nodes) {
        const hWidth = n.width / 2;
        const hHeight = n.height / 2;
        if (
          pos.x >= n.x - hWidth &&
          pos.x <= n.x + hWidth &&
          pos.y >= n.y - hHeight &&
          pos.y <= n.y + hHeight
        ) {
          draggedNode = n;
          break;
        }
      }
    };

    const handlePointerUp = () => {
      draggedNode = null;
    };

    // Attach mouse listeners
    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);

    // Touch support for mobile devices
    canvas.addEventListener('touchmove', handlePointerMove, { passive: true });
    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      clearInterval(pulseTimer);
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('touchmove', handlePointerMove);
      canvas.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, []);

  return (
    <section id="stack" className="mt-28 w-full select-none">
      <SectionHeading eyebrow="Toolkit" title="Neural Net" accent="stack." />

      <p className="font-body text-sm leading-relaxed text-on-surface-variant max-w-2xl mb-8">
        Interactive visualization of my engineering toolset. Drag nodes to reshape, hover a skill to track its dependencies, and watch energy charges travel along connected pathways.
      </p>

      {/* Canvas container with relative sizing */}
      <div
        ref={containerRef}
        className="w-full relative rounded-soft border border-outline-variant/30 bg-surface-container-low/20 overflow-hidden"
        style={{ height: '540px' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block cursor-grab active:cursor-grabbing"
        />

        {/* Floating tooltip/details block */}
        <div className="absolute bottom-4 left-4 pointer-events-none bg-surface-container-high/90 border border-outline-variant/30 rounded p-4 font-mono text-[10px] text-outline shadow-floating max-w-xs transition-opacity duration-300">
          <p className="text-white font-bold mb-1.5 uppercase tracking-wider">&gt; Network Status</p>
          <p>Charge Flow: <span className="text-primary font-bold">Active</span></p>
          <p>Connectivity: <span className="text-blue-300">Dense Grouping</span></p>
          {hoveredNodeId ? (
            <p className="mt-2 text-white">
              Inspecting Node:{' '}
              <span className="text-primary font-bold">
                {NODES_DATA.find((n) => n.id === hoveredNodeId)?.label}
              </span>
            </p>
          ) : (
            <p className="mt-2 text-outline/50 italic">Hover a node to inspect dependencies</p>
          )}
        </div>
      </div>
    </section>
  );
}
