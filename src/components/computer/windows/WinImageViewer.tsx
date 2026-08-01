import { useState } from 'react';
import {
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Heart,
  Trash2,
  Crop,
} from 'lucide-react';

type Props = {
  name: string;
  src?: string;
};

const FONT = "'Segoe UI VF', 'Segoe UI Variable', 'Segoe UI', sans-serif";

/**
 * WinImageViewer — an image opened in the Windows Photos app.
 *
 * WINDOWS-ONLY. macOS opens it in `MacPreview`, which has a thumbnail sidebar
 * and a light toolbar. The Photos app puts its controls in a FLOATING PILL at
 * the bottom of the frame over a black backdrop — a completely different
 * arrangement, and the reason these aren't one component.
 */
export default function WinImageViewer({ name, src }: Props) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [favourite, setFavourite] = useState(false);

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.25));
  const rotate = () => setRotation((r) => (r + 90) % 360);
  const reset = () => {
    setScale(1);
    setRotation(0);
  };

  const pillBtn =
    'grid h-8 w-8 place-items-center rounded-md text-white/85 transition-colors hover:bg-white/15';

  return (
    <div className="flex h-full flex-col bg-[#101014]" style={{ fontFamily: FONT }}>
      {/* ══════════════════════════════════════════════════════════ header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 bg-[#1f1f1f] px-4">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-[#60cdff]" />
          <span className="truncate text-[13px] font-medium text-white">{name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFavourite((v) => !v)}
            className={`rounded-md p-1.5 transition-colors hover:bg-white/10 ${
              favourite ? 'text-rose-500' : 'text-white/60'
            }`}
            title="Add to favourites"
          >
            <Heart size={15} className={favourite ? 'fill-rose-500' : ''} />
          </button>
          <button className={pillBtn} title="Crop">
            <Crop size={15} />
          </button>
          <button className={pillBtn} title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ viewport */}
      <div className="relative min-h-0 flex-1 overflow-auto bg-black">
        <div className="flex h-full w-full items-center justify-center p-6">
          {src ? (
            <img
              src={src}
              alt={name}
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="pointer-events-none max-h-full max-w-full object-contain shadow-2xl"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/35">
              <ImageIcon size={34} />
              <span className="text-xs">Image not found</span>
            </div>
          )}
        </div>

        {/* ─────────── the floating control pill — the Photos app's signature */}
        <div
          className="absolute inset-x-0 bottom-4 mx-auto flex w-fit items-center gap-1 rounded-lg px-2 py-1.5"
          style={{
            background: 'rgba(43, 43, 43, 0.88)',
            backdropFilter: 'blur(30px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(30px) saturate(1.5)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 12px 34px rgba(0,0,0,0.55)',
          }}
        >
          <button onClick={zoomOut} className={pillBtn} title="Zoom out">
            <ZoomOut size={15} />
          </button>
          <button
            onClick={reset}
            className="w-14 rounded-md px-1 py-1 text-center text-[11.5px] text-white/80 transition-colors hover:bg-white/15"
            title="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <button onClick={zoomIn} className={pillBtn} title="Zoom in">
            <ZoomIn size={15} />
          </button>
          <span className="mx-1 h-4 w-px bg-white/15" />
          <button onClick={rotate} className={pillBtn} title="Rotate">
            <RotateCw size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
