import React, { useEffect, useRef, useState } from 'react';
import { personal, projects, skillGroups, socials } from '@/data/content';

type TerminalHistoryItem = {
  command: string;
  output: React.ReactNode;
};

type Props = {
  onNavigate: (path: string) => void;
};

const COMMANDS = [
  'about',
  'projects',
  'experience',
  'social',
  'skills',
  'contact',
  'help',
  'ls',
  'clear',
  'exit',
  'gui',
];

const ARGUMENTS = ['about', 'projects', 'experience', 'social', 'skills', 'contact'];

export default function Terminal({ onNavigate }: Props) {
  const [history, setHistory] = useState<TerminalHistoryItem[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus terminal on mount and click
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  // Scroll to bottom on history change
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Tab completion helper
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const val = inputVal.trim();
      if (!val) return;

      const parts = val.split(/\s+/);
      if (parts.length === 1) {
        // Complete command
        const matches = COMMANDS.filter((cmd) => cmd.startsWith(parts[0]));
        if (matches.length === 1) {
          setInputVal(matches[0] + ' ');
        } else if (matches.length > 1) {
          // Print multiple matches as hint
          const output = <div className="text-muted-foreground">{matches.join('   ')}</div>;
          setHistory((prev) => [...prev, { command: val, output }]);
        }
      } else if (parts.length === 2 && parts[0] === 'cat') {
        // Complete argument for cat
        const matches = ARGUMENTS.filter((arg) => arg.startsWith(parts[1]));
        if (matches.length === 1) {
          setInputVal(`cat ${matches[0]}`);
        } else if (matches.length > 1) {
          const output = <div className="text-muted-foreground">{matches.join('   ')}</div>;
          setHistory((prev) => [...prev, { command: val, output }]);
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex < cmdHistory.length) {
        setHistoryIndex(nextIndex);
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const commandText = inputVal.trim();
    setInputVal('');
    setHistoryIndex(-1);

    if (!commandText) {
      setHistory((prev) => [...prev, { command: '', output: null }]);
      return;
    }

    // Add to command history list
    setCmdHistory((prev) => [...prev, commandText]);

    const parts = commandText.split(/\s+/);
    const mainCommand = parts[0].toLowerCase();
    const arg = parts.length > 1 ? parts[1].toLowerCase() : null;

    let output: React.ReactNode = null;

    if (mainCommand === 'clear') {
      setHistory([]);
      return;
    }

    if (mainCommand === 'exit' || mainCommand === 'gui') {
      onNavigate('/');
      return;
    }

    if (mainCommand === 'help') {
      output = (
        <div className="space-y-2 text-on-surface-variant font-mono text-sm leading-relaxed">
          <p className="text-primary font-bold">Available Commands:</p>
          <div className="grid grid-cols-[100px_1fr] gap-x-4">
            <span className="text-green-400">ls</span>
            <span>List all available sections / options.</span>
            
            <span className="text-green-400">cat [file]</span>
            <span>Display content of a section (e.g. <span className="text-primary">cat about</span>).</span>

            <span className="text-green-400">about</span>
            <span>Shortcut to display bio / personal overview.</span>

            <span className="text-green-400">projects</span>
            <span>Shortcut to display projects list.</span>

            <span className="text-green-400">experience</span>
            <span>Shortcut to display professional background.</span>

            <span className="text-green-400">skills</span>
            <span>Shortcut to display skill matrix.</span>

            <span className="text-green-400">social</span>
            <span>Shortcut to display social profiles.</span>

            <span className="text-green-400">contact</span>
            <span>Shortcut to display contact options.</span>

            <span className="text-green-400">clear</span>
            <span>Clear the terminal screen.</span>

            <span className="text-green-400">exit / gui</span>
            <span>Return back to the standard web layout.</span>
          </div>
          <p className="mt-2 text-xs text-outline/60">
            Protip: Use <span className="text-white font-bold">Tab</span> for autocomplete, and <span className="text-white font-bold">Up/Down Arrows</span> for command history.
          </p>
        </div>
      );
    } else if (mainCommand === 'ls') {
      output = (
        <div className="flex flex-wrap gap-x-8 text-primary font-bold font-mono">
          <span>about</span>
          <span>projects</span>
          <span>experience</span>
          <span>skills</span>
          <span>social</span>
          <span>contact</span>
        </div>
      );
    } else if (mainCommand === 'cat') {
      if (!arg) {
        output = <span className="text-red-400">Usage: cat [section-name] (e.g. cat about)</span>;
      } else {
        output = renderContentSection(arg);
      }
    } else if (ARGUMENTS.includes(mainCommand)) {
      // Shortcut commands directly executing like cat
      output = renderContentSection(mainCommand);
    } else {
      output = (
        <div className="text-red-400 font-mono">
          bash: command not found: {mainCommand}. Type <span className="text-white font-bold underline">help</span> for a list of available commands.
        </div>
      );
    }

    setHistory((prev) => [...prev, { command: commandText, output }]);
  };

  const renderContentSection = (section: string) => {
    switch (section) {
      case 'about':
        return (
          <div className="space-y-3 font-mono text-sm leading-relaxed max-w-3xl">
            <p className="text-primary font-bold text-base">## About Me</p>
            <p className="text-white"><span className="text-outline font-bold">Name:</span> {personal.name}</p>
            <p className="text-white"><span className="text-outline font-bold">Role:</span> {personal.role}</p>
            <p className="text-white"><span className="text-outline font-bold">Location:</span> {personal.location}</p>
            <div className="space-y-2 mt-2">
              {personal.bio.map((p, i) => (
                <p key={i} className="text-on-surface-variant leading-relaxed">{p}</p>
              ))}
            </div>
          </div>
        );
      case 'projects':
        return (
          <div className="space-y-6 font-mono text-sm leading-relaxed max-w-4xl">
            <p className="text-primary font-bold text-base">## Projects</p>
            {projects.map((proj, idx) => (
              <div key={idx} className="border-l-2 border-primary/40 pl-4 py-1 space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-green-400 font-bold text-base">{proj.title}</span>
                  <span className="text-outline text-xs">{proj.year}</span>
                </div>
                <p className="text-on-surface-variant">{proj.description}</p>
                <div className="flex flex-wrap gap-2 py-1 text-xs">
                  <span className="text-outline">Tech Stack:</span>
                  {proj.tags.map((t) => (
                    <span key={t} className="text-blue-300">[{t}]</span>
                  ))}
                </div>
                <div className="flex gap-4 text-xs pt-1">
                  <a href={proj.live} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-white transition-colors">Live Demo</a>
                  <a href={proj.github} target="_blank" rel="noopener noreferrer" className="text-outline underline hover:text-white transition-colors">GitHub Source</a>
                </div>
              </div>
            ))}
          </div>
        );
      case 'experience':
        return (
          <div className="space-y-4 font-mono text-sm leading-relaxed max-w-3xl">
            <p className="text-primary font-bold text-base">## Experience & Professional Background</p>
            <div className="space-y-3">
              <div className="border-l-2 border-primary/40 pl-4 py-1">
                <p className="text-white font-bold text-base">{personal.role}</p>
                <p className="text-outline text-xs">Full-Time | Remote & Hybrid Systems</p>
                <p className="text-on-surface-variant mt-2">
                  Specialize in building clean, event-driven backends, microservices, and interactive responsive user interfaces. Expert in React, Next.js, Fastify, Python (Django/Flask), Redis, and Azure cloud computing infrastructures.
                </p>
              </div>
              <div className="border-l-2 border-primary/40 pl-4 py-1">
                <p className="text-white font-bold text-base">Open Source & System Creator</p>
                <p className="text-on-surface-variant mt-1">
                  Creator of AI orchestration tools (AI-Gen CLI structure generator) and real-time multiplayer systems (CodeRaven collaborative editor). Strong focus on modular architecture and ultra-performant execution speed.
                </p>
              </div>
            </div>
          </div>
        );
      case 'skills':
        return (
          <div className="space-y-4 font-mono text-sm leading-relaxed">
            <p className="text-primary font-bold text-base">## Skill Matrix</p>
            <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
              {skillGroups.map((grp) => (
                <div key={grp.title} className="border border-outline-variant/30 p-3 rounded bg-surface-container-low/20">
                  <span className="text-green-400 font-bold block mb-1.5">&gt; {grp.title}</span>
                  <p className="text-on-surface-variant">{grp.items.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'social':
        return (
          <div className="space-y-2 font-mono text-sm leading-relaxed">
            <p className="text-primary font-bold text-base">## Social Links</p>
            <div className="grid grid-cols-[100px_1fr] gap-x-4">
              {socials.map((soc) => (
                <React.Fragment key={soc.label}>
                  <span className="text-outline">{soc.label}:</span>
                  <a href={soc.href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-white transition-colors">
                    {soc.handle}
                  </a>
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-2 font-mono text-sm leading-relaxed">
            <p className="text-primary font-bold text-base">## Contact Channels</p>
            <div className="grid grid-cols-[100px_1fr] gap-x-4">
              <span className="text-outline">Email:</span>
              <a href={`mailto:${personal.email}`} className="text-primary underline hover:text-white">{personal.email}</a>

              <span className="text-outline">Phone:</span>
              <span className="text-white">{personal.phone}</span>

              <span className="text-outline">Resume:</span>
              <a href={personal.resume} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-white">Download PDF</a>

              <span className="text-outline">Website:</span>
              <a href={personal.domain} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-white">{personal.domain}</a>
            </div>
          </div>
        );
      default:
        return (
          <span className="text-red-400">
            cat: {section}: No such file or section. Type <span className="text-white font-bold">ls</span> to see valid section names.
          </span>
        );
    }
  };

  return (
    <div
      onClick={handleTerminalClick}
      className="min-h-screen w-full bg-black text-[#dee2f5] font-mono p-4 flex flex-col cursor-text select-text"
      style={{ backgroundColor: '#000000' }}
    >
      {/* simulated terminal tab bar at the top */}
      <div className="w-full bg-[#0e1320] border border-outline-variant/30 rounded-t-soft p-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          {/* circle dots */}
          <button
            onClick={() => onNavigate('/')}
            className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] hover:bg-[#ff4b3e] transition-colors"
            title="Close / Exit Terminal"
          />
          <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
        </div>
        <span className="text-xs text-outline/80 font-mono">jiffyaneesh@portfolio: ~</span>
        <div className="w-16" /> {/* balance layout spacing */}
      </div>

      {/* main terminal content body */}
      <div className="flex-1 w-full border-x border-b border-outline-variant/30 bg-black p-4 md:p-6 overflow-y-auto space-y-4 rounded-b-soft">
        
        {/* large ASCII art banner text */}
        <pre className="overflow-x-auto text-[7px] sm:text-xs font-mono leading-none select-none text-primary/90 py-2">
{` █████  ███  ████████  ████████  ██████  ██   ██    ██████  ██   ██  █████  ██████  ███    ███  █████  
██   ██ ████ ██        ██       ██       ██   ██   ██       ██   ██ ██   ██ ██   ██ ████  ████ ██   ██ 
███████ ██ ██████      ██████    █████   ███████    █████   ███████ ███████ ██████  ██ ████ ██ ███████ 
██   ██ ██  ███        ██            ██  ██   ██        ██  ██   ██ ██   ██ ██   ██ ██  ██  ██ ██   ██ 
██   ██ ██   ██        ████████ ██████   ██   ██   ██████   ██   ██ ██   ██ ██   ██ ██      ██ ██   ██ `}
        </pre>

        {/* welcome message & hints */}
        <div className="space-y-1 text-sm text-on-surface-variant font-mono">
          <p className="text-white font-bold">Welcome to Aneesh Sharma's Interactive Terminal (v2.0.0)</p>
          <p className="text-outline/70">Press <span className="text-primary font-bold">ls</span> to query directories or type <span className="text-primary font-bold">help</span> to list all commands.</p>
          <p className="text-outline/70">Support <span className="text-white">[Tab]</span> for autocompletion and <span className="text-white">[Up/Down]</span> arrows for history recall.</p>
        </div>

        {/* command output stream */}
        <div className="space-y-4">
          {history.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold font-mono">aneesh@portfolio</span>
                <span className="text-white font-mono">:</span>
                <span className="text-blue-400 font-mono">~</span>
                <span className="text-green-500 font-bold font-mono">$</span>
                <span className="text-white font-mono">{item.command}</span>
              </div>
              {item.output && <div className="pl-4">{item.output}</div>}
            </div>
          ))}
        </div>

        {/* color-coded prompt line */}
        <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 pt-2">
          <span className="text-green-500 font-bold font-mono shrink-0">aneesh@portfolio</span>
          <span className="text-white font-mono shrink-0">:</span>
          <span className="text-blue-400 font-mono shrink-0">~</span>
          <span className="text-green-500 font-bold font-mono shrink-0">$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm p-0 m-0 caret-primary"
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </form>

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
