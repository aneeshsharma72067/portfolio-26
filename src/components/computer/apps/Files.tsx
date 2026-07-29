import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  Search,
  Grid,
  List,
  Folder,
  FileText,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { ROOT, lookup, search, breadcrumbs } from '@/os/fs';
import { resolveIcon } from '@/os/icons';
import type { FileNode } from '@/os/types';

type Props = {
  initialPath: string;
  onOpenNode: (node: FileNode) => void;
};

export default function Files({ initialPath, onOpenNode }: Props) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // History stack for back navigation
  const [history, setHistory] = useState<string[]>([]);

  // Resolve current folder node
  const currentNode = useMemo(() => {
    const node = lookup(currentPath);
    if (node && node.kind === 'folder') return node;
    return lookup('/home/aneesh/Desktop')!; // fallback
  }, [currentPath]);

  // Handle navigation inside Files app
  const navigateTo = (path: string) => {
    setHistory((prev) => [...prev, currentPath]);
    setCurrentPath(path);
    setSearchQuery('');
  };

  const navigateBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((prevStack) => prevStack.slice(0, -1));
    setCurrentPath(prev);
    setSearchQuery('');
  };

  const navigateUp = () => {
    const parts = currentPath.split('/');
    if (parts.length <= 3) return; // Can't go above /home
    const parentPath = parts.slice(0, -1).join('/');
    navigateTo(parentPath);
  };

  // Sidebar items
  const sidebarItems = [
    { name: 'Home', path: '/home/aneesh', icon: HardDrive },
    { name: 'Desktop', path: '/home/aneesh/Desktop', icon: Folder },
    { name: 'Documents', path: '/home/aneesh/Documents', icon: Folder },
    { name: 'Links', path: '/home/aneesh/Links', icon: Folder },
    { name: '.config', path: '/home/aneesh/.config', icon: Folder },
  ];

  // List of files to display (filtered by search if active)
  const items = useMemo(() => {
    if (searchQuery.trim()) {
      return search(searchQuery);
    }
    return currentNode.children ?? [];
  }, [currentNode, searchQuery]);

  const breadcrumbList = useMemo(() => breadcrumbs(currentPath), [currentPath]);

  return (
    <div className="flex h-full text-xs overflow-hidden select-none bg-transparent" style={{ color: 'var(--os-chrome-text)' }}>
      {/* Sidebar */}
      <div className="w-44 border-r border-[var(--os-border)] bg-black/10 shrink-0 flex flex-col p-2.5 gap-1 overflow-y-auto">
        <div className="text-[10px] font-semibold opacity-40 uppercase tracking-wider px-2 mb-1.5">Quick Access</div>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigateTo(item.path)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
                isActive
                  ? 'bg-[rgba(var(--os-accent),0.25)] text-white font-medium'
                  : 'hover:bg-white/5'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'opacity-70'} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navigation Toolbar */}
        <div className="h-10 border-b border-[var(--os-border)] flex items-center justify-between px-3 gap-2 shrink-0 bg-black/5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={navigateBack}
              disabled={history.length === 0}
              className="p-1 rounded hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Back"
            >
              <ArrowLeft size={14} />
            </button>
            <button
              onClick={navigateUp}
              disabled={currentPath === '/home/aneesh'}
              className="p-1 rounded hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Up"
            >
              <ArrowUp size={14} />
            </button>
            <span className="h-4 w-px bg-[var(--os-border)] mx-1" />
            
            {/* View Mode Switcher */}
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <List size={14} />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center w-48 max-w-xs">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/25 border border-[var(--os-border)] rounded px-2.5 py-1 pl-7 outline-none text-xs text-white placeholder-white/30 focus:border-[rgba(var(--os-accent),0.5)]"
            />
            <Search className="absolute left-2.5 text-white/30" size={12} />
          </div>
        </div>

        {/* Breadcrumb Path Bar */}
        <div className="h-7 px-3 flex items-center gap-1 bg-black/10 border-b border-[var(--os-border)] overflow-x-auto text-[10px] opacity-80 whitespace-nowrap shrink-0">
          <span>root</span>
          {breadcrumbList.map((segment) => (
            <div key={segment.path} className="flex items-center gap-1">
              <ChevronRight size={10} className="opacity-45" />
              <button
                onClick={() => navigateTo(segment.path)}
                className="hover:underline hover:text-white"
              >
                {segment.name}
              </button>
            </div>
          ))}
        </div>

        {/* Files Area */}
        <div className="flex-1 p-3 overflow-y-auto min-h-0 bg-black/5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40 py-10">
              <Folder size={36} className="stroke-1.25 mb-2" />
              <span>This folder is empty.</span>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {items.map((node) => {
                const Icon = resolveIcon(node.icon);
                return (
                  <button
                    key={node.path}
                    onClick={() => {
                      if (node.kind === 'folder') {
                        navigateTo(node.path);
                      } else {
                        onOpenNode(node);
                      }
                    }}
                    className="flex flex-col items-center gap-2 p-2 rounded border border-transparent hover:border-[var(--os-border)] hover:bg-[rgba(var(--os-accent),0.08)] group text-center transition-all min-w-0"
                  >
                    <div className="p-1 rounded transition-transform group-hover:scale-105">
                      {node.kind === 'folder' ? (
                        <Folder className="w-10 h-10 text-yellow-500 fill-yellow-500/10" />
                      ) : (
                        <Icon className={`w-10 h-10 ${node.app === 'image' ? 'text-emerald-400' : 'text-sky-400'}`} />
                      )}
                    </div>
                    <span className="truncate w-full font-medium text-white group-hover:text-[rgba(var(--os-accent),1)]">
                      {node.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="flex flex-col border border-[var(--os-border)] rounded overflow-hidden">
              <div className="flex items-center bg-black/20 font-semibold border-b border-[var(--os-border)] p-2">
                <span className="w-1/2">Name</span>
                <span className="w-1/4">Size</span>
                <span className="w-1/4">Modified</span>
              </div>
              {items.map((node) => {
                const Icon = resolveIcon(node.icon);
                return (
                  <button
                    key={node.path}
                    onClick={() => {
                      if (node.kind === 'folder') {
                        navigateTo(node.path);
                      } else {
                        onOpenNode(node);
                      }
                    }}
                    className="flex items-center text-left p-2 hover:bg-[rgba(var(--os-accent),0.08)] border-b border-[var(--os-border)] last:border-0 text-white/90"
                  >
                    <span className="w-1/2 flex items-center gap-2 truncate font-medium">
                      {node.kind === 'folder' ? (
                        <Folder className="w-4 h-4 text-yellow-500 fill-yellow-500/10 shrink-0" />
                      ) : (
                        <Icon className={`w-4 h-4 shrink-0 ${node.app === 'image' ? 'text-emerald-400' : 'text-sky-400'}`} />
                      )}
                      <span className="truncate">{node.name}</span>
                    </span>
                    <span className="w-1/4 text-white/50">{node.size ?? '—'}</span>
                    <span className="w-1/4 text-white/50">{node.modified ?? '—'}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="h-6 border-t border-[var(--os-border)] px-3 flex items-center text-[10px] opacity-50 shrink-0 bg-black/10">
          <span>{items.length} item{items.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  );
}
