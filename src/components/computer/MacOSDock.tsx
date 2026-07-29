import React, { useRef, useState, useCallback, useEffect } from 'react';
import { FileText, File } from 'lucide-react';
import type { WindowState } from '@/os/types';

import finderIcon from '@/assets/image/icons/macos/finder.png';
import settingsIcon from '@/assets/image/icons/macos/settings.png';
import photosIcon from '@/assets/image/icons/macos/photos.png';
import folderIcon from '@/assets/image/icons/macos/folder.png';
import githubIcon from '@/assets/image/icons/macos/github.png';

type Props = {
  onOpenApp: (app: 'files' | 'settings') => void;
  windows: WindowState[];
  activeWindowId: string | null;
  onFocusWindow: (id: string) => void;
  onMinimizeWindow: (id: string) => void;
};

type DockApp = {
  id: string;
  name: string;
  iconSrc?: string;
  icon?: React.ReactNode;
  isPinned: boolean;
  appId?: 'files' | 'settings';
  externalUrl?: string;
};

const PINNED_APPS: DockApp[] = [
  {
    id: 'finder',
    name: 'Finder',
    iconSrc: finderIcon,
    isPinned: true,
    appId: 'files',
  },
  {
    id: 'settings',
    name: 'System Settings',
    iconSrc: settingsIcon,
    isPinned: true,
    appId: 'settings',
  },
  {
    id: 'gallery',
    name: 'Photos',
    iconSrc: photosIcon,
    isPinned: true,
  },
  {
    id: 'files_folder',
    name: 'Documents',
    iconSrc: folderIcon,
    isPinned: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    iconSrc: githubIcon,
    isPinned: true,
    externalUrl: 'https://github.com/jiffyaneesh',
  }
];

const BASE_SIZE = 52;
const MAX_SIZE = 76;
const DECAY = 0.15; // Scaling factor for distance

export function MacOSDock({ onOpenApp, windows, activeWindowId, onFocusWindow, onMinimizeWindow }: Props) {
  const dockRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [bouncingId, setBouncingId] = useState<string | null>(null);

  // Map from pinned app IDs to the app types they represent
  const pinnedAppTypes = new Set(PINNED_APPS.filter(p => p.appId).map(p => p.appId));
  const runningUnpinned = windows.filter(w => !pinnedAppTypes.has(w.app as 'files' | 'settings'));
  
  const allItems: DockApp[] = [
    ...PINNED_APPS,
    ...runningUnpinned.map(w => ({
      id: w.id,
      name: w.title || 'App',
      iconSrc: w.app === 'files' ? folderIcon : undefined,
      icon: w.app !== 'files' ? <File className="text-white w-7 h-7" /> : undefined,
      isPinned: false,
    }))
  ];

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dockRef.current) return;
    
    // Direct DOM manipulation for smooth 60fps scaling
    requestAnimationFrame(() => {
      iconRefs.current.forEach((icon) => {
        if (!icon) return;
        
        // Temporarily remove transition to prevent lag behind cursor
        icon.style.transition = 'none';
        
        const rect = icon.getBoundingClientRect();
        const iconCenter = rect.left + rect.width / 2;
        const distance = Math.abs(e.clientX - iconCenter);
        
        const size = Math.max(BASE_SIZE, MAX_SIZE - distance * DECAY);
        
        icon.style.width = `${size}px`;
        icon.style.height = `${size}px`;
      });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    requestAnimationFrame(() => {
      iconRefs.current.forEach((icon) => {
        if (!icon) return;
        // Restore transition for smooth return to base size
        icon.style.transition = 'width 0.2s ease-out, height 0.2s ease-out';
        icon.style.width = `${BASE_SIZE}px`;
        icon.style.height = `${BASE_SIZE}px`;
      });
    });
  }, []);
  
  const handleClick = (item: DockApp) => {
    setBouncingId(item.id);
    setTimeout(() => setBouncingId(null), 800);
    
    if (item.externalUrl) {
      window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (item.appId) {
      onOpenApp(item.appId);
    } else {
      const win = windows.find(w => w.id === item.id);
      if (win) {
        if (win.minimized) {
          onFocusWindow(item.id);
        } else if (activeWindowId === item.id) {
          onMinimizeWindow(item.id);
        } else {
          onFocusWindow(item.id);
        }
      }
    }
  };
  
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes dockBounce {
        0%, 100% { transform: translateY(0); }
        33% { transform: translateY(-16px); }
        66% { transform: translateY(-8px); }
      }
      .dock-bounce {
        animation: dockBounce 0.8s ease-in-out;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[9998]">
      <div 
        ref={dockRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex items-end px-3 pb-2.5 pt-2.5 rounded-[22px] backdrop-blur-3xl"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.20)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35), inset 0 0.5px 1px rgba(255, 255, 255, 0.45)',
        }}
      >
        {allItems.map((item, index) => {
          const showSeparator = index > 0 && !item.isPinned && allItems[index - 1].isPinned;
          const isRunning = item.appId
            ? windows.some(w => w.app === item.appId)
            : windows.some(w => w.id === item.id);
          const isFocused = isRunning && (
            activeWindowId === item.id ||
            (item.appId && windows.find(w => w.app === item.appId)?.id === activeWindowId)
          );
          
          return (
            <React.Fragment key={item.id}>
              {showSeparator && (
                <div className="w-[1px] h-10 bg-white/20 mx-2.5 self-center rounded-full" />
              )}
              
              <div
                className="relative flex flex-col items-center group mx-1.5"
                onMouseEnter={() => setHoveredIndex(index)}
              >
                {/* Tooltip */}
                <div 
                  className={`absolute -top-12 px-3 py-1 rounded-md text-xs text-white font-medium whitespace-nowrap transition-all duration-150 pointer-events-none z-50
                    ${hoveredIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                  style={{
                    backgroundColor: 'rgba(20, 20, 25, 0.75)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    border: '0.5px solid rgba(255,255,255,0.12)',
                    fontFamily: "'SF Pro', -apple-system, sans-serif"
                  }}
                >
                  {item.name}
                  {/* Tooltip triangle pointer */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[rgba(20,20,25,0.75)]" />
                </div>
                
                {/* Icon Container */}
                <div
                  ref={el => { iconRefs.current[index] = el; }}
                  className={`flex items-center justify-center cursor-pointer origin-bottom drop-shadow-md rounded-[22%] overflow-hidden
                    ${bouncingId === item.id ? 'dock-bounce' : ''}`}
                  style={{
                    width: BASE_SIZE,
                    height: BASE_SIZE,
                    willChange: 'width, height'
                  }}
                  onClick={() => handleClick(item)}
                >
                  {item.iconSrc ? (
                    <img
                      src={item.iconSrc}
                      alt={item.name}
                      className="w-full h-full object-contain pointer-events-none drop-shadow-lg rounded-[22%]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[22%] bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-lg">
                      {item.icon}
                    </div>
                  )}
                </div>
                
                {/* Running indicator dot */}
                <div 
                  className={`absolute -bottom-1.5 w-1 h-1 rounded-full transition-opacity duration-300
                    ${isRunning ? 'opacity-100' : 'opacity-0'} 
                    ${isFocused ? 'bg-white' : 'bg-white/50'}`} 
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
