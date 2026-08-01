import { useState } from 'react';
import {
  SquarePen,
  Trash2,
  Search,
  Folder,
  FolderLock,
  Star,
  Pin,
  Check,
  Plus
} from 'lucide-react';

/** The folders a note can live in. "All Notes" is a view, not a folder. */
type NoteFolder = 'Quick Notes' | 'Personal' | 'Projects' | 'Ideas';

/** Sidebar rows: every folder, plus the catch-all view at the top. */
const FOLDERS: ('All Notes' | NoteFolder)[] = [
  'All Notes',
  'Quick Notes',
  'Projects',
  'Personal',
  'Ideas',
];

type Note = {
  id: string;
  title: string;
  folder: NoteFolder;
  date: string;
  preview: string;
  content: string;
  pinned?: boolean;
};

const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    title: '🚀 Portfolio 2026 Roadmap',
    folder: 'Projects',
    date: '10:42 AM',
    pinned: true,
    preview: 'Key features: Virtual macOS desktop, interactive CLI terminal, chess puzzle modal...',
    content: `# 🚀 Portfolio 2026 Roadmap

Key features to finish:
- Virtual macOS desktop with authentic glassmorphism & SF Pro typography
- Interactive CLI terminal with fortune quotes & easter eggs
- Custom macOS Dock with 60fps spring magnification physics
- Native Notes app with folder sidebar & Markdown editor
- Dark/Light dynamic palette swapper`
  },
  {
    id: '2',
    title: '💡 Project Ideas & Scratchpad',
    folder: 'Ideas',
    date: 'Yesterday',
    pinned: true,
    preview: 'Agentic AI coding assistant integration, real-time WebGL shader background...',
    content: `# 💡 Project Ideas & Scratchpad

1. **Agentic Assistant Sidecar**
   - Seamless pair programming assistant embedded inside browser portfolio.

2. **WebGL Fluid Shaders**
   - Interactive background ripple effect following cursor movement.

3. **Retro Terminal Easter Egg**
   - Secret keybinding to switch the whole site into VT100 green CRT mode.`
  },
  {
    id: '3',
    title: '📝 Quick Todo List',
    folder: 'Quick Notes',
    date: 'Jul 26',
    pinned: false,
    preview: 'Buy coffee, review pull requests, optimize Vite chunk splitting...',
    content: `# 📝 Quick Todo List

- [x] Refactor virtual desktop skin variables
- [x] Add high-res macOS squircle icons
- [ ] Optimize Vite bundle chunk splitting
- [ ] Add sound effects for window drag & drop`
  },
  {
    id: '4',
    title: '☕ Favorite Coffee Roasts',
    folder: 'Personal',
    date: 'Jul 15',
    pinned: false,
    preview: 'Ethiopia Yirgacheffe, Colombia Supremo, Guatemala Antigua...',
    content: `# ☕ Favorite Coffee Roasts

- **Ethiopia Yirgacheffe**: Floral aroma with citrus undertones.
- **Colombia Supremo**: Rich chocolate nuttiness.
- **Guatemala Antigua**: Smooth body with subtle spice.`
  }
];

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [activeNoteId, setActiveNoteId] = useState<string>('1');
  const [selectedFolder, setSelectedFolder] = useState<'All Notes' | NoteFolder>('All Notes');
  const [searchQuery, setSearchQuery] = useState('');

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const handleUpdateContent = (newContent: string) => {
    const lines = newContent.split('\n');
    const firstLine = lines[0].replace(/^#+\s*/, '').trim() || 'Untitled Note';
    const secondLine = lines.slice(1).find(l => l.trim().length > 0) || 'No additional text';

    setNotes(prev =>
      prev.map(n =>
        n.id === activeNoteId
          ? {
              ...n,
              title: firstLine,
              preview: secondLine,
              content: newContent,
              date: 'Just now'
            }
          : n
      )
    );
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      folder: selectedFolder === 'All Notes' ? 'Quick Notes' : selectedFolder,
      date: 'Just now',
      pinned: false,
      preview: 'Type something...',
      content: '# New Note\n\nType your notes here...'
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = notes.filter(n => n.id !== id);
    setNotes(filtered);
    if (activeNoteId === id && filtered.length > 0) {
      setActiveNoteId(filtered[0].id);
    }
  };

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const filteredNotes = notes.filter(n => {
    const matchesFolder = selectedFolder === 'All Notes' || n.folder === selectedFolder;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.pinned);

  return (
    <div className="flex h-full text-xs select-none overflow-hidden bg-transparent" style={{ color: 'var(--os-chrome-text)', fontFamily: "'SF Pro', -apple-system, sans-serif" }}>
      {/* ══════════════════════════════════════════════ 1. Sidebar (Folders) */}
      <div className="w-44 border-r border-[var(--os-border)] bg-black/10 shrink-0 flex flex-col p-2.5 gap-3 overflow-y-auto">
        <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-2">Folders</div>
        <div className="space-y-0.5">
          {FOLDERS.map(folder => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                selectedFolder === folder
                  ? 'bg-[#0058d0] text-white font-semibold'
                  : 'hover:bg-white/5 text-white/80'
              }`}
            >
              <Folder size={14} className={selectedFolder === folder ? 'text-white' : 'text-amber-400/80'} />
              <span className="truncate">{folder}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════ 2. Notes List */}
      <div className="w-56 border-r border-[var(--os-border)] bg-black/5 shrink-0 flex flex-col min-w-0">
        {/* Search & Add Bar */}
        <div className="p-2 border-b border-[var(--os-border)] flex items-center gap-1.5 shrink-0">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/25 border border-white/10 rounded-md px-2.5 py-1 pl-7 outline-none text-xs text-white placeholder-white/30 focus:border-[#0058d0]"
            />
            <Search className="absolute left-2 text-white/30" size={12} />
          </div>
          <button
            onClick={handleCreateNote}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors"
            title="New Note"
          >
            <SquarePen size={14} />
          </button>
        </div>

        {/* Note Cards List */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {pinnedNotes.length > 0 && (
            <>
              <div className="text-[10px] font-bold text-white/35 uppercase tracking-wider px-2 pt-1 pb-0.5">Pinned</div>
              {pinnedNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`group relative p-2.5 rounded-lg cursor-pointer transition-all ${
                    activeNoteId === note.id
                      ? 'bg-[#0058d0] text-white'
                      : 'hover:bg-white/5 text-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-[12px] truncate pr-4">
                    <span className="truncate">{note.title}</span>
                    <Pin size={10} className="shrink-0 rotate-45 opacity-60 fill-white" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] opacity-60 mt-0.5">
                    <span>{note.date}</span>
                    <span className="truncate">{note.preview}</span>
                  </div>
                  {/* Delete button on hover */}
                  <button
                    onClick={e => handleDeleteNote(note.id, e)}
                    className="absolute top-2 right-2 p-1 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </>
          )}

          {unpinnedNotes.length > 0 && (
            <>
              {pinnedNotes.length > 0 && <div className="text-[10px] font-bold text-white/35 uppercase tracking-wider px-2 pt-2 pb-0.5">Notes</div>}
              {unpinnedNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`group relative p-2.5 rounded-lg cursor-pointer transition-all ${
                    activeNoteId === note.id
                      ? 'bg-[#0058d0] text-white'
                      : 'hover:bg-white/5 text-white/80'
                  }`}
                >
                  <div className="font-semibold text-[12px] truncate pr-4">{note.title}</div>
                  <div className="flex items-center gap-1.5 text-[10px] opacity-60 mt-0.5">
                    <span>{note.date}</span>
                    <span className="truncate">{note.preview}</span>
                  </div>
                  <button
                    onClick={e => handleDeleteNote(note.id, e)}
                    className="absolute top-2 right-2 p-1 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════ 3. Note Editor */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
        {/* Editor Toolbar */}
        {activeNote && (
          <div className="h-9 border-b border-[var(--os-border)] px-4 flex items-center justify-between shrink-0 bg-black/5 text-white/60">
            <span className="text-[11px] opacity-50">{activeNote.date}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={e => togglePin(activeNote.id, e)}
                className={`p-1 rounded hover:bg-white/10 transition-colors ${activeNote.pinned ? 'text-amber-400' : 'text-white/40'}`}
                title="Pin Note"
              >
                <Pin size={13} className={activeNote.pinned ? 'rotate-45 fill-amber-400' : ''} />
              </button>
              <button
                onClick={handleCreateNote}
                className="p-1 rounded hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                title="New Note"
              >
                <SquarePen size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Text Area */}
        {activeNote ? (
          <textarea
            value={activeNote.content}
            onChange={e => handleUpdateContent(e.target.value)}
            placeholder="Start typing..."
            className="flex-1 p-5 bg-transparent resize-none outline-none font-sans text-xs text-white/90 leading-relaxed select-text selection:bg-[#0058d0]/40 placeholder-white/20"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/30 italic">
            No Note Selected
          </div>
        )}
      </div>
    </div>
  );
}
