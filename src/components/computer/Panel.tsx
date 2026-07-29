import { useState, useEffect, useRef } from 'react';
import { FaApple } from 'react-icons/fa6';
import { BsWifi, BsSearch, BsSliders } from 'react-icons/bs';
import {
  Folder,
  Settings,
  FileText,
  LogOut,
  ChevronDown,
  Volume2,
  Wifi,
  Battery,
  Apple,
} from 'lucide-react';
import type { Skin, SkinId, WindowState } from '@/os/types';
import { resolveIcon } from '@/os/icons';

type Props = {
  skin: Skin;
  skinId: SkinId;
  onSkinChange: (id: SkinId) => void;
  onNavigate: (path: string) => void;
  windows: WindowState[];
  activeWindowId: string | null;
  onFocusWindow: (id: string) => void;
  onMinimizeWindow: (id: string) => void;
  onOpenApp: (app: 'files' | 'settings' | 'photos') => void;
};

// Simple Clock hook to avoid duplicate timers
function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

// OS Logo Components as SVGs
const WindowsLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-sky-400">
    <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zM10.8 12.45H24v11.55l-13.2-1.95v-9.6z" />
  </svg>
);

const FedoraLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current text-blue-500">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.11 8.8h-2.22v2.22H15.1v2.22H12.9v4.44H10.7v-4.44H8.46v-2.22H10.7V8.58c0-1.84 1.49-3.33 3.33-3.33h1.08v2.22h-1.08c-.61 0-1.11.5-1.11 1.11V10.8h2.22v2.22z" />
  </svg>
);

const KaliLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-cyan-400">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm-1-3.5c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1.45.45 1 1v4c0 .55-.45 1-1 1z" />
  </svg>
);

const ArchLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2 text-[#1793d1]">
    <path d="M12 3L2 21h20L12 3z" />
    <path d="M12 12l-4 6h8l-4-6z" />
  </svg>
);

export default function Panel({
  skin,
  skinId,
  onSkinChange,
  onNavigate,
  windows,
  activeWindowId,
  onFocusWindow,
  onMinimizeWindow,
  onOpenApp,
}: Props) {
  const time = useClock();
  const [startOpen, setStartOpen] = useState(false);
  const startMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (startMenuRef.current && !startMenuRef.current.contains(e.target as Node)) {
        setStartOpen(false);
      }
    };
    if (startOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [startOpen]);

  const toggleAppWindow = (win: WindowState) => {
    const isFocused = win.id === activeWindowId && !win.minimized;
    if (isFocused) {
      onMinimizeWindow(win.id);
    } else {
      onFocusWindow(win.id);
    }
  };

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  // Render OS switcher list inside Start/Launcher menus
  const renderOsSwitcher = () => (
    <div className="mt-4 border-t border-white/10 pt-3">
      <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">Switch OS Look</div>
      <div className="grid grid-cols-5 gap-1.5">
        {(['windows', 'mac', 'fedora', 'kali', 'arch'] as SkinId[]).map((id) => (
          <button
            key={id}
            onClick={() => {
              onSkinChange(id);
              setStartOpen(false);
            }}
            className={`flex flex-col items-center gap-1 p-1.5 rounded transition-colors text-[10px] text-center ${
              skinId === id ? 'bg-white/15 text-white' : 'hover:bg-white/5 text-white/70'
            }`}
          >
            {id === 'windows' && <WindowsLogo />}
            {id === 'mac' && <Apple className="w-4 h-4 text-white" />}
            {id === 'fedora' && <FedoraLogo />}
            {id === 'kali' && <KaliLogo />}
            {id === 'arch' && <ArchLogo />}
            <span className="capitalize">{id}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // ------------------------------------------------------------- WINDOWS 11
  if (skin.panel === 'taskbar') {
    return (
      <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-between px-3 z-[9998] select-none backdrop-blur-md"
        style={{ background: 'var(--os-panel-bg)', borderTop: '1px solid var(--os-border)', color: 'var(--os-panel-text)' }}>
        
        {/* Left Side */}
        <div className="w-32 flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs opacity-70 hover:opacity-100 cursor-pointer">
            <span className="text-[14px]">⛅</span>
            <span>72°F</span>
          </div>
        </div>

        {/* Center: Pinned + Running Apps */}
        <div className="flex items-center gap-1">
          {/* Start Button */}
          <button
            onClick={() => setStartOpen(!startOpen)}
            className={`p-2 rounded hover:bg-white/10 transition-colors flex items-center justify-center ${startOpen ? 'bg-white/10' : ''}`}
          >
            <WindowsLogo />
          </button>

          {/* Files Pinned App */}
          <button onClick={() => onOpenApp('files')} className="p-2 rounded hover:bg-white/10 transition-colors">
            <Folder className="w-5 h-5 text-yellow-500" />
          </button>

          {/* Settings Pinned App */}
          <button onClick={() => onOpenApp('settings')} className="p-2 rounded hover:bg-white/10 transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
          </button>

          {/* Render Active Windows */}
          {windows.map((win) => {
            const Icon = resolveIcon(win.app === 'files' ? 'Folder' : win.app === 'settings' ? 'Settings' : 'FileText');
            const isActive = win.id === activeWindowId && !win.minimized;
            return (
              <button
                key={win.id}
                onClick={() => toggleAppWindow(win)}
                className={`p-2 rounded flex flex-col items-center justify-center relative hover:bg-white/10 transition-all ${
                  isActive ? 'bg-white/5' : ''
                }`}
                title={win.title}
              >
                <Icon className={`w-5 h-5 ${win.app === 'files' ? 'text-yellow-500' : 'text-sky-400'}`} />
                <span className={`absolute bottom-0 h-0.5 rounded-full transition-all ${
                  isActive ? 'w-3 bg-sky-400' : win.minimized ? 'w-1 bg-white/40' : 'w-1.5 bg-white/70'
                }`} />
              </button>
            );
          })}
        </div>

        {/* Right Side: System Tray / Date & Time */}
        <div className="w-32 flex items-center justify-end gap-3 text-right text-xs">
          <div className="flex items-center gap-1.5 opacity-70">
            <Wifi size={13} />
            <Volume2 size={13} />
            <Battery size={13} />
          </div>
          <div className="flex flex-col text-[11px] leading-tight cursor-pointer hover:bg-white/5 p-1 rounded">
            <span>{formattedTime}</span>
            <span className="text-[9px] opacity-60">{formattedDate}</span>
          </div>
        </div>

        {/* Start Menu Popup */}
        {startOpen && (
          <div ref={startMenuRef} className="absolute bottom-14 left-1/2 -translate-x-1/2 w-96 rounded-lg p-5 z-[9999] border backdrop-blur-xl shadow-2xl flex flex-col animate-fade-in"
            style={{ background: 'var(--os-panel-bg)', borderColor: 'var(--os-border)' }}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-500/25 grid place-items-center font-bold text-sm text-sky-400">A</div>
                <div>
                  <div className="text-xs font-semibold text-white">Aneesh Sharma</div>
                  <div className="text-[10px] text-white/50">Developer Portfolio</div>
                </div>
              </div>
              <button onClick={() => onNavigate('/')} className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors p-1.5 rounded hover:bg-white/5">
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            </div>

            <div className="py-4">
              <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">Pinned Apps</div>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => { onOpenApp('files'); setStartOpen(false); }} className="flex flex-col items-center p-2 rounded hover:bg-white/5 text-xs text-white">
                  <Folder className="w-8 h-8 text-yellow-500 mb-1" />
                  <span>Files</span>
                </button>
                <button onClick={() => { onOpenApp('settings'); setStartOpen(false); }} className="flex flex-col items-center p-2 rounded hover:bg-white/5 text-xs text-white">
                  <Settings className="w-8 h-8 text-slate-400 mb-1" />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {renderOsSwitcher()}
          </div>
        )}
      </div>
    );
  }

  // ------------------------------------------------------------- MACOS SONOMA
  if (skin.panel === 'dock') {
    const activeTitle = windows.find(w => w.id === activeWindowId)?.title;
    return (
      <>
        {/* ═══════════════════════════════════════════════ macOS Top Menubar */}
        <div
          className="absolute top-0 left-0 right-0 h-[25px] flex items-center justify-between px-3 z-[9998] select-none backdrop-blur-xl backdrop-saturate-[1.8]"
          style={{
            background: 'rgba(36, 36, 40, 0.72)',
            borderBottom: '0.5px solid rgba(255,255,255,0.08)',
            color: '#f0f0f5',
            fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            fontSize: '13px',
            fontWeight: 400,
            letterSpacing: '-0.003em',
          }}
        >
          {/* Left: Apple logo + app name + menus */}
          <div className="flex items-center gap-0">
            {/* Apple menu */}
            <button
              onClick={() => setStartOpen(!startOpen)}
              className="flex items-center justify-center w-[30px] h-[25px] hover:bg-white/[0.12] active:bg-white/[0.18] transition-colors rounded-[3px]"
            >
              <FaApple className="w-[15px] h-[15px] text-white opacity-95" />
            </button>

            {/* App name (bold) */}
            <span className="px-2.5 py-[2px] font-semibold text-[13px] tracking-[-0.01em] hover:bg-white/[0.08] rounded-[3px] cursor-default">
              {activeTitle ? 'Finder' : 'Finder'}
            </span>

            {/* Standard macOS menus */}
            {['File', 'Edit', 'View', 'Go', 'Window', 'Help'].map(menu => (
              <span
                key={menu}
                className="px-2.5 py-[2px] text-[13px] hover:bg-white/[0.08] rounded-[3px] cursor-default hidden md:inline-block opacity-[0.88]"
              >
                {menu}
              </span>
            ))}
          </div>

          {/* Right: Status icons + clock */}
          <div className="flex items-center gap-0.5">
            <div className="px-1.5 py-[2px] hover:bg-white/[0.08] rounded-[3px] cursor-default">
              <BsWifi className="w-[14px] h-[14px] opacity-90" />
            </div>
            <div className="px-1.5 py-[2px] hover:bg-white/[0.08] rounded-[3px] cursor-default">
              <BsSearch className="w-[13px] h-[13px] opacity-90" />
            </div>
            {/* Control Center */}
            <div className="px-1.5 py-[2px] hover:bg-white/[0.08] rounded-[3px] cursor-default">
              <BsSliders className="w-[13px] h-[13px] opacity-90" />
            </div>
            {/* Date & Time */}
            <div className="px-2 py-[2px] hover:bg-white/[0.08] rounded-[3px] cursor-default text-[13px]">
              <span className="hidden sm:inline">
                {time.toLocaleDateString('en-US', { weekday: 'short' })}{' '}
                {time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
              </span>
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Apple dropdown menu */}
          {startOpen && (
            <div
              ref={startMenuRef}
              className="absolute top-[26px] left-[2px] w-[260px] rounded-[10px] p-[5px] z-[9999] flex flex-col overflow-hidden"
              style={{
                background: 'rgba(40, 40, 44, 0.88)',
                backdropFilter: 'blur(60px) saturate(1.8)',
                WebkitBackdropFilter: 'blur(60px) saturate(1.8)',
                border: '0.5px solid rgba(255,255,255,0.16)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(0,0,0,0.2)',
              }}
            >
              {/* About This Mac */}
              <button
                className="w-full text-left px-3 py-[5px] text-[13px] rounded-[5px] text-white/90 hover:bg-[#0058d0] hover:text-white transition-colors"
                onClick={() => setStartOpen(false)}
              >
                About This Mac
              </button>

              <div className="my-[4px] mx-3 border-t border-white/[0.12]" />

              {/* System items */}
              <button
                onClick={() => { onOpenApp('settings'); setStartOpen(false); }}
                className="w-full text-left px-3 py-[5px] text-[13px] rounded-[5px] text-white/90 hover:bg-[#0058d0] hover:text-white transition-colors flex items-center justify-between"
              >
                <span>System Settings...</span>
              </button>
              <button
                onClick={() => { onOpenApp('files'); setStartOpen(false); }}
                className="w-full text-left px-3 py-[5px] text-[13px] rounded-[5px] text-white/90 hover:bg-[#0058d0] hover:text-white transition-colors"
              >
                Open Finder
              </button>

              <div className="my-[4px] mx-3 border-t border-white/[0.12]" />

              {/* OS Switcher */}
              <div className="px-3 pt-1 pb-1">
                <div className="text-[11px] font-medium text-white/40 uppercase tracking-wide mb-1.5">Switch Desktop Look</div>
                <div className="grid grid-cols-5 gap-1">
                  {(['windows', 'mac', 'fedora', 'kali', 'arch'] as SkinId[]).map((id) => (
                    <button
                      key={id}
                      onClick={() => {
                        onSkinChange(id);
                        setStartOpen(false);
                      }}
                      className={`flex flex-col items-center gap-0.5 p-1.5 rounded-[6px] text-[9px] text-center transition-colors ${
                        skinId === id ? 'bg-[#0058d0] text-white' : 'hover:bg-white/[0.08] text-white/70'
                      }`}
                    >
                      {id === 'windows' && <WindowsLogo />}
                      {id === 'mac' && <svg className="w-3.5 h-3.5" viewBox="0 0 17 20" fill="currentColor"><path d="M15.642 10.7c-.03-2.99 2.444-4.424 2.555-4.49-1.392-2.034-3.555-2.314-4.327-2.347-1.842-.187-3.596 1.085-4.53 1.085-.934 0-2.38-1.058-3.912-1.03-2.013.03-3.87 1.17-4.906 2.973-2.092 3.628-.536 9.002 1.503 11.945 1.001 1.441 2.19 3.06 3.753 3.002 1.505-.061 2.074-.973 3.893-.973 1.82 0 2.33.973 3.92.943 1.62-.027 2.647-1.47 3.636-2.917 1.147-1.674 1.618-3.294 1.647-3.378-.036-.016-3.162-1.213-3.193-4.813h-.039z" transform="translate(-1.5 -2.5) scale(0.92)" /><path d="M12.845 3.28c.823-1.002 1.38-2.39 1.228-3.78-1.187.048-2.626.792-3.477 1.79-.764.883-1.432 2.295-1.253 3.65 1.324.103 2.674-.674 3.502-1.66z" transform="translate(-1.5 -2.5) scale(0.92)" /></svg>}
                      {id === 'fedora' && <FedoraLogo />}
                      {id === 'kali' && <KaliLogo />}
                      {id === 'arch' && <ArchLogo />}
                      <span className="capitalize leading-none">{id === 'mac' ? 'macOS' : id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="my-[4px] mx-3 border-t border-white/[0.12]" />

              {/* Power options */}
              <button
                className="w-full text-left px-3 py-[5px] text-[13px] rounded-[5px] text-white/90 hover:bg-[#0058d0] hover:text-white transition-colors"
                onClick={() => setStartOpen(false)}
              >
                Sleep
              </button>
              <button
                className="w-full text-left px-3 py-[5px] text-[13px] rounded-[5px] text-white/90 hover:bg-[#0058d0] hover:text-white transition-colors"
                onClick={() => setStartOpen(false)}
              >
                Restart...
              </button>
              <button
                onClick={() => onNavigate('/')}
                className="w-full text-left px-3 py-[5px] text-[13px] rounded-[5px] text-white/90 hover:bg-[#0058d0] hover:text-white transition-colors"
              >
                Shut Down...
              </button>

              <div className="my-[4px] mx-3 border-t border-white/[0.12]" />

              <button
                onClick={() => onNavigate('/')}
                className="w-full text-left px-3 py-[5px] text-[13px] rounded-[5px] text-white/90 hover:bg-[#0058d0] hover:text-white transition-colors"
              >
                Log Out Aneesh...
              </button>
            </div>
          )}
        </div>

        {/* Dock is rendered separately by Computer.tsx via MacOSDock */}
      </>
    );
  }

  // ------------------------------------------------------------- FEDORA / GNOME
  if (skin.panel === 'topbar') {
    return (
      <>
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-3 z-[9998] select-none text-xs font-semibold backdrop-blur-md"
          style={{ background: 'var(--os-panel-bg)', color: 'var(--os-panel-text)' }}>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStartOpen(!startOpen)}
              className={`px-3 py-1 rounded-full hover:bg-white/10 transition-colors flex items-center gap-1.5 ${startOpen ? 'bg-white/10' : ''}`}
            >
              <FedoraLogo />
              <span>Activities</span>
            </button>
            
            <span className="opacity-50">|</span>
            <span className="opacity-90">{windows.find(w => w.id === activeWindowId)?.title ?? 'Desktop'}</span>
          </div>

          <div className="hover:bg-white/10 px-3 py-1 rounded-full cursor-pointer transition-colors">
            {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} {formattedTime}
          </div>

          <div className="flex items-center gap-2 hover:bg-white/10 px-3 py-1 rounded-full cursor-pointer transition-colors">
            <Wifi size={12} />
            <Battery size={12} />
            <ChevronDown size={12} className="opacity-65" />
          </div>
        </div>

        {/* Overview activities menu / Dashboard */}
        {startOpen && (
          <div ref={startMenuRef} className="absolute inset-0 bg-black/60 z-[9999] backdrop-blur-xl flex flex-col justify-center items-center p-10 animate-fade-in">
            <div className="w-full max-w-2xl bg-[#1e1e1e]/90 border border-white/10 rounded-xl p-8 shadow-2xl flex flex-col">
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FedoraLogo />
                    <span>GNOME Shell Overview</span>
                  </h2>
                  <p className="text-xs text-white/50">Manage your system workspaces and settings</p>
                </div>
                <button
                  onClick={() => onNavigate('/')}
                  className="flex items-center gap-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                >
                  <LogOut size={14} />
                  <span>Log Out / Power Off</span>
                </button>
              </div>

              {/* Launcher apps */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <button
                  onClick={() => { onOpenApp('files'); setStartOpen(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all text-white"
                >
                  <Folder className="w-12 h-12 text-blue-400" />
                  <span className="text-sm">Files</span>
                </button>
                <button
                  onClick={() => { onOpenApp('settings'); setStartOpen(false); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all text-white"
                >
                  <Settings className="w-12 h-12 text-slate-400" />
                  <span className="text-sm">Settings</span>
                </button>
              </div>

              {renderOsSwitcher()}

              <button
                onClick={() => setStartOpen(false)}
                className="mt-6 border border-white/15 hover:bg-white/5 text-white/80 py-2 rounded-lg text-xs font-bold transition-all text-center"
              >
                Close Overview
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // ------------------------------------------------------------- KALI / XFCE
  if (skin.panel === 'panel') {
    return (
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-2 z-[9998] select-none text-xs border-b border-sky-900/40"
        style={{ background: 'var(--os-panel-bg)', color: 'var(--os-panel-text)' }}>
        
        {/* Left: Whisker Applications Menu */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStartOpen(!startOpen)}
            className={`p-1.5 rounded hover:bg-sky-500/20 text-cyan-400 flex items-center gap-1 ${startOpen ? 'bg-sky-500/20' : ''}`}
            title="Applications Menu"
          >
            <KaliLogo />
            <span className="font-bold tracking-tight text-white">Applications</span>
          </button>
          <span className="text-sky-900 opacity-60 font-thin">|</span>

          {/* Quick launchers */}
          <button onClick={() => onOpenApp('files')} className="p-1 hover:bg-sky-500/20 rounded text-cyan-400" title="File Manager">
            <Folder size={14} />
          </button>
          <button onClick={() => onOpenApp('settings')} className="p-1 hover:bg-sky-500/20 rounded text-cyan-400" title="Settings Manager">
            <Settings size={14} />
          </button>
        </div>

        {/* Center: Window List (like XFCE Panel taskbar) */}
        <div className="flex items-center gap-1 max-w-[50%] overflow-x-auto select-none no-scrollbar">
          {windows.map((win) => {
            const isActive = win.id === activeWindowId && !win.minimized;
            return (
              <button
                key={win.id}
                onClick={() => toggleAppWindow(win)}
                className={`px-3 py-1 rounded text-[11px] font-mono border transition-all max-w-[120px] truncate ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30'
                    : 'bg-black/35 text-white/60 border-white/5 hover:bg-white/5'
                }`}
              >
                {win.title}
              </button>
            );
          })}
        </div>

        {/* Right: Notification area + clock */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-cyan-400/70">
            <Wifi size={12} />
            <Battery size={12} />
          </div>
          <span className="text-sky-900 opacity-60 font-thin">|</span>
          <span className="font-mono text-cyan-300">{formattedTime}</span>
        </div>

        {/* XFCE Whisker Menu (OS Selection + log out) */}
        {startOpen && (
          <div ref={startMenuRef} className="absolute top-9 left-2 w-80 rounded border shadow-2xl p-4 flex flex-col z-[9999] bg-[#0c0d10]/95 border-sky-900/60 text-cyan-300 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-sky-900/40 mb-3">
              <span className="text-xs text-white">kali-live@linux</span>
              <button onClick={() => onNavigate('/')} className="flex items-center gap-1 text-[11px] text-rose-400 hover:bg-rose-500/10 p-1 rounded transition-colors">
                <LogOut size={12} />
                <span>Log Out</span>
              </button>
            </div>

            <div className="flex flex-col gap-1 py-1">
              <button onClick={() => { onOpenApp('files'); setStartOpen(false); }} className="text-left py-1 px-2 text-xs hover:bg-cyan-500/20 hover:text-white rounded">
                📂 File Manager
              </button>
              <button onClick={() => { onOpenApp('settings'); setStartOpen(false); }} className="text-left py-1 px-2 text-xs hover:bg-cyan-500/20 hover:text-white rounded">
                ⚙️ Settings Manager
              </button>
            </div>

            {renderOsSwitcher()}
          </div>
        )}
      </div>
    );
  }

  // ------------------------------------------------------------- ARCH / I3
  if (skin.panel === 'bar') {
    return (
      <div className="absolute bottom-0 left-0 right-0 h-6 flex items-center justify-between px-2 z-[9998] select-none text-[11px] font-mono"
        style={{ background: 'var(--os-panel-bg)', borderTop: '1px solid var(--os-border)', color: 'var(--os-panel-text)' }}>
        
        {/* Left side: Workspace Switcher */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStartOpen(!startOpen)}
            className="px-1.5 py-0.5 rounded text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-1"
            title="Arch Linux i3 Menu"
          >
            <ArchLogo />
            <span>i3</span>
          </button>
          <span className="opacity-30 px-1">|</span>
          {['1:web', '2:files', '3:config', '4:media'].map((ws, i) => (
            <span
              key={ws}
              className={`px-1.5 py-0.5 border ${
                i === 1 ? 'border-sky-500 text-sky-400 bg-sky-950/20' : 'border-transparent text-white/50'
              }`}
            >
              {ws}
            </span>
          ))}
        </div>

        {/* Center: Focused window title */}
        <div className="text-white/60 truncate max-w-[40%]">
          {windows.find(w => w.id === activeWindowId)
            ? `[Focused: ${windows.find(w => w.id === activeWindowId)?.title}]`
            : '[No Active Window]'}
        </div>

        {/* Right side: i3status info */}
        <div className="flex items-center gap-3">
          <span className="text-white/40">
            <span className="text-sky-400">cpu:</span> 1.5%
          </span>
          <span className="text-white/40">
            <span className="text-sky-400">ram:</span> 1.8G/16G
          </span>
          <span className="text-white/40">
            <span className="text-sky-400">bat:</span> 100%
          </span>
          <span className="text-sky-400 font-bold">{time.toISOString().replace('T', ' ').substring(0, 19)}</span>
        </div>

        {/* Arch i3 Config Menu (OS Selector / Log out) */}
        {startOpen && (
          <div ref={startMenuRef} className="absolute bottom-7 left-2 w-72 rounded p-3 z-[9999] border bg-[#0a0e13] border-cyan-800 text-cyan-400 font-mono">
            <div className="flex items-center justify-between border-b border-cyan-900 pb-1.5 mb-2">
              <span className="text-[10px] text-white/60">$ i3-msg -t get_outputs</span>
              <button onClick={() => onNavigate('/')} className="text-rose-400 hover:underline hover:text-rose-300 text-[10px]">
                exit_i3
              </button>
            </div>
            
            <div className="text-[10px] text-white/50 mb-3">
              Press Mod+Shift+e to exit, or select apps below:
            </div>

            <div className="flex flex-col gap-1 mb-2">
              <button onClick={() => { onOpenApp('files'); setStartOpen(false); }} className="text-left py-0.5 px-1 hover:bg-cyan-950 hover:text-white rounded">
                &gt; launch files
              </button>
              <button onClick={() => { onOpenApp('settings'); setStartOpen(false); }} className="text-left py-0.5 px-1 hover:bg-cyan-950 hover:text-white rounded">
                &gt; launch settings
              </button>
            </div>

            {renderOsSwitcher()}
          </div>
        )}
      </div>
    );
  }

  return null;
}
