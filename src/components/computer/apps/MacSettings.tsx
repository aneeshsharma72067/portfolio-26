import { useState } from 'react';
import { SKINS } from '@/os/skins';
import type { SkinId } from '@/os/types';
import {
  Search,
  Wifi,
  Bluetooth,
  Globe,
  Battery,
  Sliders,
  Accessibility,
  Palette,
  Sparkles,
  Monitor,
  Bell,
  Info,
  RefreshCw,
  HardDrive,
  ChevronRight,
  User,
  Settings as SettingsIcon
} from 'lucide-react';

type Props = {
  activeSkinId: SkinId;
  onSkinChange: (id: SkinId) => void;
};

export default function MacSettings({ activeSkinId, onSkinChange }: Props) {
  const [selectedTab, setSelectedTab] = useState<'general' | 'appearance' | 'about'>('general');

  const handleClearCache = () => {
    try {
      localStorage.removeItem('portfolio-os-skin');
      localStorage.removeItem('portfolio-windows-layout');
      window.location.reload();
    } catch {
      alert('Unable to access storage.');
    }
  };

  const sidebarCategories = [
    { id: 'wifi', name: 'Wi-Fi', icon: Wifi, color: 'bg-blue-500' },
    { id: 'bluetooth', name: 'Bluetooth', icon: Bluetooth, color: 'bg-blue-600' },
    { id: 'network', name: 'Network', icon: Globe, color: 'bg-sky-500' },
    { id: 'battery', name: 'Battery', icon: Battery, color: 'bg-emerald-500' },
    { id: 'general', name: 'General', icon: Sliders, color: 'bg-blue-500', isTab: true },
    { id: 'accessibility', name: 'Accessibility', icon: Accessibility, color: 'bg-blue-500' },
    { id: 'appearance', name: 'Appearance', icon: Palette, color: 'bg-indigo-500', isTab: true },
    { id: 'intelligence', name: 'Apple Intelligence & Siri', icon: Sparkles, color: 'bg-purple-500' },
    { id: 'control', name: 'Control Center', icon: Sliders, color: 'bg-slate-400' },
    { id: 'displays', name: 'Displays', icon: Monitor, color: 'bg-blue-500' },
    { id: 'wallpaper', name: 'Wallpaper', icon: Palette, color: 'bg-cyan-500' },
    { id: 'notifications', name: 'Notifications', icon: Bell, color: 'bg-rose-500' },
  ];

  return (
    <div className="flex h-full bg-[#1e1e24]/90 text-xs select-none backdrop-blur-3xl text-white/90" style={{ fontFamily: "'SF Pro', -apple-system, sans-serif" }}>
      {/* macOS System Settings Left Sidebar */}
      <div className="w-56 border-r border-white/10 bg-black/20 shrink-0 flex flex-col p-2.5 gap-2 overflow-y-auto">
        <div className="relative flex items-center mb-1">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-black/30 border border-white/10 rounded-md px-2.5 py-1 pl-7 text-[11px] text-white placeholder-white/40 outline-none focus:border-sky-400"
          />
          <Search className="absolute left-2 text-white/40" size={12} />
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 border border-white/20 flex items-center justify-center text-white font-bold text-xs shadow-md">
            <User size={18} className="text-white/80" />
          </div>
          <div className="flex flex-col truncate">
            <span className="font-semibold text-white truncate text-[12px]">Aneesh Sharma</span>
            <span className="text-[10px] text-white/50 truncate">Apple Account</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-[11px]">
          <span className="text-white/80 font-medium truncate">Software Update Available</span>
          <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
        </div>

        <div className="space-y-0.5 mt-1">
          {sidebarCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = (cat.isTab && selectedTab === cat.id) || (cat.id === 'general' && selectedTab === 'general');
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === 'appearance' || cat.id === 'general') {
                    setSelectedTab(cat.id as 'general' | 'appearance');
                  }
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-all ${
                  isSelected ? 'bg-[#007aff] text-white font-medium shadow-md' : 'hover:bg-white/10 text-white/80'
                }`}
              >
                <div className={`w-5 h-5 rounded-md ${cat.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                  <Icon size={12} />
                </div>
                <span className="truncate">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Settings Detail Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black/10">
        <div className="h-9 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-black/10 text-xs">
          <div className="flex items-center gap-1.5 text-white/50">
            <button className="p-1 rounded hover:bg-white/10 disabled:opacity-30" title="Back">
              <span>‹</span>
            </button>
            <button className="p-1 rounded hover:bg-white/10 disabled:opacity-30" title="Forward">
              <span>›</span>
            </button>
          </div>
          <span className="font-semibold text-white/90">General</span>
          <div className="w-10" />
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex flex-col items-center justify-center text-center py-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white shadow-xl mb-3 border border-white/20">
              <SettingsIcon size={36} />
            </div>
            <h1 className="text-lg font-bold text-white mb-1">General</h1>
            <p className="text-[11px] text-white/50 max-w-md leading-relaxed">
              Manage your overall setup and preferences for Mac, such as software updates, system layouts, device language, AirDrop, and more.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
            <button
              onClick={() => setSelectedTab('about')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-slate-500 flex items-center justify-center text-white">
                  <Info size={14} />
                </div>
                <span className="font-medium text-white text-[12.5px]">About</span>
              </div>
              <ChevronRight size={14} className="text-white/40" />
            </button>

            <button className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-slate-500 flex items-center justify-center text-white">
                  <RefreshCw size={14} />
                </div>
                <span className="font-medium text-white text-[12.5px]">Software Update</span>
              </div>
              <ChevronRight size={14} className="text-white/40" />
            </button>

            <button className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-slate-500 flex items-center justify-center text-white">
                  <HardDrive size={14} />
                </div>
                <span className="font-medium text-white text-[12.5px]">Storage</span>
              </div>
              <ChevronRight size={14} className="text-white/40" />
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Palette size={16} className="text-sky-400" />
              <h2 className="font-semibold text-white text-[13px]">Operating System Layouts</h2>
            </div>
            <p className="text-[11px] text-white/50 leading-normal">
              Select your active simulated OS desktop environment. Switches wallpapers, panels, dock configurations, and window chrome.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {(Object.keys(SKINS) as SkinId[]).map((id) => {
                const skin = SKINS[id];
                const isSelected = activeSkinId === id;
                return (
                  <button
                    key={id}
                    onClick={() => onSkinChange(id)}
                    className={`flex flex-col items-start text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#007aff]/20 border-[#007aff] text-white ring-1 ring-[#007aff]'
                        : 'bg-black/20 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-white capitalize text-[12px]">{skin.label}</span>
                      {isSelected && (
                        <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-[#007aff] text-white font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-white/40 mb-2">{skin.version}</span>
                    <div
                      className="h-2 w-full rounded-md shadow-inner"
                      style={{ background: skin.wallpaper }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-semibold text-white text-[12.5px] mb-0.5">System Maintenance</span>
              <span className="text-[10.5px] text-white/50">Clear virtual cache to restore window bounds and desktop defaults.</span>
            </div>
            <button
              onClick={handleClearCache}
              className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/40 hover:text-white transition-all text-[11px] font-semibold shrink-0"
            >
              Reset Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
