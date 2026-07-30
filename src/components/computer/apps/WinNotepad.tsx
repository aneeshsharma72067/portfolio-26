import { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Pin,
  Folder,
  ChevronRight,
  Settings,
  MoreVertical,
  Check,
} from 'lucide-react';

type Note = {
  id: string;
  title: string;
  category: 'Quick notes' | 'Personal' | 'Work' | 'Ideas';
  date: string;
  preview: string;
  content: string;
  pinned?: boolean;
};

const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    title: '🚀 Portfolio 2026 Roadmap',
    category: 'Work',
    date: '10:42 AM',
    pinned: true,
    preview: 'Key features: Windows 11 Fluent UI, Notepad integration, photos gallery...',
    content: `# 🚀 Portfolio 2026 Roadmap

Key features to finish:
- Windows 11 Notepad with Fluent Design tabbed interface
- Windows Photos app with album grid & view controls
- Virtual desktop skin variables with Segoe UI Variable font
- Custom Windows Taskbar & Start Menu
- Native Windows Explorer file system`,
  },
  {
    id: '2',
    title: '💡 Project Ideas & Scratchpad',
    category: 'Ideas',
    date: 'Yesterday',
    pinned: true,
    preview: 'Agentic AI coding assistant integration, real-time WebGL shader background...',
    content: `# 💡 Project Ideas & Scratchpad

1. **Agentic Assistant Sidecar**
   - Pair programming assistant embedded inside browser portfolio.

2. **WebGL Fluid Shaders**
   - Interactive background ripple effect following cursor movement.

3. **Retro Terminal Easter Egg**
   - Secret keybinding to switch the whole site into VT100 green CRT mode.`,
  },
  {
    id: '3',
    title: '📝 Quick Todo List',
    category: 'Quick notes',
    date: 'Jul 26',
    pinned: false,
    preview: 'Buy coffee, review pull requests, optimize Vite chunk splitting...',
    content: `# 📝 Quick Todo List

- [x] Refactor virtual desktop skin variables
- [x] Add high-res Windows 11 icons
- [ ] Optimize Vite bundle chunk splitting
- [ ] Add sound effects for window drag & drop`,
  },
  {
    id: '4',
    title: '☕ Favorite Coffee Roasts',
    category: 'Personal',
    date: 'Jul 15',
    pinned: false,
    preview: 'Ethiopia Yirgacheffe, Colombia Supremo, Guatemala Antigua...',
    content: `# ☕ Favorite Coffee Roasts

- **Ethiopia Yirgacheffe**: Floral aroma with citrus undertones.
- **Colombia Supremo**: Rich chocolate nuttiness.
- **Guatemala Antigua**: Smooth body with subtle spice.`,
  },
];

export default function WinNotepad() {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [activeNoteId, setActiveNoteId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [wordWrap, setWordWrap] = useState(true);
  const [statusBar, setStatusBar] = useState(true);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleUpdateContent = (newContent: string) => {
    const lines = newContent.split('\n');
    const firstLine = lines[0].replace(/^#+\s*/, '').trim() || 'Untitled';
    const secondLine = lines.slice(1).find((l) => l.trim().length > 0) || 'No additional text';

    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNoteId
          ? {
              ...n,
              title: firstLine,
              preview: secondLine,
              content: newContent,
              date: 'Just now',
            }
          : n,
      ),
    );
  };

  const handleNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled.txt',
      category: 'Quick notes',
      date: 'Just now',
      pinned: false,
      preview: 'Type something...',
      content: 'Type your notes here...',
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = notes.filter((n) => n.id !== id);
    setNotes(filtered);
    if (activeNoteId === id && filtered.length > 0) {
      setActiveNoteId(filtered[0].id);
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const lineCount = activeNote ? activeNote.content.split('\n').length : 0;
  const charCount = activeNote ? activeNote.content.length : 0;

  return (
    <div
      className="flex h-full flex-col select-none overflow-hidden bg-[#202020] text-white"
      style={{ fontFamily: "'Segoe UI Variable', 'Segoe UI', sans-serif" }}
    >
      {/* ══════════════════════════════════════════════ Windows 11 Notepad Tab Bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/10 bg-[#191919] px-2">
        <div className="flex items-center gap-1 overflow-x-auto min-w-0">
          {notes.map((note) => {
            const isActive = note.id === activeNoteId;
            return (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`group flex h-8 max-w-[160px] cursor-pointer items-center gap-2 rounded-t-md px-3 text-xs transition-colors border-t border-x ${
                  isActive
                    ? 'bg-[#202020] border-white/10 text-white font-medium'
                    : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <FileText size={13} className={isActive ? 'text-[#60cdff]' : 'text-white/40'} />
                <span className="truncate flex-1 text-[12px]">{note.title}</span>
                <button
                  onClick={(e) => handleDeleteNote(note.id, e)}
                  className="rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/50 hover:text-white transition-opacity"
                >
                  ✕
                </button>
              </div>
            );
          })}

          <button
            onClick={handleNewNote}
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors ml-1"
            title="New tab"
          >
            <Plus size={15} />
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`px-2 py-1 text-[11px] rounded transition-colors ${
              wordWrap ? 'bg-white/10 text-[#60cdff]' : 'text-white/50 hover:bg-white/5'
            }`}
          >
            Word wrap
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════ Windows Command Bar */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/5 bg-[#202020] px-3 text-xs text-white/70">
        <div className="flex items-center gap-4 text-[12px]">
          <span className="cursor-pointer hover:text-white transition-colors">File</span>
          <span className="cursor-pointer hover:text-white transition-colors">Edit</span>
          <span className="cursor-pointer hover:text-white transition-colors">View</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-6 w-44 rounded bg-white/5 px-2.5 pl-7 text-[11px] text-white placeholder-white/30 border border-white/10 outline-none focus:border-[#60cdff]"
            />
            <Search size={12} className="absolute left-2 text-white/40" />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════ Notepad Text Area */}
      <div className="flex flex-1 min-h-0 min-w-0 bg-[#202020]">
        {/* Document Text Editor */}
        {activeNote ? (
          <textarea
            value={activeNote.content}
            onChange={(e) => handleUpdateContent(e.target.value)}
            placeholder="Type content..."
            wrap={wordWrap ? 'soft' : 'off'}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-[13px] text-white/90 outline-none leading-relaxed selection:bg-[#0078d4]/60 placeholder-white/20"
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-white/30 text-xs italic">
            No document open
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════ Windows 11 Status Bar */}
      {statusBar && activeNote && (
        <div className="flex h-6 shrink-0 items-center justify-between border-t border-white/10 bg-[#1c1c1c] px-4 text-[11px] text-white/50">
          <div className="flex items-center gap-6">
            <span>Ln {lineCount}, Col {charCount}</span>
            <span>{charCount} characters</span>
          </div>
          <div className="flex items-center gap-6">
            <span>100%</span>
            <span>Windows (CRLF)</span>
            <span>UTF-8</span>
          </div>
        </div>
      )}
    </div>
  );
}
