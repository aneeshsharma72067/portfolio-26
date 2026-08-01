import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Search,
  ChevronRight,
  Scissors,
  Copy,
  Clipboard,
  Share2,
  Trash2,
  LayoutGrid,
  List as ListIcon,
} from 'lucide-react';
import { getDisk, lookup, search, breadcrumbs, parentPath, folderBytes } from '@/os/fs';
import type { FileNode } from '@/os/types';
import { WIN_ICONS, winNodeIcon, winTypeLabel } from './winIcons';

type Props = {
  initialPath: string;
  onOpenNode: (node: FileNode) => void;
  /** Hides binned files so Explorer agrees with the desktop. */
  visibleChildren: (node: FileNode | undefined) => FileNode[];
  onDelete: (node: FileNode) => boolean;
};

const FONT = "'Segoe UI VF', 'Segoe UI Variable', 'Segoe UI', sans-serif";

/**
 * WinExplorer — Windows 11 File Explorer.
 *
 * WINDOWS-ONLY. Finder is a separate component with a different toolbar, a
 * different sidebar, a different column set and macOS's own selection colours.
 *
 * Explorer-specific behaviour that Finder deliberately does NOT copy:
 *  · a command bar across the top (New / Cut / Copy / Paste / Sort / View)
 *  · a breadcrumb ADDRESS BAR, editable-looking, rooted at "This PC"
 *  · a tree sidebar with Quick access, OneDrive and This PC sections
 *  · Details view with Name / Date modified / Type / Size columns
 *  · single-click selects, double-click opens
 */
export default function WinExplorer({
  initialPath,
  onOpenNode,
  visibleChildren,
  onDelete,
}: Props) {
  const disk = getDisk('windows');

  const [currentPath, setCurrentPath] = useState(initialPath);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'details'>('details');
  const [history, setHistory] = useState<string[]>([]);
  const [forwardHistory, setForwardHistory] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const [quickAccessOpen, setQuickAccessOpen] = useState(true);
  const [oneDriveOpen, setOneDriveOpen] = useState(false);
  const [thisPcOpen, setThisPcOpen] = useState(true);

  /* Fall back to the home folder if a window was opened on a file's path. */
  const currentNode = useMemo(() => {
    const node = lookup('windows', currentPath);
    if (node?.kind === 'folder') return node;
    return lookup('windows', disk.paths.home)!;
  }, [currentPath, disk.paths.home]);

  const navigateTo = (path: string) => {
    if (path === currentPath) return;
    setHistory((prev) => [...prev, currentPath]);
    setForwardHistory([]);
    setCurrentPath(path);
    setSearchQuery('');
    setSelectedPath(null);
  };

  const navigateBack = () => {
    if (history.length === 0) return;
    setForwardHistory((prev) => [...prev, currentPath]);
    setCurrentPath(history[history.length - 1]);
    setHistory((prev) => prev.slice(0, -1));
    setSearchQuery('');
    setSelectedPath(null);
  };

  const navigateForward = () => {
    if (forwardHistory.length === 0) return;
    setHistory((prev) => [...prev, currentPath]);
    setCurrentPath(forwardHistory[forwardHistory.length - 1]);
    setForwardHistory((prev) => prev.slice(0, -1));
    setSearchQuery('');
    setSelectedPath(null);
  };

  const parent = parentPath('windows', currentPath);
  const navigateUp = () => parent && navigateTo(parent);

  const openItem = (node: FileNode) => {
    if (node.kind === 'folder') navigateTo(node.path);
    else onOpenNode(node);
  };

  const items = useMemo(() => {
    if (searchQuery.trim()) return search('windows', searchQuery);
    /* Folders before files, then alphabetical — Explorer's default sort. */
    return [...visibleChildren(currentNode)].sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [currentNode, searchQuery, visibleChildren]);

  const crumbs = useMemo(() => breadcrumbs('windows', currentPath), [currentPath]);

  const selectedNode = selectedPath ? lookup('windows', selectedPath) : undefined;

  /* Sidebar rows are the same shape everywhere, so they're built from a table. */
  const quickAccess: { label: string; path: string; icon: string }[] = [
    { label: 'Desktop', path: disk.paths.desktop, icon: WIN_ICONS.home },
    { label: 'Downloads', path: disk.paths.downloads, icon: WIN_ICONS.docs },
    { label: 'Documents', path: disk.paths.documents, icon: WIN_ICONS.docs },
    { label: 'Pictures', path: disk.paths.pictures, icon: WIN_ICONS.pics },
    { label: 'Portfolio', path: disk.paths.portfolio, icon: WIN_ICONS.folder },
  ];

  const thisPc: { label: string; path: string; icon: string }[] = [
    { label: 'Local Disk (C:)', path: disk.paths.root, icon: WIN_ICONS.thisPc },
    { label: 'Program Files', path: disk.paths.apps, icon: WIN_ICONS.apps },
    { label: 'Music', path: disk.paths.music, icon: WIN_ICONS.docs },
    { label: 'Videos', path: disk.paths.videos, icon: WIN_ICONS.docs },
  ];

  const sideRow = (active: boolean) =>
    `flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left transition-colors ${
      active ? 'bg-white/15 font-medium text-white' : 'text-white/80 hover:bg-white/5'
    }`;

  const toolBtn =
    'rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <div
      className="flex h-full select-none flex-col bg-[#191919] text-xs text-white/90"
      style={{ fontFamily: FONT }}
    >
      {/* ═══════════════════════════════════════════════════════ command bar */}
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-white/10 bg-[#202020] px-3">
        <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium text-white transition-colors hover:bg-white/10">
          <span className="text-sky-400">＋</span>
          <span>New</span>
        </button>

        <span className="mx-1 h-4 w-px bg-white/15" />

        <button className={toolBtn} title="Cut">
          <Scissors size={14} />
        </button>
        <button className={toolBtn} title="Copy">
          <Copy size={14} />
        </button>
        <button className={toolBtn} title="Paste">
          <Clipboard size={14} />
        </button>
        <button
          className={toolBtn}
          title={selectedNode?.system ? 'Protected by the system' : 'Delete'}
          disabled={!selectedNode || selectedNode.system}
          onClick={() => {
            if (selectedNode && onDelete(selectedNode)) setSelectedPath(null);
          }}
        >
          <Trash2 size={14} />
        </button>
        <button className={toolBtn} title="Share">
          <Share2 size={14} />
        </button>

        <span className="mx-1 h-4 w-px bg-white/15" />

        <button
          onClick={() => setViewMode((v) => (v === 'grid' ? 'details' : 'grid'))}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-white/80 transition-colors hover:bg-white/10"
          title="Toggle view"
        >
          {viewMode === 'grid' ? <ListIcon size={14} /> : <LayoutGrid size={14} />}
          <span>View</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════ address + search bar */}
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-white/10 bg-[#1f1f1f] px-3">
        <div className="flex items-center gap-1">
          <button
            onClick={navigateBack}
            disabled={history.length === 0}
            className={toolBtn}
            title="Back"
          >
            <ArrowLeft size={15} />
          </button>
          <button
            onClick={navigateForward}
            disabled={forwardHistory.length === 0}
            className={toolBtn}
            title="Forward"
          >
            <ArrowRight size={15} />
          </button>
          <button onClick={navigateUp} disabled={!parent} className={toolBtn} title="Up">
            <ArrowUp size={15} />
          </button>
        </div>

        {/* The address bar: real breadcrumbs, each one clickable. */}
        <div className="flex flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap rounded-md border border-white/10 bg-[#2b2b2b] px-3 py-1">
          <img src={WIN_ICONS.thisPc} alt="" className="h-3.5 w-3.5 object-contain" />
          {crumbs.map((segment, i) => (
            <div key={segment.path} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={11} className="opacity-45" />}
              <button
                onClick={() => navigateTo(segment.path)}
                className="rounded px-1 hover:bg-white/10 hover:text-white"
              >
                {segment.name}
              </button>
            </div>
          ))}
        </div>

        <div className="relative flex w-52 items-center">
          <input
            type="text"
            placeholder={`Search ${currentNode.name}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-[#2b2b2b] px-3 py-1 pl-8 text-xs text-white outline-none placeholder:text-white/40 focus:border-[#0078d4]"
          />
          <Search className="absolute left-2.5 text-white/40" size={13} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ───────────────────────────────────────────────────── sidebar */}
        <div className="flex w-52 shrink-0 flex-col gap-1 overflow-y-auto border-r border-white/10 bg-[#191919] p-2">
          <button
            onClick={() => setQuickAccessOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded px-1 py-1 font-medium text-white/90 hover:bg-white/5"
          >
            <ChevronRight
              size={12}
              className={`shrink-0 text-white/70 transition-transform ${quickAccessOpen ? 'rotate-90' : ''}`}
            />
            <span className="text-[13px] font-bold text-amber-400">★</span>
            <span>Quick access</span>
          </button>

          {quickAccessOpen && (
            <div className="space-y-0.5 pl-4">
              {quickAccess.map((row) => (
                <button
                  key={row.label}
                  onClick={() => navigateTo(row.path)}
                  className={sideRow(currentPath === row.path)}
                >
                  <img src={row.icon} alt="" className="h-3.5 w-3.5 object-contain" />
                  <span className="truncate">{row.label}</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setOneDriveOpen((v) => !v)}
            className="mt-1 flex items-center gap-2 rounded px-1 py-1 text-white/80 hover:bg-white/5"
          >
            <ChevronRight
              size={12}
              className={`text-white/40 transition-transform ${oneDriveOpen ? 'rotate-90' : ''}`}
            />
            <span className="text-[13px] text-sky-400">☁</span>
            <span>OneDrive</span>
          </button>
          {oneDriveOpen && (
            <div className="px-2 py-1 pl-8 text-[11px] italic text-white/30">
              Not signed in
            </div>
          )}

          <button
            onClick={() => setThisPcOpen((v) => !v)}
            className="mt-1 flex items-center gap-1.5 rounded px-1 py-1 font-medium text-white/90 hover:bg-white/5"
          >
            <ChevronRight
              size={12}
              className={`shrink-0 text-white/70 transition-transform ${thisPcOpen ? 'rotate-90' : ''}`}
            />
            <img src={WIN_ICONS.thisPc} alt="" className="h-3.5 w-3.5 object-contain" />
            <span>This PC</span>
          </button>

          {thisPcOpen && (
            <div className="space-y-0.5 pl-4">
              {thisPc.map((row) => (
                <button
                  key={row.label}
                  onClick={() => navigateTo(row.path)}
                  className={sideRow(currentPath === row.path)}
                >
                  <img src={row.icon} alt="" className="h-3.5 w-3.5 object-contain" />
                  <span className="truncate">{row.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ────────────────────────────────────────────────── file listing */}
        <div
          className="min-h-0 flex-1 overflow-y-auto bg-[#181818]"
          onClick={() => setSelectedPath(null)}
        >
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-10 opacity-40">
              <img src={WIN_ICONS.folder} alt="" className="mb-2 h-14 w-14 opacity-50" />
              <span>{searchQuery ? 'No matches found.' : 'This folder is empty.'}</span>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 p-3">
              {items.map((node) => (
                <div
                  key={node.path}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPath(node.path);
                  }}
                  onDoubleClick={() => openItem(node)}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-md border p-2 text-center transition-all ${
                    selectedPath === node.path
                      ? 'border-[#0078d4] bg-[#0078d4]/30 ring-1 ring-[#0078d4]'
                      : 'border-transparent hover:border-white/10 hover:bg-white/5'
                  }`}
                >
                  {node.ext === 'image' && node.src ? (
                    <img
                      src={node.src}
                      alt=""
                      className="h-12 w-12 rounded border border-white/20 object-cover shadow-md"
                    />
                  ) : (
                    <img
                      src={winNodeIcon(node)}
                      alt=""
                      className="h-12 w-12 object-contain drop-shadow-md"
                    />
                  )}
                  <span className="line-clamp-2 w-full break-words text-[11px] leading-tight text-white/90">
                    {node.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* Details view — the four columns Explorer actually shows. */
            <table className="w-full text-left text-[11.5px]">
              <thead className="sticky top-0 z-10 bg-[#1f1f1f] text-[11px] text-white/55">
                <tr className="border-b border-white/10">
                  <th className="px-3 py-1.5 font-normal">Name</th>
                  <th className="w-36 px-3 py-1.5 font-normal">Date modified</th>
                  <th className="w-36 px-3 py-1.5 font-normal">Type</th>
                  <th className="w-24 px-3 py-1.5 text-right font-normal">Size</th>
                </tr>
              </thead>
              <tbody>
                {items.map((node) => (
                  <tr
                    key={node.path}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPath(node.path);
                    }}
                    onDoubleClick={() => openItem(node)}
                    className={`cursor-pointer transition-colors ${
                      selectedPath === node.path
                        ? 'bg-[#0078d4]/35 text-white'
                        : 'text-white/85 hover:bg-white/5'
                    }`}
                  >
                    <td className="flex items-center gap-2.5 truncate px-3 py-1.5">
                      {node.ext === 'image' && node.src ? (
                        <img
                          src={node.src}
                          alt=""
                          className="h-4 w-4 shrink-0 rounded-sm object-cover"
                        />
                      ) : (
                        <img
                          src={winNodeIcon(node)}
                          alt=""
                          className="h-4 w-4 shrink-0 object-contain"
                        />
                      )}
                      <span className="truncate">{node.name}</span>
                    </td>
                    <td className="px-3 py-1.5 text-white/50">{node.modified}</td>
                    <td className="truncate px-3 py-1.5 text-white/50">
                      {winTypeLabel(node)}
                    </td>
                    <td className="px-3 py-1.5 text-right text-white/50">
                      {node.kind === 'folder' ? '' : node.size}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════ status bar */}
      <div className="flex h-6 shrink-0 items-center justify-between border-t border-white/10 bg-[#202020] px-3 text-[10.5px] text-white/55">
        <span>{items.length} items</span>
        {selectedNode && (
          <span>
            {selectedNode.name} —{' '}
            {selectedNode.kind === 'folder'
              ? `${(folderBytes(selectedNode) / 1024 / 1024).toFixed(1)} MB`
              : selectedNode.size}
          </span>
        )}
      </div>
    </div>
  );
}
