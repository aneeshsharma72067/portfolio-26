import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import img1 from '../assets/image/gallery/1.png';
import img2 from '../assets/image/gallery/2.jpg';
import img3 from '../assets/image/gallery/3.jpg';
import img4 from '../assets/image/gallery/4.jpg';
import img5 from '../assets/image/gallery/5.jpg';

interface GalleryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const IMAGES = [img1, img2, img3, img4, img5];

const GalleryOverlay = ({ isOpen, onClose }: GalleryOverlayProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);

  // Track screen size for dynamic 3D translations
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for keyboard arrows & escape
  useEffect(() => {
    if (!isOpen) return;

    // Prevent background scrolling while open
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, activeIndex]);

  if (!isOpen) return null;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % IMAGES.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);
  };

  // Swipe/Drag controls
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
    setTouchStart(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragStart === null) return;
    const dragEnd = e.clientX;
    const diff = dragStart - dragEnd;

    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
    setDragStart(null);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-between bg-[#07090e]/95 p-6 backdrop-blur-md select-none animate-[fadeIn_0.25s_ease-out]">
      
      {/* ── Header ── */}
      <div className="flex w-full max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#55ddad] animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#55ddad]">
            Aneesh. Gallery
          </span>
        </div>
        
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:border-[#55ddad]/50 hover:bg-[#55ddad]/10 hover:text-[#55ddad]"
          title="Close (Esc)"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Main Interactive 3D Cylindrical Carousel ── */}
      <div
        className="relative flex w-full max-w-6xl flex-1 items-center justify-between overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* Left Arrow Button (Hidden on pure mobile to keep screen clean) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-4 z-50 hidden sm:flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-black/40 text-white/60 backdrop-blur-sm transition-all hover:border-[#55ddad]/30 hover:bg-[#55ddad]/10 hover:text-white"
        >
          <ChevronLeft size={24} />
        </button>

        {/* 3D Perspective Scene */}
        <div
          className="relative flex h-full w-full items-center justify-center"
          style={{
            perspective: '1200px',
            transformStyle: 'preserve-3d',
          }}
        >
          {IMAGES.map((img, idx) => {
            // Compute wrapped loop offsets (-2, -1, 0, 1, 2)
            let diff = idx - activeIndex;
            if (diff < -2) diff += IMAGES.length;
            if (diff > 2) diff -= IMAGES.length;

            const xOffset = isMobile ? 130 : 280;
            const zOffset = isMobile ? -100 : -180;
            const rotateAngle = isMobile ? 38 : 35;

            // Generate transforms to curve other images around a cylinder
            let transformStr = '';
            let opacityVal = 1;
            let zIndexVal = 10;
            let filterVal = 'none';

            if (diff === 0) {
              transformStr = 'translate3d(0, 0, 80px) rotateY(0deg) scale(1)';
              opacityVal = 1;
              zIndexVal = 10;
              filterVal = 'none';
            } else if (diff === 1) {
              transformStr = `translate3d(${xOffset}px, 0, ${zOffset}px) rotateY(-${rotateAngle}deg) scale(0.82)`;
              opacityVal = 0.65;
              zIndexVal = 8;
              filterVal = 'brightness(0.6) blur(0.5px)';
            } else if (diff === -1) {
              transformStr = `translate3d(-${xOffset}px, 0, ${zOffset}px) rotateY(${rotateAngle}deg) scale(0.82)`;
              opacityVal = 0.65;
              zIndexVal = 8;
              filterVal = 'brightness(0.6) blur(0.5px)';
            } else if (diff === 2) {
              transformStr = `translate3d(${xOffset * 1.6}px, 0, ${zOffset * 2.2}px) rotateY(-${rotateAngle * 1.3}deg) scale(0.65)`;
              opacityVal = 0.2;
              zIndexVal = 4;
              filterVal = 'brightness(0.4) blur(1.5px)';
            } else if (diff === -2) {
              transformStr = `translate3d(-${xOffset * 1.6}px, 0, ${zOffset * 2.2}px) rotateY(${rotateAngle * 1.3}deg) scale(0.65)`;
              opacityVal = 0.2;
              zIndexVal = 4;
              filterVal = 'brightness(0.4) blur(1.5px)';
            }

            return (
              <div
                key={idx}
                className="absolute w-[240px] h-[340px] sm:w-[320px] sm:h-[440px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)] border border-white/10 select-none cursor-grab active:cursor-grabbing transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transform: transformStr,
                  opacity: opacityVal,
                  zIndex: zIndexVal,
                  filter: filterVal,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* 3D Curving reflection shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none z-10" />
                <img
                  src={img}
                  alt={`Gallery Image ${idx + 1}`}
                  className="h-full w-full object-cover pointer-events-none"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

        {/* Right Arrow Button (Hidden on pure mobile to keep screen clean) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 z-50 hidden sm:flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-black/40 text-white/60 backdrop-blur-sm transition-all hover:border-[#55ddad]/30 hover:bg-[#55ddad]/10 hover:text-white"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* ── Footer / Dots Controls ── */}
      <div className="flex flex-col items-center gap-4">
        {/* Count */}
        <span className="font-mono text-xs tracking-widest text-white/40">
          <span className="text-white font-bold">{String(activeIndex + 1).padStart(2, '0')}</span> / {String(IMAGES.length).padStart(2, '0')}
        </span>

        {/* Nav indicators */}
        <div className="flex gap-2">
          {IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'bg-[#55ddad] w-6'
                  : 'bg-white/10 w-1.5 hover:bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Fade-in keyframe helper style */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GalleryOverlay;
