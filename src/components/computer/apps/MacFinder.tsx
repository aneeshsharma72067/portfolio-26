import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Grid,
  List,
  ChevronRight,
} from 'lucide-react';
import { lookup, breadcrumbs } from '@/os/fs';
import type { FileNode } from '@/os/types';

import macosFolderIcon from '@/assets/image/icons/macos/folder.png';
import macosSettingsFolderIcon from '@/assets/image/icons/macos/settings-folder.png';
import macosFileIcon from '@/assets/image/icons/macos/file.png';

type Props = {
  initialPath: string;
  onOpenNode: (node: FileNode) => void;
};

export default function MacFinder({ initialPath, onOpenNode }: Props) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [history, setHistory] = useState<string[]>([]);
  const [forwardHistory, setForwardHistory] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const currentNode = useMemo(() => {
    const node = lookup(currentPath);
    if (node && node.kind === 'folder') return node;
    return lookup('/home/aneesh/Desktop')!;
  }, [currentPath]);

  const navigateTo = (path: string) => {
    setHistory((prev) => [...prev, currentPath]);
    setForwardHistory([]);
    setCurrentPath(path);
    setSearchQuery('');
    setSelectedPath(null);
  };

  const navigateBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setForwardHistory((prevStack) => [...prevStack, currentPath]);
    setHistory((prevStack) => prevStack.slice(0, -1));
    setCurrentPath(prev);
    setSearchQuery('');
    setSelectedPath(null);
  };

  const navigateForward = () => {
    if (forwardHistory.length === 0) return;
    const next = forwardHistory[forwardHistory.length - 1];
    setHistory((prevStack) => [...prevStack, currentPath]);
    setForwardHistory((prevStack) => prevStack.slice(0, -1));
    setCurrentPath(next);
    setSearchQuery('');
    setSelectedPath(null);
  };

  const items = useMemo(() => {
    return currentNode.children ?? [];
  }, [currentNode]);

  const breadcrumbList = useMemo(() => breadcrumbs(currentPath), [currentPath]);

  return (
    <div className="flex h-full text-xs overflow-hidden select-none bg-transparent" style={{ color: 'var(--os-chrome-text)', fontFamily: "'SF Pro', -apple-system, sans-serif" }}>
      {/* macOS Finder Translucent Glass Sidebar */}
      <div className="w-48 border-r border-[var(--os-border)] bg-black/15 shrink-0 flex flex-col p-3 gap-2 overflow-y-auto backdrop-blur-md">
        <div className="text-[10px] font-bold opacity-40 uppercase tracking-wider px-2 mb-0.5">Favorites</div>
        {[
          { name: 'AirDrop', path: '/home/aneesh/Desktop', icon: '📡' },
          { name: 'Applications', path: '/home/aneesh/Desktop/Projects', icon: '🚀' },
          { name: 'Desktop', path: '/home/aneesh/Desktop', icon: '🖥️' },
          { name: 'Documents', path: '/home/aneesh/Desktop/Projects', icon: '📄' },
          { name: 'Downloads', path: '/home/aneesh/Desktop', icon: '⤓' },
          { name: 'Pictures', path: '/home/aneesh/Desktop/Gallery', icon: '🖼️' },
        ].map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigateTo(item.path)}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-all ${
                isActive ? 'bg-sky-500/25 text-white font-semibold' : 'hover:bg-white/10 text-white/80'
              }`}
            >
              <span className="text-[13px]">{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </button>
          );
        })}

        <div className="text-[10px] font-bold opacity-40 uppercase tracking-wider px-2 mt-3 mb-0.5">Locations</div>
        <button
          onClick={() => navigateTo('/home/aneesh')}
          className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-all ${
            currentPath === '/home/aneesh' ? 'bg-sky-500/25 text-white font-semibold' : 'hover:bg-white/10 text-white/80'
          }`}
        >
          <span className="text-[13px]">💻</span>
          <span className="truncate">Macintosh HD</span>
        </button>
      </div>

      {/* macOS Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black/10">
        {/* macOS Finder Toolbar */}
        <div className="h-10 border-b border-[var(--os-border)] flex items-center justify-between px-3 gap-2 shrink-0 bg-black/20">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={navigateBack}
                disabled={history.length === 0}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
                title="Back"
              >
                <ArrowLeft size={14} />
              </button>
              <button
                onClick={navigateForward}
                disabled={forwardHistory.length === 0}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
                title="Forward"
              >
                <ArrowRight size={14} />
              </button>
            </div>

            <span className="font-semibold text-white/90 ml-1">{currentNode.name}</span>
          </div>

          {/* macOS View Mode & Search */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/10 rounded-md p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
              >
                <Grid size={13} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
              >
                <List size={13} />
              </button>
            </div>

            <div className="relative flex items-center w-40">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-md px-2.5 py-1 pl-7 outline-none text-xs text-white placeholder-white/40 focus:border-sky-400"
              />
              <Search className="absolute left-2 text-white/40" size={12} />
            </div>
          </div>
        </div>

        {/* macOS Finder Path Bar */}
        <div className="h-6 px-3 flex items-center gap-1 bg-black/20 border-b border-[var(--os-border)] overflow-x-auto text-[10.5px] opacity-70 whitespace-nowrap shrink-0">
          <span>Macintosh HD</span>
          {breadcrumbList.map((segment) => (
            <div key={segment.path} className="flex items-center gap-1">
              <ChevronRight size={10} className="opacity-40" />
              <button onClick={() => navigateTo(segment.path)} className="hover:underline hover:text-white">
                {segment.name}
              </button>
            </div>
          ))}
        </div>

        {/* macOS Grid View */}
        <div className="flex-1 p-4 overflow-y-auto min-h-0 bg-transparent" onClick={() => setSelectedPath(null)}>
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40 py-10">
              <img src={macosFolderIcon} alt="Empty" className="w-14 h-14 mb-2 opacity-50" />
              <span>Folder is empty</span>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-4">
              {items.map((node) => {
                const isSelected = selectedPath === node.path;
                const isImage = node.app === 'image' && node.src;
                const isFolder = node.kind === 'folder';

                let iconSrc = macosFileIcon;
                if (node.path.includes('settings')) iconSrc = macosSettingsFolderIcon;
                else if (isFolder) iconSrc = macosFolderIcon;

                return (
                  <div
                    key={node.path}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPath(node.path);
                    }}
                    onDoubleClick={() => {
                      if (isFolder) navigateTo(node.path);
                      else onOpenNode(node);
                    }}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all cursor-pointer text-center ${
                      isSelected ? 'bg-sky-500/30 ring-1 ring-sky-400' : 'hover:bg-white/10'
                    }`}
                  >
                    {isImage ? (
                      <img src={node.src} alt={node.name} className="w-12 h-12 object-cover rounded-[18%] shadow-md" />
                    ) : (
                      <img src={iconSrc} alt={node.name} className="w-12 h-12 object-cover rounded-[22%] shadow-md" />
                    )}
                    <span className="line-clamp-2 w-full break-words text-[11px] font-medium text-white/90 leading-tight">
                      {node.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col border border-white/10 rounded-lg overflow-hidden bg-black/20">
              {items.map((node) => {
                const isFolder = node.kind === 'folder';
                const isImage = node.app === 'image' && node.src;
                let iconSrc = macosFileIcon;
                if (isFolder) iconSrc = macosFolderIcon;

                return (
                  <div
                    key={node.path}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPath(node.path);
                    }}
                    onDoubleClick={() => {
                      if (isFolder) navigateTo(node.path);
                      else onOpenNode(node);
                    }}
                    className={`flex items-center text-left p-2 border-b border-white/5 last:border-0 cursor-pointer transition-colors ${
                      selectedPath === node.path ? 'bg-sky-500/30 text-white' : 'hover:bg-white/10 text-white/90'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate font-medium">
                      {isImage ? (
                        <img src={node.src} alt={node.name} className="w-4 h-4 object-cover rounded-sm" />
                      ) : (
                        <img src={iconSrc} alt={node.name} className="w-4 h-4 object-cover rounded-sm" />
                      )}
                      <span>{node.name}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
