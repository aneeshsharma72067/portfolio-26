import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import img1 from '../assets/image/gallery/1.webp';
import img2 from '../assets/image/gallery/2.webp';
import img3 from '../assets/image/gallery/3.webp';
import img4 from '../assets/image/gallery/4.webp';
import img5 from '../assets/image/gallery/5.webp';

interface GalleryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const IMAGES = [img1, img2, img3, img4, img5];

const GalleryOverlay = ({ isOpen, onClose }: GalleryOverlayProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [imagesRendered, setImagesRendered] = useState(false);

  // Drag coordinates
  const [mouseDownCoords, setMouseDownCoords] = useState<{ x: number; y: number } | null>(null);
  const [touchStartCoords, setTouchStartCoords] = useState<{ x: number; y: number } | null>(null);

  // Track screen size for dynamic 3D translations
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Defer image loading to keep modal open transition perfectly smooth (no CPU thread lock)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        setImagesRendered(true);
      }, 150);
      return () => {
        clearTimeout(timer);
      };
    } else {
      setImagesRendered(false);
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Listen for keyboard arrows & escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeIndex]);

  if (!isOpen) return null;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % IMAGES.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);
  };

  // Unified Mouse Drag Handling
  const handleMouseDown = (e: React.MouseEvent) => {
    // Avoid default image ghost dragging
    if ((e.target as HTMLElement).tagName === 'IMG') {
      e.preventDefault();
    }
    setMouseDownCoords({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!mouseDownCoords) return;
    
    const diffX = e.clientX - mouseDownCoords.x;
    const diffY = e.clientY - mouseDownCoords.y;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);

    if (distance > 30) {
      // It's a drag slide!
      if (diffX > 50) handlePrev(); // Drag right -> Prev
      else if (diffX < -50) handleNext(); // Drag left -> Next
    } else {
      // It's a click! Close if clicking outside the elements
      const target = e.target as HTMLElement;
      if (target === e.currentTarget) {
        onClose();
      }
    }
    setMouseDownCoords(null);
  };

  // Unified Touch Drag Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartCoords({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartCoords) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartCoords.x - endX;
    const diffY = touchStartCoords.y - endY;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);

    if (distance > 30) {
      // It's a swipe — only act on mostly-horizontal gestures
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 50) handleNext(); // Swipe left -> Next
        else if (diffX < -50) handlePrev(); // Swipe right -> Prev
      }
    } else {
      // It's a tap — close if it landed on the backdrop (not header/carousel/footer)
      const target = e.target as HTMLElement;
      if (target === e.currentTarget) {
        onClose();
      }
    }
    setTouchStartCoords(null);
  };

  // Render into document.body via portal so the overlay escapes the ancestor
  // stacking context (main has `relative z-10`), otherwise the fixed Header
  // (z-50 at root) paints on top of the close button on mobile.
  return createPortal(
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-between bg-[#07090e]/95 p-6 backdrop-blur-md select-none cursor-zoom-out animate-[fadeIn_0.2s_ease-out]"
    >
      
      {/* ── Header ── */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="flex w-full max-w-5xl items-center justify-between cursor-default"
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#55ddad] animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#55ddad]">
            Aneesh. Gallery
          </span>
        </div>
        
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:border-[#55ddad]/50 hover:bg-[#55ddad]/10 hover:text-[#55ddad] cursor-pointer"
          title="Close (Esc or click outside)"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Main Interactive 3D Cylindrical Carousel ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-6xl flex-1 items-center justify-between overflow-hidden cursor-default"
      >
        {/* Left Arrow Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-4 z-50 hidden sm:flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-black/40 text-white/60 backdrop-blur-sm transition-all hover:border-[#55ddad]/30 hover:bg-[#55ddad]/10 hover:text-white cursor-pointer"
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

            const xOffset = isMobile ? 120 : 280;
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
              filterVal = 'brightness(0.55) blur(0.5px)';
            } else if (diff === -1) {
              transformStr = `translate3d(-${xOffset}px, 0, ${zOffset}px) rotateY(${rotateAngle}deg) scale(0.82)`;
              opacityVal = 0.65;
              zIndexVal = 8;
              filterVal = 'brightness(0.55) blur(0.5px)';
            } else if (diff === 2) {
              transformStr = `translate3d(${xOffset * 1.6}px, 0, ${zOffset * 2.2}px) rotateY(-${rotateAngle * 1.3}deg) scale(0.65)`;
              opacityVal = 0.2;
              zIndexVal = 4;
              filterVal = 'brightness(0.35) blur(1.5px)';
            } else if (diff === -2) {
              transformStr = `translate3d(-${xOffset * 1.6}px, 0, ${zOffset * 2.2}px) rotateY(${rotateAngle * 1.3}deg) scale(0.65)`;
              opacityVal = 0.2;
              zIndexVal = 4;
              filterVal = 'brightness(0.35) blur(1.5px)';
            }

            // Lazy-loading helper: Only mount images if close to active frame
            const isNearActive = Math.abs(diff) <= 1;
            const shouldRenderImage = imagesRendered && isNearActive;

            return (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  if (diff === 1) handleNext();
                  if (diff === -1) handlePrev();
                }}
                className={`absolute w-[240px] h-[340px] sm:w-[320px] sm:h-[440px] rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)] border border-white/10 select-none transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  diff === 0 ? 'cursor-default' : 'cursor-pointer'
                }`}
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
                
                {shouldRenderImage ? (
                  <img
                    src={img}
                    alt={`Gallery Image ${idx + 1}`}
                    className="h-full w-full object-cover pointer-events-none animate-[fadeInImage_0.4s_ease-out]"
                    draggable={false}
                  />
                ) : (
                  // Sleek skeleton loading placeholder to prevent layout freeze
                  <div className="flex h-full w-full flex-col items-center justify-center bg-white/5 text-white/20">
                    {isNearActive ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <div className="h-1.5 w-12 rounded-full bg-white/10" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 z-50 hidden sm:flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-black/40 text-white/60 backdrop-blur-sm transition-all hover:border-[#55ddad]/30 hover:bg-[#55ddad]/10 hover:text-white cursor-pointer"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* ── Footer / Dots Controls ── */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="flex flex-col items-center gap-4 cursor-default"
      >
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
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeIndex
                  ? 'bg-[#55ddad] w-6'
                  : 'bg-white/10 w-1.5 hover:bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* CSS Easing Helpers */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInImage {
          from { opacity: 0; transform: scale(1.05); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default GalleryOverlay;
