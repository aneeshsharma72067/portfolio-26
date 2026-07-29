import { SKINS } from '@/os/skins';
import type { SkinId } from '@/os/types';
import { Sliders, RefreshCw, Palette } from 'lucide-react';

type Props = {
  activeSkinId: SkinId;
  onSkinChange: (id: SkinId) => void;
};

export default function WinSettings({ activeSkinId, onSkinChange }: Props) {
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
    <div className="flex flex-col h-full bg-[#1c1c1c] text-xs select-none text-white/90" style={{ fontFamily: "'Segoe UI VF', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div className="h-10 border-b border-white/10 px-4 flex items-center justify-between shrink-0 bg-[#202020]">
        <div className="flex items-center gap-2">
          <Sliders size={14} className="text-sky-400" />
          <span className="font-semibold text-white">System Settings</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <Palette size={16} className="text-[#0078d4]" />
            <span>Personalization & OS Styles</span>
          </h2>
          <p className="text-[11px] text-white/50 mb-4 leading-normal">
            Switch between simulated layouts. Each operating system features its own panel look, desktop configurations, window styling, and native typography stacks.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(SKINS) as SkinId[]).map((id) => {
              const skin = SKINS[id];
              const isSelected = activeSkinId === id;
              return (
                <button
                  key={id}
                  onClick={() => onSkinChange(id)}
                  className={`flex flex-col items-start text-left p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-[#0078d4]/20 border-[#0078d4] text-white ring-1 ring-[#0078d4]'
                      : 'bg-[#282828] border-white/10 hover:bg-white/10 hover:border-white/20 text-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-semibold text-white capitalize text-[12px]">{skin.label}</span>
                    {isSelected && (
                      <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[#0078d4] text-white font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-white/40 mb-3">{skin.version}</span>
                  <div
                    className="h-2 w-full rounded-md shadow-inner"
                    style={{ background: skin.wallpaper }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <hr className="border-white/10" />

        <div>
          <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
            <RefreshCw size={16} className="text-rose-400" />
            <span>System Maintenance</span>
          </h2>
          <p className="text-[11px] text-white/50 mb-3 leading-normal">
            Reset cache to revert OS choice, active windows, desktop grids, and panel configs to their default state.
          </p>
          <button
            onClick={handleClearCache}
            className="px-4 py-2 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/40 hover:text-white transition-all text-[11px] font-semibold"
          >
            Clear Virtual Cache & Reload
          </button>
        </div>
      </div>
    </div>
  );
}
