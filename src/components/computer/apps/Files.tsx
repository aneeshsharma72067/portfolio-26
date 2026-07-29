import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Search,
  Grid,
  List,
  ChevronRight,
  HardDrive,
  Plus,
  Scissors,
  Copy,
  Clipboard,
  FileCheck2,
  Share2,
  ArrowUpDown,
  FolderPlus,
  Trash2,
  Star,
  Download,
  Folder as FolderIcon
} from 'lucide-react';
import { ROOT, lookup, search, breadcrumbs } from '@/os/fs';
import type { FileNode } from '@/os/types';

import macosFolderIcon from '@/assets/image/icons/macos/folder.png';
import macosSettingsFolderIcon from '@/assets/image/icons/macos/settings-folder.png';
import macosFileIcon from '@/assets/image/icons/macos/file.png';

import winFolderIcon from '@/assets/image/icons/windows/folder.png';
import winDocsIcon from '@/assets/image/icons/windows/docs.png';
import winHomeIcon from '@/assets/image/icons/windows/home.png';
import winBinIcon from '@/assets/image/icons/windows/bin0.png';
import winPicsIcon from '@/assets/image/icons/windows/pics-sm.png';
import winSortIcon from '@/assets/image/icons/windows/sort.png';
import winViewIcon from '@/assets/image/icons/windows/view.png';

type Props = {
  initialPath: string;
  skinId?: string;
  onOpenNode: (node: FileNode) => void;
};

export default function Files({ initialPath, skinId = 'mac', onOpenNode }: Props) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [history, setHistory] = useState<string[]>([]);
  const [forwardHistory, setForwardHistory] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Tree collapse state
  const [quickAccessExpanded, setQuickAccessExpanded] = useState(true);
  const [oneDriveExpanded, setOneDriveExpanded] = useState(false);
  const [thisPcExpanded, setThisPcExpanded] = useState(true);

  // Custom user-created folders per path
  const [customFolders, setCustomFolders] = useState<Record<string, FileNode[]>>({});

  // Resolve current folder node
  const currentNode = useMemo(() => {
    const node = lookup(currentPath);
    if (node && node.kind === 'folder') return node;
    return lookup('/home/aneesh/Desktop')!; // fallback
  }, [currentPath]);

  // Handle navigation inside File Explorer
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

  const navigateUp = () => {
    const parts = currentPath.split('/');
    if (parts.length <= 3) return; // Can't go above /home
    const parentPath = parts.slice(0, -1).join('/');
    navigateTo(parentPath);
  };

  const handleNewFolder = () => {
    const folderName = `New Folder ${Math.floor(Math.random() * 100)}`;
    const newPath = `${currentPath}/${folderName}`;
    const newFolderNode: FileNode = {
      path: newPath,
      name: folderName,
      kind: 'folder',
      app: 'files',
      icon: 'Folder',
      children: [],
      size: '0 items',
      modified: 'Just now'
    };

    setCustomFolders(prev => ({
      ...prev,
      [currentPath]: [...(prev[currentPath] || []), newFolderNode]
    }));
  };

  // Sidebar sections matching Windows 11 File Explorer
  const quickAccessItems = [
    { name: 'Downloads', path: '/home/aneesh/Desktop', icon: winFolderIcon },
    { name: 'Documents', path: '/home/aneesh/Desktop/Projects', icon: winFolderIcon },
    { name: 'Pictures', path: '/home/aneesh/Desktop/Gallery', icon: winPicsIcon },
  ];

  const thisPcItems = [
    { name: 'Desktop', path: '/home/aneesh/Desktop', icon: winHomeIcon },
    { name: 'Documents', path: '/home/aneesh/Desktop/Projects', icon: winFolderIcon },
    { name: 'Pictures', path: '/home/aneesh/Desktop/Gallery', icon: winPicsIcon },
    { name: 'OS (C:)', path: '/home/aneesh', icon: winDocsIcon },
  ];

  // List of files to display (combines built-in fs nodes + user-created folders)
  const items = useMemo(() => {
    if (searchQuery.trim()) {
      return search(searchQuery);
    }
    const baseChildren = currentNode.children ?? [];
    const addedFolders = customFolders[currentPath] || [];
    return [...baseChildren, ...addedFolders];
  }, [currentNode, searchQuery, customFolders, currentPath]);

  const breadcrumbList = useMemo(() => breadcrumbs(currentPath), [currentPath]);

  // ════════════════════════════════════════════════════════════ MACOS FINDER
  if (skinId !== 'windows') {
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

  // ════════════════════════════════════════════════════════════ WINDOWS 11 FILE EXPLORER
  return (
    <div className="flex flex-col h-full text-xs select-none bg-[#191919] text-white/90" style={{ fontFamily: "'Segoe UI VF', 'Segoe UI', sans-serif" }}>
      {/* ══════════════════════════════════════════════ 1. Top Action Toolbar (Windows 11 Command Bar) */}
      <div className="h-11 border-b border-white/10 flex items-center justify-between px-3 gap-2 shrink-0 bg-[#202020] text-xs">
        <div className="flex items-center gap-1">
          {/* New Folder Button */}
          <button
            onClick={handleNewFolder}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-white/10 transition-colors text-white font-medium"
            title="Create New Folder"
          >
            <Plus size={15} className="text-sky-400" />
            <span>New</span>
          </button>

          <span className="h-4 w-px bg-white/15 mx-1" />

          {/* Action Tools */}
          <button className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Cut">
            <Scissors size={14} />
          </button>
          <button className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Copy">
            <Copy size={14} />
          </button>
          <button className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Paste">
            <Clipboard size={14} />
          </button>
          <button className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Share">
            <Share2 size={14} />
          </button>

          <span className="h-4 w-px bg-white/15 mx-1" />

          {/* Sort Menu */}
          <button className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 text-white/80 transition-colors">
            <img src={winSortIcon} alt="Sort" className="w-3.5 h-3.5 opacity-80" />
            <span>Sort</span>
          </button>

          {/* View Mode Switcher */}
          <button
            onClick={() => setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'))}
            className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 text-white/80 transition-colors"
          >
            <img src={winViewIcon} alt="View" className="w-3.5 h-3.5 opacity-80" />
            <span>View</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════ 2. Address & Search Bar */}
      <div className="h-10 border-b border-white/10 flex items-center justify-between px-3 gap-3 shrink-0 bg-[#1f1f1f]">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={navigateBack}
            disabled={history.length === 0}
            className="p-1 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white/90"
            title="Back"
          >
            <ArrowLeft size={15} />
          </button>
          <button
            onClick={navigateForward}
            disabled={forwardHistory.length === 0}
            className="p-1 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white/90"
            title="Forward"
          >
            <ArrowRight size={15} />
          </button>
          <button
            onClick={navigateUp}
            disabled={currentPath === '/home/aneesh'}
            className="p-1 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white/90"
            title="Up"
          >
            <ArrowUp size={15} />
          </button>
        </div>

        {/* Windows Address Breadcrumb Bar */}
        <div className="flex-1 flex items-center gap-1.5 bg-[#2b2b2b] border border-white/10 rounded-md px-3 py-1 text-xs text-white/90 overflow-x-auto whitespace-nowrap">
          <span className="text-sky-400 font-semibold">This PC</span>
          {breadcrumbList.map((segment) => (
            <div key={segment.path} className="flex items-center gap-1">
              <ChevronRight size={11} className="opacity-45" />
              <button
                onClick={() => navigateTo(segment.path)}
                className="hover:underline hover:text-white"
              >
                {segment.name}
              </button>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center w-56">
          <input
            type="text"
            placeholder={`Search ${currentNode.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2b2b2b] border border-white/10 rounded-md px-3 py-1 pl-8 outline-none text-xs text-white placeholder-white/40 focus:border-[#0078d4]"
          />
          <Search className="absolute left-2.5 text-white/40" size={13} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════ 3. Main Split View (Sidebar + Content Grid) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-52 border-r border-white/10 bg-[#191919] shrink-0 flex flex-col p-2 gap-1 overflow-y-auto text-xs">
          {/* Quick Access Section Header */}
          <div
            onClick={() => setQuickAccessExpanded(!quickAccessExpanded)}
            className="flex items-center gap-1.5 px-1 py-1 text-white/90 font-medium cursor-pointer hover:bg-white/5 rounded"
          >
            <ChevronRight
              size={12}
              className={`text-white/70 shrink-0 transition-transform ${quickAccessExpanded ? 'rotate-90' : ''}`}
            />
            <span className="text-amber-400 font-bold text-[13px]">★</span>
            <span>Quick access</span>
          </div>

          {/* Quick Access Children */}
          {quickAccessExpanded && (
            <div className="pl-4 space-y-0.5">
              <button
                onClick={() => navigateTo('/home/aneesh/Desktop')}
                className={`w-full flex items-center justify-between px-2 py-1 rounded-sm text-left transition-colors ${
                  currentPath === '/home/aneesh/Desktop' ? 'bg-white/15 text-white font-medium' : 'hover:bg-white/5 text-white/80'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-emerald-400 text-[13px]">⤓</span>
                  <span className="truncate">Downloads</span>
                </div>
                <span className="text-[10px] text-white/40 rotate-45">📌</span>
              </button>

              <button
                onClick={() => navigateTo('/home/aneesh')}
                className={`w-full flex items-center justify-between px-2 py-1 rounded-sm text-left transition-colors ${
                  currentPath === '/home/aneesh' ? 'bg-white/15 text-white font-medium' : 'hover:bg-white/5 text-white/80'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <img src={winHomeIcon} alt="Blue" className="w-3.5 h-3.5 object-contain" />
                  <span className="truncate">Blue</span>
                </div>
                <span className="text-[10px] text-white/40 rotate-45">📌</span>
              </button>

              <button
                onClick={() => navigateTo('/home/aneesh/Desktop/Projects')}
                className={`w-full flex items-center justify-between px-2 py-1 rounded-sm text-left transition-colors ${
                  currentPath === '/home/aneesh/Desktop/Projects' ? 'bg-white/15 text-white font-medium' : 'hover:bg-white/5 text-white/80'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <img src={winDocsIcon} alt="Documents" className="w-3.5 h-3.5 object-contain" />
                  <span className="truncate">Documents</span>
                </div>
                <span className="text-[10px] text-white/40 rotate-45">📌</span>
              </button>

              <button
                onClick={() => navigateTo('/home/aneesh/Desktop')}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded-sm text-left transition-colors ${
                  currentPath === '/home/aneesh/Desktop' ? 'bg-white/15 text-white font-medium' : 'hover:bg-white/5 text-white/80'
                }`}
              >
                <img src={winFolderIcon} alt="Github" className="w-3.5 h-3.5 object-contain" />
                <span className="truncate">Github</span>
              </button>

              <button
                onClick={() => navigateTo('/home/aneesh/Desktop/Gallery')}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded-sm text-left transition-colors ${
                  currentPath === '/home/aneesh/Desktop/Gallery' ? 'bg-white/15 text-white font-medium' : 'hover:bg-white/5 text-white/80'
                }`}
              >
                <img src={winPicsIcon} alt="Pictures" className="w-3.5 h-3.5 object-contain" />
                <span className="truncate">Pictures</span>
              </button>
            </div>
          )}

          {/* OneDrive Section */}
          <div
            onClick={() => setOneDriveExpanded(!oneDriveExpanded)}
            className="flex items-center gap-2 px-1 py-1 mt-1 text-white/80 hover:bg-white/5 rounded cursor-pointer"
          >
            <ChevronRight
              size={12}
              className={`text-white/40 transition-transform ${oneDriveExpanded ? 'rotate-90' : ''}`}
            />
            <span className="text-sky-400 text-[13px]">☁</span>
            <span>OneDrive</span>
          </div>

          {/* This PC Section Header */}
          <div
            onClick={() => setThisPcExpanded(!thisPcExpanded)}
            className="flex items-center gap-1.5 px-1 py-1 mt-1 text-white/90 font-medium cursor-pointer hover:bg-white/5 rounded"
          >
            <ChevronRight
              size={12}
              className={`text-white/70 shrink-0 transition-transform ${thisPcExpanded ? 'rotate-90' : ''}`}
            />
            <span className="text-sky-400 text-[13px]">💻</span>
            <span>This PC</span>
          </div>

          {/* This PC Children */}
          {thisPcExpanded && (
            <div className="pl-4 space-y-0.5">
              <button
                onClick={() => navigateTo('/home/aneesh/Desktop')}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded-sm text-left transition-colors ${
                  currentPath === '/home/aneesh/Desktop' ? 'bg-white/15 text-white font-medium' : 'hover:bg-white/5 text-white/80'
                }`}
              >
                <ChevronRight size={10} className="text-white/40" />
                <img src={winHomeIcon} alt="Desktop" className="w-3.5 h-3.5 object-contain" />
                <span className="truncate">Desktop</span>
              </button>

              <button
                onClick={() => navigateTo('/home/aneesh/Desktop/Projects')}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded-sm text-left transition-colors ${
                  currentPath === '/home/aneesh/Desktop/Projects' ? 'bg-white/15 text-white font-medium' : 'hover:bg-white/5 text-white/80'
                }`}
              >
                <ChevronRight size={10} className="text-white/40" />
                <img src={winDocsIcon} alt="Documents" className="w-3.5 h-3.5 object-contain" />
                <span className="truncate">Documents</span>
              </button>

              <button
                onClick={() => navigateTo('/home/aneesh/Desktop')}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded-sm text-left transition-colors ${
                  currentPath === '/home/aneesh/Desktop' ? 'bg-white/15 text-white font-medium' : 'hover:bg-white/5 text-white/80'
                }`}
              >
                <ChevronRight size={10} className="text-white/40" />
                <span className="text-emerald-400 text-[12px]">⤓</span>
                <span className="truncate">Downloads</span>
              </button>

              <button
                onClick={() => navigateTo('/home/aneesh/Desktop/Gallery')}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded-sm text-left transition-colors ${
                  currentPath === '/home/aneesh/Desktop/Gallery' ? 'bg-white/15 text-white font-medium' : 'hover:bg-white/80'
                }`}
              >
                <ChevronRight size={10} className="text-white/40" />
                <img src={winPicsIcon} alt="Pictures" className="w-3.5 h-3.5 object-contain" />
                <span className="truncate">Pictures</span>
              </button>

              <button
                onClick={() => navigateTo('/home/aneesh')}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded-sm text-left transition-colors ${
                  currentPath === '/home/aneesh' ? 'bg-white/15 text-white font-medium' : 'hover:bg-white/5 text-white/80'
                }`}
              >
                <ChevronRight size={10} className="text-white/40" />
                <img src={winDocsIcon} alt="OS (C:)" className="w-3.5 h-3.5 object-contain" />
                <span className="truncate">OS (C:)</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Area (Grid or List View) */}
        <div className="flex-1 p-3 overflow-y-auto min-h-0 bg-[#181818]" onClick={() => setSelectedPath(null)}>
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40 py-10">
              <img src={winFolderIcon} alt="Empty" className="w-14 h-14 mb-2 opacity-50" />
              <span>This folder is empty.</span>
            </div>
          ) : viewMode === 'grid' ? (
            /* Windows 11 Compact Folder Grid View (Tight spacing matching reference) */
            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
              {items.map((node) => {
                const isSelected = selectedPath === node.path;
                const isImage = node.app === 'image' && node.src;
                const isFolder = node.kind === 'folder';

                let iconSrc = winDocsIcon;
                if (isFolder) iconSrc = winFolderIcon;

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
                    className={`flex flex-col items-center gap-1 p-2 rounded-md border transition-all cursor-pointer group text-center ${
                      isSelected
                        ? 'bg-[#0078d4]/30 border-[#0078d4] ring-1 ring-[#0078d4]'
                        : 'border-transparent hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    {isImage ? (
                      <img
                        src={node.src}
                        alt={node.name}
                        className="w-12 h-12 object-cover rounded border border-white/20 shadow-md transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <img
                        src={iconSrc}
                        alt={node.name}
                        className="w-12 h-12 object-contain drop-shadow-md transition-transform group-hover:scale-105"
                      />
                    )}
                    <span className="line-clamp-2 w-full break-words text-[11px] font-normal text-white/90 leading-tight">
                      {node.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Windows 11 List View */
            <div className="flex flex-col border border-white/10 rounded-lg overflow-hidden bg-[#1e1e1e]">
              <div className="flex items-center bg-white/5 font-semibold border-b border-white/10 p-2 text-white/70">
                <span className="w-1/2">Name</span>
                <span className="w-1/4">Size</span>
                <span className="w-1/4">Modified</span>
              </div>
              {items.map((node) => {
                const isFolder = node.kind === 'folder';
                const isImage = node.app === 'image' && node.src;
                let iconSrc = winDocsIcon;
                if (isFolder) iconSrc = winFolderIcon;

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
                      selectedPath === node.path ? 'bg-[#0078d4]/30 text-white' : 'hover:bg-white/5 text-white/90'
                    }`}
                  >
                    <span className="w-1/2 flex items-center gap-2.5 truncate font-medium">
                      {isImage ? (
                        <img src={node.src} alt={node.name} className="w-4 h-4 object-cover rounded-sm border border-white/20 shrink-0" />
                      ) : (
                        <img src={iconSrc} alt={node.name} className="w-4 h-4 object-contain shrink-0" />
                      )}
                      <span className="truncate">{node.name}</span>
                    </span>
                    <span className="w-1/4 text-white/50">{node.size ?? '—'}</span>
                    <span className="w-1/4 text-white/50">{node.modified ?? '—'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════ 4. Bottom Status Bar */}
      <div className="h-6 border-t border-white/10 px-3 flex items-center justify-between text-[10.5px] opacity-60 shrink-0 bg-[#202020]">
        <span>{items.length} items</span>
        {selectedPath && <span>1 item selected</span>}
      </div>
    </div>
  );
}
