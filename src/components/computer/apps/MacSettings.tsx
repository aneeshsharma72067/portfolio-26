import { useState } from 'react';
import {
  Search,
  Wifi,
  Bluetooth,
  Globe,
  Battery,
  Sliders,
  Accessibility,
  Palette,
  Monitor,
  Bell,
  Info,
  RefreshCw,
  HardDrive,
  ChevronRight,
  User,
  Settings as SettingsIcon,
} from 'lucide-react';
import { SKINS, SKIN_ORDER } from '@/os/skins';
import type { SkinId } from '@/os/types';

type Props = {
  activeSkinId: SkinId;
  onSkinChange: (id: SkinId) => void;
};

/** Sidebar rows. Only `general` and `appearance` open a real pane. */
const CATEGORIES = [
  { id: 'wifi', name: 'Wi-Fi', icon: Wifi, colour: 'bg-blue-500' },
  { id: 'bluetooth', name: 'Bluetooth', icon: Bluetooth, colour: 'bg-blue-600' },
  { id: 'network', name: 'Network', icon: Globe, colour: 'bg-sky-500' },
  { id: 'battery', name: 'Battery', icon: Battery, colour: 'bg-emerald-500' },
  { id: 'general', name: 'General', icon: Sliders, colour: 'bg-slate-500' },
  { id: 'appearance', name: 'Appearance', icon: Palette, colour: 'bg-indigo-500' },
  { id: 'accessibility', name: 'Accessibility', icon: Accessibility, colour: 'bg-blue-500' },
  { id: 'displays', name: 'Displays', icon: Monitor, colour: 'bg-blue-500' },
  { id: 'notifications', name: 'Notifications', icon: Bell, colour: 'bg-rose-500' },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

/**
 * MacSettings — macOS System Settings.
 *
 * macOS-only: the Windows equivalent (`WinSettings`) is a separate component
 * with its own layout, so neither has to compromise for the other.
 */
export default function MacSettings({ activeSkinId, onSkinChange }: Props) {
  const [category, setCategory] = useState<CategoryId>('appearance');

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
  const hasPane = category === 'general' || category === 'appearance';

  return (
    <div
      className="flex h-full select-none bg-[#1e1e24]/85 text-xs text-white/90"
      style={{ fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* ══════════════════════════════════════════════ Translucent sidebar */}
      <div className="flex w-56 shrink-0 flex-col gap-2 overflow-y-auto border-r border-white/10 bg-black/20 p-2.5">
        <div className="relative mb-1 flex items-center">
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-md border border-white/10 bg-black/30 px-2.5 py-1 pl-7 text-[11px] text-white placeholder-white/40 outline-none focus:border-sky-400"
          />
          <Search className="absolute left-2 text-white/40" size={12} />
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/5 p-2">
          <div className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-gradient-to-br from-slate-600 to-slate-800">
            <User size={17} className="text-white/80" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[12px] font-semibold text-white">Aneesh Sharma</span>
            <span className="truncate text-[10px] text-white/50">Apple Account</span>
          </div>
        </div>

        <div className="mt-1 space-y-0.5">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const selected = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-all ${
                  selected ? 'bg-[#0a84ff] font-medium text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <div
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-md ${c.colour} text-white shadow-sm`}
                >
                  <Icon size={12} />
                </div>
                <span className="truncate text-[12px]">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════ Detail pane */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-black/10">
        <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/10 px-4 text-[11.5px]">
          <div className="flex items-center gap-1 text-white/45">
            <span className="rounded px-1.5 py-0.5 hover:bg-white/10">‹</span>
            <span className="rounded px-1.5 py-0.5 hover:bg-white/10">›</span>
          </div>
          <span className="font-semibold text-white/90">{active.name}</span>
          <div className="w-10" />
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {!hasPane ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-[12px] text-white/45">
              Nothing to configure here on a portfolio.
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center py-1 text-center">
                <div className="mb-3 grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-xl">
                  {category === 'appearance' ? <Palette size={32} /> : <SettingsIcon size={32} />}
                </div>
                <h1 className="mb-1 text-[17px] font-bold text-white">{active.name}</h1>
                <p className="max-w-md text-[11.5px] leading-relaxed text-white/50">
                  {category === 'appearance'
                    ? 'Choose which computer boots, and how this desktop looks.'
                    : 'Software updates, storage and information about this Mac.'}
                </p>
              </div>

              {category === 'appearance' && (
                <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div>
                    <h2 className="text-[13px] font-semibold text-white">Operating system</h2>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-white/50">
                      Each computer is a separate desktop with its own shell, file manager and
                      window style. Switching restarts it, so open windows are closed.
                    </p>
                  </div>

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
                              ? 'border-[#0a84ff] bg-[#0a84ff]/20 ring-1 ring-[#0a84ff]'
                              : 'border-white/10 bg-black/20 hover:border-white/25 hover:bg-white/10'
                          }`}
                        >
                          <div className="mb-1 flex w-full items-center justify-between">
                            <span className="text-[12.5px] font-semibold text-white">
                              {skin.label}
                            </span>
                            {selected && (
                              <span className="rounded-full bg-[#0a84ff] px-2 py-0.5 text-[9.5px] font-bold text-white">
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
              )}

              {category === 'general' && (
                <>
                  <div className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    <Row icon={Info} title="About" detail={SKINS[activeSkinId].version} />
                    <Row icon={RefreshCw} title="Software Update" detail="Up to date" />
                    <Row icon={HardDrive} title="Storage" detail="112 GB of 512 GB used" />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex min-w-0 flex-col pr-4">
                      <span className="mb-0.5 text-[12.5px] font-semibold text-white">
                        Erase All Content and Settings
                      </span>
                      <span className="text-[11px] leading-relaxed text-white/50">
                        Clears the saved OS choice and reloads the desktop from defaults.
                      </span>
                    </div>
                    <button
                      onClick={handleClearCache}
                      className="shrink-0 rounded-lg border border-rose-500/40 bg-rose-500/20 px-3.5 py-1.5 text-[11px] font-semibold text-rose-300 transition-all hover:bg-rose-500/40 hover:text-white"
                    >
                      Erase…
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** One inert settings row — macOS's standard grouped list item. */
function Row({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Info;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between p-3.5 transition-colors hover:bg-white/5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-slate-500 text-white">
          <Icon size={13} />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[12.5px] font-medium text-white">{title}</span>
          <span className="truncate text-[10.5px] text-white/45">{detail}</span>
        </div>
      </div>
      <ChevronRight size={14} className="shrink-0 text-white/35" />
    </div>
  );
}
