import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  LayoutGrid,
  List as ListIcon,
  Columns3,
  Trash2,
} from 'lucide-react';
import { getDisk, lookup, search, parentPath, breadcrumbs } from '@/os/fs';
import type { FileNode } from '@/os/types';
import { macNodeIcon, macKindLabel } from './macIcons';

type Props = {
  initialPath: string;
  onOpenNode: (node: FileNode) => void;
  visibleChildren: (node: FileNode | undefined) => FileNode[];
  onDelete: (node: FileNode) => boolean;
};

const FONT = "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif";

/**
 * MacFinder — the macOS Finder.
 *
 * macOS-ONLY. Explorer is a separate component with a command bar, a breadcrumb
 * address bar and a tree sidebar; none of that appears here.
 *
 * Finder-specific behaviour that Explorer deliberately does NOT copy:
 *  · COLUMN VIEW — the browser Explorer has no equivalent of, and the single
 *    most recognisable thing about Finder. It's the default here, as it is on
 *    a real Mac for a newly-opened window.
 *  · a flat Favourites/Locations sidebar with coloured glyphs, no tree
 *  · a segmented view switcher in the toolbar rather than a "View" button
 *  · the path bar sits at the BOTTOM, not the top
 *  · selection is macOS blue, and the toolbar is a vibrancy strip
 */
export default function MacFinder({
  initialPath,
  onOpenNode,
  visibleChildren,
  onDelete,
}: Props) {
  const disk = getDisk('mac');

  const [currentPath, setCurrentPath] = useState(initialPath);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'column'>('column');
  const [history, setHistory] = useState<string[]>([]);
  const [forwardHistory, setForwardHistory] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const currentNode = useMemo(() => {
    const node = lookup('mac', currentPath);
    if (node?.kind === 'folder') return node;
    return lookup('mac', disk.paths.home)!;
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
    setSelectedPath(null);
  };

  const navigateForward = () => {
    if (forwardHistory.length === 0) return;
    setHistory((prev) => [...prev, currentPath]);
    setCurrentPath(forwardHistory[forwardHistory.length - 1]);
    setForwardHistory((prev) => prev.slice(0, -1));
    setSelectedPath(null);
  };

  const openItem = (node: FileNode) => {
    if (node.kind === 'folder') navigateTo(node.path);
    else onOpenNode(node);
  };

  /** Folders first, then alphabetical, then hidden dotfiles last. */
  const sortNodes = (list: FileNode[]) =>
    [...list].sort((a, b) => {
      const aHidden = a.name.startsWith('.');
      const bHidden = b.name.startsWith('.');
      if (aHidden !== bHidden) return aHidden ? 1 : -1;
      if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  const items = useMemo(() => {
    if (searchQuery.trim()) return search('mac', searchQuery);
    return sortNodes(visibleChildren(currentNode));
  }, [currentNode, searchQuery, visibleChildren]);

  /**
   * Column view's panes: the chain of ancestor folders from the home directory
   * down to the current one, each rendered as its own scrolling column. This is
   * the whole point of Finder's browser and why it can't share Explorer's list.
   */
  const columns = useMemo(() => {
    if (searchQuery.trim()) return [];
    const chain: FileNode[] = [];
    let path: string | null = currentPath;
    while (path) {
      const node: FileNode | undefined = lookup('mac', path);
      if (node?.kind === 'folder') chain.unshift(node);
      path = parentPath('mac', path);
    }
    // Only the last four panes fit comfortably; Finder scrolls, we trim.
    return chain.slice(-4);
  }, [currentPath, searchQuery]);

  const crumbs = useMemo(() => breadcrumbs('mac', currentPath), [currentPath]);
  const selectedNode = selectedPath ? lookup('mac', selectedPath) : undefined;

  /* Finder's sidebar is flat, with coloured SF-style glyphs. No tree. */
  const favourites: { label: string; path: string; glyph: string; tint: string }[] = [
    { label: 'Desktop', path: disk.paths.desktop, glyph: '🖥', tint: 'text-sky-400' },
    { label: 'Documents', path: disk.paths.documents, glyph: '📄', tint: 'text-sky-400' },
    { label: 'Downloads', path: disk.paths.downloads, glyph: '⤓', tint: 'text-emerald-400' },
    { label: 'Pictures', path: disk.paths.pictures, glyph: '🖼', tint: 'text-purple-400' },
    { label: 'Music', path: disk.paths.music, glyph: '♫', tint: 'text-rose-400' },
    { label: 'Movies', path: disk.paths.videos, glyph: '🎬', tint: 'text-amber-400' },
    { label: 'Applications', path: disk.paths.apps, glyph: '🚀', tint: 'text-sky-400' },
  ];

  const locations = [
    { label: 'Macintosh HD', path: disk.paths.root, glyph: '💾' },
    { label: 'aneesh', path: disk.paths.home, glyph: '🏠' },
  ];

  const sideRow = (active: boolean) =>
    `flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[12px] transition-colors ${
      active ? 'bg-white/20 font-semibold text-white' : 'text-white/80 hover:bg-white/10'
    }`;

  const viewBtn = (active: boolean) =>
    `rounded p-1 transition-colors ${active ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`;

  /** One row inside a column-view pane. */
  const ColumnRow = ({ node, active }: { node: FileNode; active: boolean }) => (
    <button
      onClick={() => (node.kind === 'folder' ? navigateTo(node.path) : setSelectedPath(node.path))}
      onDoubleClick={() => openItem(node)}
      className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-[12px] transition-colors ${
        active ? 'bg-[#0a84ff] text-white' : 'text-white/85 hover:bg-white/10'
      }`}
    >
      {node.ext === 'image' && node.src ? (
        <img src={node.src} alt="" className="h-4 w-4 shrink-0 rounded-sm object-cover" />
      ) : (
        <img src={macNodeIcon(node)} alt="" className="h-4 w-4 shrink-0 object-contain" />
      )}
      <span className="flex-1 truncate">{node.name}</span>
      {node.kind === 'folder' && (
        <ChevronRight size={11} className={active ? 'opacity-80' : 'opacity-35'} />
      )}
    </button>
  );

  return (
    <div
      className="flex h-full select-none overflow-hidden bg-transparent text-xs text-white/90"
      style={{ fontFamily: FONT }}
    >
      {/* ═════════════════════════════════════════════ translucent sidebar */}
      <div className="flex w-48 shrink-0 flex-col gap-3 overflow-y-auto border-r border-white/10 bg-black/20 p-3 backdrop-blur-md">
        <div>
          <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider opacity-40">
            Favourites
          </div>
          <div className="space-y-0.5">
            {favourites.map((row) => (
              <button
                key={row.label}
                onClick={() => navigateTo(row.path)}
                className={sideRow(currentPath === row.path)}
              >
                <span className={`text-[13px] ${row.tint}`}>{row.glyph}</span>
                <span className="truncate">{row.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider opacity-40">
            Locations
          </div>
          <div className="space-y-0.5">
            {locations.map((row) => (
              <button
                key={row.label}
                onClick={() => navigateTo(row.path)}
                className={sideRow(currentPath === row.path)}
              >
                <span className="text-[13px]">{row.glyph}</span>
                <span className="truncate">{row.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Finder's colour tags — decorative, but instantly recognisable. */}
        <div>
          <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider opacity-40">
            Tags
          </div>
          <div className="space-y-0.5">
            {[
              { label: 'Work', colour: '#ff6159' },
              { label: 'Personal', colour: '#ffbd2e' },
              { label: 'Archive', colour: '#28c840' },
            ].map((tag) => (
              <div
                key={tag.label}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[12px] text-white/70"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: tag.colour }}
                />
                <span>{tag.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-black/10">
        {/* ─────────────────────────────────────────────────── toolbar */}
        <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-black/20 px-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <button
                onClick={navigateBack}
                disabled={history.length === 0}
                className="rounded p-1 hover:bg-white/10 disabled:opacity-30"
                title="Back"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={navigateForward}
                disabled={forwardHistory.length === 0}
                className="rounded p-1 hover:bg-white/10 disabled:opacity-30"
                title="Forward"
              >
                <ChevronRight size={15} />
              </button>
            </div>
            <span className="ml-1 font-semibold text-white/95">{currentNode.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* macOS's segmented view switcher — including column view. */}
            <div className="flex items-center rounded-md bg-white/10 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={viewBtn(viewMode === 'grid')}
                title="Icons"
              >
                <LayoutGrid size={13} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={viewBtn(viewMode === 'list')}
                title="List"
              >
                <ListIcon size={13} />
              </button>
              <button
                onClick={() => setViewMode('column')}
                className={viewBtn(viewMode === 'column')}
                title="Columns"
              >
                <Columns3 size={13} />
              </button>
            </div>

            <button
              className="rounded p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-25 disabled:hover:bg-transparent"
              title={selectedNode?.system ? 'Required by macOS' : 'Move to Trash'}
              disabled={!selectedNode || selectedNode.system}
              onClick={() => {
                if (selectedNode && onDelete(selectedNode)) setSelectedPath(null);
              }}
            >
              <Trash2 size={14} />
            </button>

            <div className="relative flex w-40 items-center">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-black/30 px-2.5 py-1 pl-7 text-xs text-white outline-none placeholder:text-white/40 focus:border-sky-400"
              />
              <Search className="absolute left-2 text-white/40" size={12} />
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────── listing */}
        <div
          className="min-h-0 flex-1 overflow-hidden"
          onClick={() => setSelectedPath(null)}
        >
          {items.length === 0 && viewMode !== 'column' ? (
            <div className="flex h-full flex-col items-center justify-center py-10 opacity-40">
              <span>{searchQuery ? 'No results' : 'Folder is empty'}</span>
            </div>
          ) : viewMode === 'column' && !searchQuery.trim() ? (
            /* ═══════════ COLUMN VIEW — the Finder-defining browser ═══════════ */
            <div className="flex h-full overflow-x-auto">
              {columns.map((col) => {
                const children = sortNodes(visibleChildren(col));
                return (
                  <div
                    key={col.path}
                    className="h-full w-48 shrink-0 overflow-y-auto border-r border-white/10 p-1.5"
                  >
                    {children.length === 0 ? (
                      <div className="px-2 py-2 text-[11px] italic text-white/25">Empty</div>
                    ) : (
                      children.map((child) => (
                        <ColumnRow
                          key={child.path}
                          node={child}
                          active={
                            currentPath === child.path || selectedPath === child.path
                          }
                        />
                      ))
                    )}
                  </div>
                );
              })}

              {/* The preview pane: Finder's rightmost column when a FILE is picked. */}
              {selectedNode && selectedNode.kind === 'file' && (
                <div className="flex h-full w-52 shrink-0 flex-col items-center gap-3 overflow-y-auto p-4 text-center">
                  {selectedNode.ext === 'image' && selectedNode.src ? (
                    <img
                      src={selectedNode.src}
                      alt=""
                      className="w-full rounded-lg object-cover shadow-lg"
                    />
                  ) : (
                    <img
                      src={macNodeIcon(selectedNode)}
                      alt=""
                      className="h-20 w-20 object-contain"
                    />
                  )}
                  <div className="text-[12px] font-semibold">{selectedNode.name}</div>
                  <div className="w-full space-y-1 text-left text-[10.5px] text-white/55">
                    <div className="flex justify-between">
                      <span>Kind</span>
                      <span className="text-white/80">{macKindLabel(selectedNode)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size</span>
                      <span className="text-white/80">{selectedNode.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Modified</span>
                      <span className="text-white/80">{selectedNode.modified}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenNode(selectedNode)}
                    className="mt-1 w-full rounded-md bg-[#0a84ff] py-1 text-[11px] font-medium text-white transition-colors hover:bg-[#0071e3]"
                  >
                    Open
                  </button>
                </div>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-4 overflow-y-auto p-4">
              {items.map((node) => (
                <div
                  key={node.path}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPath(node.path);
                  }}
                  onDoubleClick={() => openItem(node)}
                  className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg p-2 text-center transition-all hover:bg-white/5"
                >
                  {node.ext === 'image' && node.src ? (
                    <img
                      src={node.src}
                      alt=""
                      className={`h-12 w-12 rounded-[18%] object-cover shadow-md ${
                        selectedPath === node.path ? 'ring-2 ring-[#0a84ff]' : ''
                      }`}
                    />
                  ) : (
                    <img
                      src={macNodeIcon(node)}
                      alt=""
                      className={`h-12 w-12 rounded-[22%] object-contain shadow-md ${
                        selectedPath === node.path ? 'bg-white/20' : ''
                      }`}
                    />
                  )}
                  <span
                    className={`line-clamp-2 w-full break-words rounded px-1 text-[11px] font-medium leading-tight ${
                      selectedPath === node.path ? 'bg-[#0a84ff] text-white' : 'text-white/90'
                    }`}
                  >
                    {node.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* List view — Finder's columns are Name / Date / Size / Kind. */
            <div className="h-full overflow-y-auto">
              <table className="w-full text-left text-[11.5px]">
                <thead className="sticky top-0 z-10 bg-black/40 text-[10.5px] text-white/50 backdrop-blur">
                  <tr className="border-b border-white/10">
                    <th className="px-3 py-1.5 font-normal">Name</th>
                    <th className="w-36 px-3 py-1.5 font-normal">Date Modified</th>
                    <th className="w-20 px-3 py-1.5 text-right font-normal">Size</th>
                    <th className="w-36 px-3 py-1.5 font-normal">Kind</th>
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
                          ? 'bg-[#0a84ff] text-white'
                          : 'text-white/85 hover:bg-white/5'
                      }`}
                    >
                      <td className="flex items-center gap-2.5 truncate px-3 py-1.5">
                        <img
                          src={macNodeIcon(node)}
                          alt=""
                          className="h-4 w-4 shrink-0 object-contain"
                        />
                        <span className="truncate">{node.name}</span>
                      </td>
                      <td className="px-3 py-1.5 opacity-60">{node.modified}</td>
                      <td className="px-3 py-1.5 text-right opacity-60">
                        {node.kind === 'folder' ? '--' : node.size}
                      </td>
                      <td className="truncate px-3 py-1.5 opacity-60">
                        {macKindLabel(node)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─────────────────────── path bar — at the BOTTOM, as Finder has it */}
        <div className="flex h-6 shrink-0 items-center gap-1 overflow-x-auto whitespace-nowrap border-t border-white/10 bg-black/25 px-3 text-[10.5px] opacity-70">
          {crumbs.map((segment, i) => (
            <div key={segment.path} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={9} className="opacity-40" />}
              <button
                onClick={() => navigateTo(segment.path)}
                className="hover:text-white hover:underline"
              >
                {segment.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
