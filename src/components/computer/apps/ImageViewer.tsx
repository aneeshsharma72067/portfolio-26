import { useState } from 'react';
import { Image as ImageIcon, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

type Props = {
  name: string;
  src?: string;
};

export default function ImageViewer({ name, src }: Props) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const rotate = () => setRotation((r) => (r + 90) % 360);

  return (
    <div className="flex flex-col h-full bg-[#121316] select-none text-[11px] text-slate-300">
      {/* Top action toolbar */}
      <div className="h-9 border-b border-white/5 px-4 flex items-center justify-between shrink-0 bg-black/30">
        <div className="flex items-center gap-2">
          <ImageIcon size={13} className="text-emerald-400" />
          <span className="font-medium text-white/95">{name}</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={zoomOut} className="p-1 hover:bg-white/5 rounded transition-colors" title="Zoom Out">
            <ZoomOut size={13} />
          </button>
          <span className="w-10 text-center opacity-70">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-1 hover:bg-white/5 rounded transition-colors" title="Zoom In">
            <ZoomIn size={13} />
          </button>
          <span className="w-px h-3 bg-white/10 mx-1" />
          <button onClick={rotate} className="p-1 hover:bg-white/5 rounded transition-colors" title="Rotate">
            <RotateCw size={13} />
          </button>
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6 relative">
        {src ? (
          <img
            src={src}
            alt={name}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
            className="max-h-full max-w-full object-contain pointer-events-none rounded shadow-2xl bg-black/40 border border-white/5"
          />
        ) : (
          <div className="flex flex-col items-center justify-center opacity-40">
            <ImageIcon size={32} className="mb-2" />
            <span>Image not found</span>
          </div>
        )}
      </div>
    </div>
  );
}
