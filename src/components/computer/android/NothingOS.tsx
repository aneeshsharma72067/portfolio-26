/**
 * NothingOS — the complete Nothing Phone mobile shell.
 *
 * Mounted only on mobile viewports (< 768px) when the user navigates to /computer.
 *
 * Design system: Nothing OS 4.0 — curved borders (rounded corners),
 * touch gestures (swipe down from top for Quick Settings, swipe up from bottom for Home / close app,
 * swipe inward from left/right edge to go back).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import './nothing.css';

import NothingStatusBar from './NothingStatusBar';
import NothingNavBar from './NothingNavBar';
import NothingQuickSettings from './NothingQuickSettings';
import NothingHomeScreen from './NothingHomeScreen';
import {
  NothingAppProjects,
  NothingAppAbout,
  NothingAppExperience,
  NothingAppSkills,
  NothingAppContact,
  NothingAppTerminal,
  NothingAppSettings,
} from './NothingApps';

type NothingAppId =
  | 'projects'
  | 'about'
  | 'experience'
  | 'skills'
  | 'contact'
  | 'terminal'
  | 'settings';

type Props = {
  onNavigate: (path: string) => void;
};

const APP_TITLES: Record<NothingAppId, string> = {
  projects: 'PROJECTS',
  about: 'ABOUT',
  experience: 'EXPERIENCE',
  skills: 'STACK',
  contact: 'CONTACT',
  terminal: 'TERMINAL',
  settings: 'SETTINGS',
};

export default function NothingOS({ onNavigate }: Props) {
  const [activeApp, setActiveApp] = useState<NothingAppId | null>(null);
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  // Touch gesture state
  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
      setDate(
        now
          .toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })
          .toUpperCase()
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const openApp = useCallback((id: string) => {
    setActiveApp(id as NothingAppId);
  }, []);

  const closeApp = useCallback(() => setActiveApp(null), []);

  /* ── Touch Gesture Controls (Swipe Down QuickSettings, Swipe Up Home, Edge Swipe Back) ── */
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current || e.changedTouches.length === 0) return;

    const startX = touchStartPos.current.x;
    const startY = touchStartPos.current.y;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const duration = Date.now() - touchStartPos.current.time;
    touchStartPos.current = null;

    if (duration > 500) return; // Too slow for a swipe gesture

    const screenWidth = window.innerWidth;

    // Swipe down from top 20% of screen -> Open Quick Settings
    if (startY < 120 && deltaY > 60 && Math.abs(deltaX) < 80) {
      setQuickSettingsOpen(true);
      return;
    }

    // Swipe up from bottom 15% of screen -> Go Home (Close active app)
    if (startY > window.innerHeight - 100 && deltaY < -60 && Math.abs(deltaX) < 80) {
      if (quickSettingsOpen) {
        setQuickSettingsOpen(false);
      } else if (activeApp) {
        closeApp();
      }
      return;
    }

    // Edge swipe (left or right edge inward > 50px) -> Back gesture
    if (activeApp && (startX < 30 && deltaX > 50) || (startX > screenWidth - 30 && deltaX < -50)) {
      closeApp();
      return;
    }
  };

  const renderApp = () => {
    switch (activeApp) {
      case 'projects':
        return <NothingAppProjects />;
      case 'about':
        return <NothingAppAbout />;
      case 'experience':
        return <NothingAppExperience />;
      case 'skills':
        return <NothingAppSkills />;
      case 'contact':
        return <NothingAppContact />;
      case 'terminal':
        return <NothingAppTerminal onExit={closeApp} />;
      case 'settings':
        return <NothingAppSettings onNavigate={onNavigate} />;
      default:
        return null;
    }
  };

  const rootStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: '#000000',
    fontFamily: "'Space Grotesk', sans-serif",
    color: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none',
    overflow: 'hidden',
  };

  const appHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid #2E2E2E',
    flexShrink: 0,
  };

  const backButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#999999',
    cursor: 'pointer',
    padding: '4px 0',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  };

  const appTitleStyle: React.CSSProperties = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '10px',
    color: '#555555',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  };

  return (
    <div 
      style={rootStyle}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Status bar */}
      <div
        style={{ flexShrink: 0, cursor: 'pointer' }}
        onClick={() => setQuickSettingsOpen(true)}
      >
        <NothingStatusBar />
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {activeApp === null ? (
          <NothingHomeScreen time={time} date={date} onOpenApp={openApp} />
        ) : (
          <div
            className="nos-scale-in"
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: '#000000',
            }}
          >
            <div style={appHeaderStyle}>
              <button onClick={closeApp} style={backButtonStyle}>
                <ArrowLeft size={16} strokeWidth={1.5} />
                BACK
              </button>
              <span style={appTitleStyle}>
                {APP_TITLES[activeApp]}
              </span>
              <div style={{ width: 60 }} />
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              {renderApp()}
            </div>
          </div>
        )}
      </div>

      {/* Quick settings overlay */}
      <NothingQuickSettings
        open={quickSettingsOpen}
        onClose={() => setQuickSettingsOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Bottom gesture bar */}
      <div 
        style={{ flexShrink: 0, cursor: 'pointer' }}
        onClick={() => {
          if (quickSettingsOpen) setQuickSettingsOpen(false);
          else if (activeApp) closeApp();
        }}
      >
        <NothingNavBar />
      </div>
    </div>
  );
}
