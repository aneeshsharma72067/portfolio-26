import React, { useEffect, useRef, useState } from 'react';
import { personal, projects, skillGroups, socials, links } from '@/data/content';
import { PALETTE, findTheme, applyTheme, loadInitialTheme } from '@/lib/themes';
import TerminalFX, { fireConfetti, type FxEffect } from './TerminalFX';

type TerminalHistoryItem = {
  command: string;
  output: React.ReactNode;
};

type Props = {
  onNavigate: (path: string) => void;
};

/* Commands offered to Tab-completion. Kept flat + alphabetical-ish by group;
   the flashy easter-egg commands are intentionally NOT all advertised in help,
   but they still autocomplete for the curious. */
const COMMANDS = [
  'about',
  'projects',
  'experience',
  'social',
  'skills',
  'contact',
  'help',
  'ls',
  'cat',
  'clear',
  'exit',
  'gui',
  // fun / meta
  'neofetch',
  'whoami',
  'theme',
  'persona',
  'fortune',
  'history',
  'echo',
  'date',
  'pwd',
  'uname',
  'man',
  'coffee',
  'sl',
  'hack',
  'nmap',
  'cmatrix',
  'sudo',
];

const ARGUMENTS = ['about', 'projects', 'experience', 'social', 'skills', 'contact'];

/* Rotating dev quips for the `fortune` command. */
const FORTUNES = [
  'Corruption is just legacy code nobody wants to refactor. ~ Me',
  'There are two hard things in CS: cache invalidation, naming things, and off-by-one errors.',
  'It works on my machine. Ship the machine.',
  'Weeks of coding can save you hours of planning.',
  'A user interface is like a joke. If you have to explain it, it’s not that good.',
  'The best error message is the one that never shows up.',
  'Premature optimization is the root of all evil — but so is a 4s page load.',
  'Rust because I want crazy fast performance. Python because I want Jarvis.',
];

/* Tiny ASCII teapot for the `coffee` / 418 gag. */
const COFFEE_CUP = [
  '    ( (',
  '     ) )',
  '  ........',
  '  |      |]',
  '  \\      /',
  '   `----`',
].join('\n');

/* Compact ASCII sigil printed alongside neofetch specs. */
const NEOFETCH_SIGIL = String.raw`
    /\\_/\\
   ( o.o )   AS
    > ^ <   ._____.
   /     \\  |>_<|
  (_______) '-----'
`;

export default function Terminal({ onNavigate }: Props) {
  const [history, setHistory] = useState<TerminalHistoryItem[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Round-robin cursor so successive `fortune` calls cycle instead of repeat.
  const fortuneIndex = useRef(0);

  // Active fullscreen effect, if any (rm-rf blast, matrix rain, sl train, …).
  // When set, TerminalFX takes over the screen until it finishes / is dismissed.
  const [fx, setFx] = useState<FxEffect | null>(null);
  // Live boot clock — drives the `date` command's readout and neofetch uptime.
  const [now, setNow] = useState(() => new Date());

  // Auto-focus terminal on mount and click
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Tick a clock once a second so `date` / `neofetch` reflect real time.
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
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

    // ---- sudo: handle the dangerous/gag variants before generic dispatch ----
    if (mainCommand === 'sudo') {
      const rest = parts.slice(1).map((p) => p.toLowerCase());

      // The signature moment: `sudo rm -rf --no-preserve-root` (or any rm -rf /)
      // fires the deletion blast, then drops the user back on the homepage.
      const isRmRf =
        rest[0] === 'rm' &&
        rest.some((p) => p.includes('r')) && // -rf / -r style flag
        (rest.includes('--no-preserve-root') || rest.includes('/'));
      if (isRmRf || commandText.includes('rm -rf --no-preserve-root')) {
        setHistory((prev) => [
          ...prev,
          {
            command: commandText,
            output: <span className="text-red-400">Permission granted. Goodbye, cruel filesystem…</span>,
          },
        ]);
        setFx('blast');
        return;
      }

      // `sudo make me a sandwich` → the xkcd #149 gag.
      if (rest.join(' ').startsWith('make me a sandwich')) {
        output = <span className="text-white">Okay. 🥪</span>;
        setHistory((prev) => [...prev, { command: commandText, output }]);
        return;
      }

      // `sudo hire aneesh` → celebratory confetti + jump to contact.
      if (rest[0] === 'hire') {
        fireConfetti();
        output = (
          <div className="space-y-1 font-mono text-sm">
            <p className="text-green-400 font-bold">✔ Excellent decision. Deploying Aneesh…</p>
            <p className="text-on-surface-variant">
              Reach out:{' '}
              <a href={links.email} className="text-primary underline hover:text-white">
                {personal.email}
              </a>
            </p>
          </div>
        );
        setHistory((prev) => [...prev, { command: commandText, output }]);
        return;
      }

      // Bare `sudo` (or anything else) → the classic sudoers scolding.
      output = (
        <div className="text-red-400 font-mono">
          {personal.name.split(' ')[0].toLowerCase()} is not in the sudoers file. This incident will be reported.
        </div>
      );
      setHistory((prev) => [...prev, { command: commandText, output }]);
      return;
    }

    // ---- fork bomb: :(){ :|:& };: -----------------------------------------
    if (commandText.replace(/\s/g, '') === ':(){:|:&};:') {
      setHistory((prev) => [
        ...prev,
        { command: commandText, output: <span className="text-red-400">forking… forking… forking…</span> },
      ]);
      setFx('forkbomb');
      return;
    }

    // ---- fullscreen effect commands ---------------------------------------
    if (mainCommand === 'cmatrix') {
      setHistory((prev) => [...prev, { command: commandText, output: null }]);
      setFx('matrix');
      return;
    }
    if (mainCommand === 'sl') {
      setHistory((prev) => [...prev, { command: commandText, output: null }]);
      setFx('train');
      return;
    }
    if (mainCommand === 'hack' || mainCommand === 'nmap') {
      output = renderHack();
      setHistory((prev) => [...prev, { command: commandText, output }]);
      return;
    }

    // ---- theme / persona switching ----------------------------------------
    if (mainCommand === 'theme') {
      output = handleTheme(arg);
      setHistory((prev) => [...prev, { command: commandText, output }]);
      return;
    }
    if (mainCommand === 'persona') {
      output = handlePersona(arg);
      setHistory((prev) => [...prev, { command: commandText, output }]);
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

            <span className="text-green-400">neofetch</span>
            <span>Show the system info card.</span>

            <span className="text-green-400">theme [id]</span>
            <span>Switch site theme (e.g. <span className="text-primary">theme p5r</span>; <span className="text-primary">theme list</span> for all).</span>

            <span className="text-green-400">whoami</span>
            <span>Who is this, anyway?</span>

            <span className="text-green-400">history</span>
            <span>List commands run this session.</span>
          </div>
          <p className="mt-2 text-xs text-outline/60">
            Protip: Use <span className="text-white font-bold">Tab</span> for autocomplete, and <span className="text-white font-bold">Up/Down Arrows</span> for command history.
          </p>
          <p className="text-xs text-outline/50">
            …and a few things aren't on this list. Try <span className="text-white">fortune</span>, <span className="text-white">sl</span>, <span className="text-white">cmatrix</span>, <span className="text-white">persona 5</span>, or something a real sysadmin would <span className="text-red-400">never</span> type. 😈
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
    } else if (mainCommand === 'neofetch') {
      output = renderNeofetch();
    } else if (mainCommand === 'whoami') {
      output = (
        <div className="font-mono text-sm text-on-surface-variant space-y-1">
          <p className="text-white font-bold">{personal.name}</p>
          <p>{personal.role} — {personal.location}</p>
          <p className="text-outline/70">Not just a username. A whole vibe.</p>
        </div>
      );
    } else if (mainCommand === 'fortune') {
      output = <span className="text-primary italic">“{FORTUNES[fortuneIndex.current++ % FORTUNES.length]}”</span>;
    } else if (mainCommand === 'history') {
      output = (
        <div className="font-mono text-sm text-on-surface-variant">
          {cmdHistory.length === 0 ? (
            <span className="text-outline/60">No history yet.</span>
          ) : (
            cmdHistory.map((c, i) => (
              <div key={i} className="grid grid-cols-[40px_1fr] gap-x-3">
                <span className="text-outline/60 text-right">{i + 1}</span>
                <span className="text-white">{c}</span>
              </div>
            ))
          )}
        </div>
      );
    } else if (mainCommand === 'echo') {
      output = <span className="text-white">{parts.slice(1).join(' ')}</span>;
    } else if (mainCommand === 'date') {
      output = <span className="text-white">{now.toString()}</span>;
    } else if (mainCommand === 'pwd') {
      output = <span className="text-white">/home/aneesh/portfolio</span>;
    } else if (mainCommand === 'uname') {
      output = <span className="text-white">PortfolioOS 2.0.0 x86_64 — powered by curiosity ☕</span>;
    } else if (mainCommand === 'man') {
      output = arg ? (
        <div className="font-mono text-sm text-on-surface-variant space-y-1">
          <p className="text-white font-bold">{arg.toUpperCase()}(1)</p>
          <p>No real man page here — try <span className="text-primary">help</span> for what actually works.</p>
        </div>
      ) : (
        <span className="text-red-400">What manual page do you want?</span>
      );
    } else if (mainCommand === 'coffee' || mainCommand === 'brew') {
      output = (
        <div className="font-mono text-sm text-amber-300 space-y-1">
          <pre className="leading-none">{COFFEE_CUP}</pre>
          <p className="text-red-400">HTTP 418: I'm a teapot. Cannot brew coffee. ☕</p>
        </div>
      );
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

  /**
   * `theme <id|list>` — switch the site theme from the terminal. Reuses the
   * shared palette + applyTheme so the choice persists and the visual dial
   * reflects it on the GUI side too.
   */
  const handleTheme = (id: string | null): React.ReactNode => {
    if (!id || id === 'list') {
      return (
        <div className="font-mono text-sm space-y-1">
          <p className="text-primary font-bold">Available themes:</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {PALETTE.map((t) => (
              <span key={t.id} style={{ color: t.accent }}>{t.id}</span>
            ))}
          </div>
          <p className="text-outline/60 text-xs">Usage: theme &lt;id&gt; (e.g. theme p5r)</p>
        </div>
      );
    }
    const match = findTheme(id);
    if (!match) {
      return <span className="text-red-400">theme: '{id}' not found. Try <span className="text-white">theme list</span>.</span>;
    }
    applyTheme(match);
    return (
      <span className="text-white">
        Theme set to <span style={{ color: match.accent }} className="font-bold">{match.label}</span>. ✨
      </span>
    );
  };

  /**
   * `persona <3|4|5>` — summon a Persona; sets that game's signature theme and
   * prints a tarot-flavoured card. A playful shortcut over the P3R/P4/P5R themes.
   */
  const handlePersona = (which: string | null): React.ReactNode => {
    const map: Record<string, { id: string; arcana: string; line: string }> = {
      '3': { id: 'p3r', arcana: 'The Fool',    line: 'Memento mori. Time never waits.' },
      '4': { id: 'p4g', arcana: 'The Magician', line: 'The truth lies within the fog.' },
      '5': { id: 'p5r', arcana: 'The World',    line: 'Take your heart. You are the trickster.' },
    };
    const key = which?.replace(/[^345]/g, '') ?? '';
    const pick = map[key];
    if (!pick) {
      return <span className="text-red-400">persona: choose 3, 4, or 5 (e.g. persona 5)</span>;
    }
    const theme = findTheme(pick.id)!;
    applyTheme(theme);
    return (
      <div className="font-mono text-sm space-y-1">
        <p style={{ color: theme.accent }} className="font-bold">🃏 {pick.arcana} — Persona {key} awakened.</p>
        <p className="text-on-surface-variant italic">“{pick.line}”</p>
        <p className="text-outline/60 text-xs">Theme locked to {theme.label}.</p>
      </div>
    );
  };

  /** neofetch-style system card: ASCII sigil + faux specs (some real). */
  const renderNeofetch = (): React.ReactNode => {
    const active = loadInitialTheme();
    const rows: [string, string][] = [
      ['User', `${personal.name.split(' ')[0].toLowerCase()}@portfolio`],
      ['OS', 'PortfolioOS 2.0.0 (React + Vite)'],
      ['Role', personal.role],
      ['Location', personal.location],
      ['Uptime', 'coding since ~2021'],
      ['Shell', 'aneesh-sh 5.1'],
      ['Theme', active.label],
      ['Editor', 'Neovim btw'],
      ['CPU', 'Caffeine-driven ☕'],
    ];
    return (
      <div className="flex flex-col sm:flex-row gap-4 font-mono text-xs sm:text-sm">
        <pre className="text-primary leading-none">{NEOFETCH_SIGIL}</pre>
        <div className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-0.5 content-start">
          {rows.map(([k, v]) => (
            <React.Fragment key={k}>
              <span className="text-green-400 font-bold">{k}</span>
              <span className="text-on-surface-variant">{v}</span>
            </React.Fragment>
          ))}
          <div className="col-span-2 mt-1 flex gap-1">
            {PALETTE.slice(0, 8).map((t) => (
              <span key={t.id} className="w-3 h-3 rounded-sm inline-block" style={{ background: t.accent }} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  /** Fake "Hollywood hacking" stream for `hack` / `nmap`. */
  const renderHack = (): React.ReactNode => (
    <div className="font-mono text-xs text-green-400 space-y-0.5">
      <p>Starting scan on 10.0.0.0/24 …</p>
      <p>[+] 22/tcp open ssh</p>
      <p>[+] 80/tcp open http</p>
      <p>[+] 443/tcp open https</p>
      <p>Injecting payload <span className="text-white">0xDEADBEEF</span> … bypassing firewall …</p>
      <p>Cracking WPA2 handshake … <span className="text-white">98%</span> … <span className="text-white">100%</span></p>
      <p className="text-primary font-bold">ACCESS GRANTED — just kidding. This is a portfolio 😄</p>
    </div>
  );

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

  /**
   * Called when an active fullscreen effect finishes / is dismissed. The blast
   * is terminal (pun intended) — it deletes the "filesystem" and drops the user
   * back on the GUI homepage. Every other effect just clears itself.
   */
  const handleFxDone = () => {
    const finished = fx;
    setFx(null);
    if (finished === 'blast') onNavigate('/');
  };

  return (
    <div
      onClick={handleTerminalClick}
      className="min-h-screen w-full bg-black text-[#dee2f5] font-mono p-4 flex flex-col cursor-text select-text"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Fullscreen cinematic overlay — only mounted while an effect is running */}
      {fx && <TerminalFX effect={fx} onDone={handleFxDone} />}

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
