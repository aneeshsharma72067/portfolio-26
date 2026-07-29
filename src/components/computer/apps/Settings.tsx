import { SKINS } from '@/os/skins';
import type { SkinId } from '@/os/types';
import { Sliders, RefreshCw, Palette } from 'lucide-react';

type Props = {
  activeSkinId: SkinId;
  onSkinChange: (id: SkinId) => void;
};

export default function Settings({ activeSkinId, onSkinChange }: Props) {
  // Clear localStorage settings
  const handleClearCache = () => {
    try {
      localStorage.removeItem('portfolio-os-skin');
      localStorage.removeItem('portfolio-windows-layout');
      window.location.reload();
    } catch {
      alert('Unable to access storage.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--os-window-bg)] text-xs select-none" style={{ color: 'var(--os-chrome-text)' }}>
      {/* Top Header */}
      <div className="h-9 border-b border-[var(--os-border)] px-4 flex items-center justify-between shrink-0 bg-black/10">
        <div className="flex items-center gap-2">
          <Sliders size={13} className="text-slate-400" />
          <span className="font-semibold text-white/95">Settings</span>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        
        {/* Section 1: OS Selection */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
            <Palette size={14} className="text-sky-400" />
            <span>Operating System Styles</span>
          </h2>
          <p className="text-[10px] text-white/50 mb-3 leading-normal">
            Switch between simulated layouts. Each operating system features its own panel look, desktop configurations, window styling, and native typography stacks.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(Object.keys(SKINS) as SkinId[]).map((id) => {
              const skin = SKINS[id];
              const isSelected = activeSkinId === id;
              return (
                <button
                  key={id}
                  onClick={() => onSkinChange(id)}
                  className={`flex flex-col items-start text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-[rgba(var(--os-accent),0.12)] border-[rgba(var(--os-accent),0.5)] text-white'
                      : 'bg-black/10 border-[var(--os-border)] hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-semibold text-white capitalize">{skin.label}</span>
                    {isSelected && (
                      <span className="text-[9px] px-1.5 py-0.25 rounded-full bg-[rgba(var(--os-accent),0.3)] text-white border border-[rgba(var(--os-accent),0.5)]">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] opacity-50 mb-2">{skin.version}</span>
                  <div
                    className="h-1.5 w-full rounded"
                    style={{ background: skin.wallpaper }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-[var(--os-border)]" />

        {/* Section 2: Reset options */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
            <RefreshCw size={14} className="text-rose-400" />
            <span>System Maintenance</span>
          </h2>
          <p className="text-[10px] text-white/50 mb-3 leading-normal">
            Reset cache to revert OS choice, active windows, desktop grids, and panel configs to their default state.
          </p>
          <button
            onClick={handleClearCache}
            className="px-3 py-1.5 rounded bg-rose-950/20 border border-rose-800/40 text-rose-300 hover:bg-rose-900/40 hover:text-white transition-all text-[11px] font-semibold"
          >
            Clear Virtual cache & Reload
          </button>
        </div>
      </div>
    </div>
  );
}
