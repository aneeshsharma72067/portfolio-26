import { useState } from 'react';
import {
  Monitor,
  Palette,
  Wifi,
  Bluetooth,
  Bell,
  Accessibility,
  Info,
  RefreshCw,
  HardDrive,
  ChevronRight,
  Search,
} from 'lucide-react';
import { SKINS, SKIN_ORDER } from '@/os/skins';
import type { SkinId } from '@/os/types';

type Props = {
  activeSkinId: SkinId;
  onSkinChange: (id: SkinId) => void;
};

/** Left-rail categories. Only Personalization and System have real content. */
const CATEGORIES = [
  { id: 'system', name: 'System', icon: Monitor },
  { id: 'personalization', name: 'Personalization', icon: Palette },
  { id: 'network', name: 'Network & internet', icon: Wifi },
  { id: 'bluetooth', name: 'Bluetooth & devices', icon: Bluetooth },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'accessibility', name: 'Accessibility', icon: Accessibility },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

/**
 * WinSettings — Windows 11's Settings app.
 *
 * Windows-only: the macOS equivalent (`MacSettings`) is a separate component
 * with its own layout, so neither has to compromise for the other.
 */
export default function WinSettings({ activeSkinId, onSkinChange }: Props) {
  const [category, setCategory] = useState<CategoryId>('personalization');

  /** Wipes the persisted OS choice and reloads back to the default desktop. */
  const handleClearCache = () => {
    try {
      localStorage.removeItem('portfolio-os-skin');
      window.location.reload();
    } catch {
      /* storage blocked — nothing to clear, so nothing to report */
    }
  };

  const active = CATEGORIES.find((c) => c.id === category)!;

  return (
    <div
      className="flex h-full select-none bg-[#202020] text-xs text-white/90"
      style={{ fontFamily: "'Segoe UI VF', 'Segoe UI Variable', 'Segoe UI', sans-serif" }}
    >
      {/* ══════════════════════════════════════════════════ Left navigation */}
      <div className="flex w-[240px] shrink-0 flex-col gap-1 overflow-y-auto bg-[#252525] p-3">
        <div className="mb-1 flex items-center gap-2.5 rounded-md px-1 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#0078d4] text-[11px] font-bold text-white">
            A
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[12px] font-semibold text-white">Aneesh Sharma</span>
            <span className="truncate text-[10px] text-white/50">Local account</span>
          </div>
        </div>

        <div className="relative mb-2 flex items-center">
          <input
            type="text"
            placeholder="Find a setting"
            className="w-full rounded-md border border-white/10 bg-[#2d2d2d] px-2.5 py-1.5 pl-7 text-[11px] text-white placeholder-white/40 outline-none focus:border-[#0078d4]"
          />
          <Search className="absolute left-2 text-white/40" size={12} />
        </div>

        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const selected = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`relative flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors ${
                selected ? 'bg-white/10 font-medium text-white' : 'text-white/80 hover:bg-white/5'
              }`}
            >
              {selected && (
                <span className="absolute left-0 h-4 w-[3px] rounded-full bg-[#4cc2ff]" />
              )}
              <Icon size={15} className={selected ? 'text-[#4cc2ff]' : 'text-white/70'} />
              <span className="truncate text-[12px]">{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════ Detail pane */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-6">
        <h1 className="mb-5 text-[19px] font-semibold text-white">{active.name}</h1>

        {category === 'personalization' ? (
          <div className="flex flex-col gap-3">
            {/* The OS switcher. Picking one boots that desktop from scratch. */}
            <div className="rounded-lg border border-white/10 bg-[#2b2b2b] p-4">
              <div className="mb-1 flex items-center gap-2">
                <Palette size={15} className="text-[#4cc2ff]" />
                <h2 className="text-[13px] font-semibold text-white">Operating system</h2>
              </div>
              <p className="mb-4 text-[11.5px] leading-relaxed text-white/55">
                Choose which computer to boot. Each one is a separate desktop with its own
                shell, file manager and window style — switching restarts it, so open
                windows are closed.
              </p>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {SKIN_ORDER.map((id) => {
                  const skin = SKINS[id];
                  const selected = activeSkinId === id;
                  return (
                    <button
                      key={id}
                      onClick={() => onSkinChange(id)}
                      className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                        selected
                          ? 'border-[#0078d4] bg-[#0078d4]/20 ring-1 ring-[#0078d4]'
                          : 'border-white/10 bg-[#333333] hover:border-white/25 hover:bg-white/10'
                      }`}
                    >
                      <div className="mb-1 flex w-full items-center justify-between">
                        <span className="text-[12.5px] font-semibold text-white">{skin.label}</span>
                        {selected && (
                          <span className="rounded-full bg-[#0078d4] px-2 py-0.5 text-[9.5px] font-bold text-white">
                            Running
                          </span>
                        )}
                      </div>
                      <span className="mb-2.5 text-[10.5px] text-white/45">{skin.version}</span>
                      <div
                        className="h-8 w-full rounded-md border border-white/10 shadow-inner"
                        style={{ background: skin.wallpaper }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <Row icon={Monitor} title="Background" detail="Windows spotlight" />
            <Row icon={Palette} title="Colors" detail="Dark · Accent Fluent Blue" />
          </div>
        ) : category === 'system' ? (
          <div className="flex flex-col gap-3">
            <Row icon={Info} title="About" detail={SKINS[activeSkinId].version} />
            <Row icon={RefreshCw} title="Windows Update" detail="You're up to date" />
            <Row icon={HardDrive} title="Storage" detail="41.2 GB of 256 GB used" />

            <div className="mt-2 flex items-center justify-between rounded-lg border border-white/10 bg-[#2b2b2b] p-4">
              <div className="flex min-w-0 flex-col pr-4">
                <span className="mb-0.5 text-[12.5px] font-semibold text-white">Reset this PC</span>
                <span className="text-[11px] leading-relaxed text-white/55">
                  Clears the saved OS choice and reloads the desktop from defaults.
                </span>
              </div>
              <button
                onClick={handleClearCache}
                className="shrink-0 rounded-md border border-rose-500/40 bg-rose-500/20 px-3.5 py-2 text-[11px] font-semibold text-rose-300 transition-all hover:bg-rose-500/40 hover:text-white"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-[#2b2b2b] p-8 text-center text-[12px] text-white/45">
            Nothing to configure here on a portfolio.
          </div>
        )}
      </div>
    </div>
  );
}

/** One inert settings row — Windows 11's standard card list item. */
function Row({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Monitor;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#2b2b2b] p-3.5 transition-colors hover:bg-[#323232]">
      <div className="flex min-w-0 items-center gap-3">
        <Icon size={16} className="shrink-0 text-white/70" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[12.5px] font-medium text-white">{title}</span>
          <span className="truncate text-[10.5px] text-white/45">{detail}</span>
        </div>
      </div>
      <ChevronRight size={14} className="shrink-0 text-white/35" />
    </div>
  );
}
