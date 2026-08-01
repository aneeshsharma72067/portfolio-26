import { useState } from 'react';
import { Image as ImageIcon, ZoomIn, ZoomOut, RotateCw, PenLine, Share } from 'lucide-react';

type Props = {
  name: string;
  src?: string;
};

const FONT = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

/**
 * MacPreview — an image opened in Preview.app.
 *
 * macOS-ONLY. Windows opens it in `WinImageViewer` (the Photos app), which
 * floats a control pill over a black backdrop. Preview is structured
 * differently: a THUMBNAIL SIDEBAR down the left, a toolbar across the top with
 * markup and share buttons, and the image on a mid-grey mat rather than black.
 */
export default function MacPreview({ name, src }: Props) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.25));
  const rotate = () => setRotation((r) => (r + 90) % 360);

  const toolBtn =
    'grid h-7 w-8 place-items-center rounded-md text-white/80 transition-colors hover:bg-white/15';

  return (
    <div className="flex h-full bg-black/15" style={{ fontFamily: FONT }}>
      {/* ═══════════════════════════ thumbnail sidebar — Preview's signature */}
      <div className="flex w-[104px] shrink-0 flex-col gap-2 overflow-y-auto border-r border-white/10 bg-black/25 p-2.5">
        <div className="px-1 text-[9.5px] font-bold uppercase tracking-wider text-white/35">
          Page 1 of 1
        </div>
        <div className="overflow-hidden rounded-md border-2 border-[#0a84ff]">
          {src ? (
            <img src={src} alt="" className="aspect-square w-full object-cover" />
          ) : (
            <div className="grid aspect-square w-full place-items-center bg-white/5 text-white/25">
              <ImageIcon size={18} />
            </div>
          )}
        </div>
        <div className="truncate px-0.5 text-center text-[9.5px] text-white/45">{name}</div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ═══════════════════════════════════════════════════════ toolbar */}
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/10 bg-black/20 px-3">
          <div className="flex items-center gap-1">
            <button className={toolBtn} title="Markup">
              <PenLine size={14} />
            </button>
            <button className={toolBtn} title="Share">
              <Share size={14} />
            </button>
          </div>

          <span className="truncate px-3 text-[12px] font-semibold text-white/90">
            {name}
          </span>

          <div className="flex items-center gap-1">
            <button onClick={zoomOut} className={toolBtn} title="Zoom out">
              <ZoomOut size={14} />
            </button>
            <span className="w-11 text-center text-[11px] text-white/60">
              {Math.round(scale * 100)}%
            </span>
            <button onClick={zoomIn} className={toolBtn} title="Zoom in">
              <ZoomIn size={14} />
            </button>
            <button onClick={rotate} className={toolBtn} title="Rotate">
              <RotateCw size={14} />
            </button>
          </div>
        </div>

        {/* ══════════════════ the mat — mid-grey, not black, as Preview has it */}
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#3a3a3e] p-6">
          {src ? (
            <img
              src={src}
              alt={name}
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              className="pointer-events-none max-h-full max-w-full object-contain shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/35">
              <ImageIcon size={34} />
              <span className="text-xs">Image not found</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
