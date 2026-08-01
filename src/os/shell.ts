import { getDisk, lookup, parentPath, search } from './fs';
import type { FileNode, Platform } from './types';

/**
 * A tiny command interpreter over the virtual filesystem.
 *
 * ENGINE ONLY — it returns plain strings. PowerShell and zsh are drawn by their
 * own components (`WinTerminal`, `MacTerminal`) with different prompts, colours
 * and banner text; what they share is the part that would be silly to write
 * twice: resolving `..`, listing a folder, printing a file.
 *
 * Commands are deliberately few and real. A fake terminal that accepts anything
 * and answers with a joke gets boring in about four seconds; one where `cd`,
 * `ls` and `cat` genuinely walk a filesystem stays interesting because it
 * rewards poking around.
 */

export interface ShellState {
  platform: Platform;
  /** Absolute path of the working directory. */
  cwd: string;
}

export interface ShellResult {
  /** Lines to print. Empty array means the command printed nothing. */
  output: string[];
  /** New working directory, if the command changed it. */
  cwd?: string;
  /** Set by `clear`, so the view can wipe its scrollback. */
  clear?: boolean;
  /** Set by `exit` — the shell's owner decides what that means. */
  exit?: boolean;
  /** A path the caller should open in a GUI window (`open` / `start`). */
  openPath?: string;
}

/** Shorten the home directory to `~`, the way both real shells do. */
export const prettyPath = (platform: Platform, path: string): string => {
  const disk = getDisk(platform);
  return path.startsWith(disk.paths.home)
    ? `~${path.slice(disk.paths.home.length)}`
    : path;
};

/**
 * Resolve a user-typed path against the working directory.
 *
 * Handles `~`, `.`, `..`, absolute paths and multi-segment relative paths, in
 * both separator styles — a Windows user typing `cd Documents/Portfolio` with
 * forward slashes should still get there.
 */
export const resolvePath = (
  platform: Platform,
  cwd: string,
  input: string,
): string | null => {
  const disk = getDisk(platform);
  const sep = disk.sep;
  const raw = input.trim().replace(/["']/g, '');
  if (!raw) return cwd;

  // Accept either separator on input, then work in the platform's own.
  const normalised = raw.replace(/[\\/]+/g, sep);

  let base: string;
  let rest: string;

  if (normalised === '~' || normalised.startsWith(`~${sep}`)) {
    base = disk.paths.home;
    rest = normalised.slice(1);
  } else if (
    // "C:\..." on Windows, "/..." on macOS.
    (platform === 'windows' && /^[A-Za-z]:/.test(normalised)) ||
    (platform === 'mac' && normalised.startsWith(sep))
  ) {
    base = disk.root.path;
    rest = platform === 'windows' ? normalised.slice(2) : normalised;
  } else {
    base = cwd;
    rest = sep + normalised;
  }

  let current = base;
  for (const segment of rest.split(sep).filter(Boolean)) {
    if (segment === '.') continue;
    if (segment === '..') {
      current = parentPath(platform, current) ?? disk.root.path;
      continue;
    }
    // Case-insensitive match, like both real shells' tab completion.
    const node = lookup(platform, current);
    const child = node?.children?.find(
      (c) => c.name.toLowerCase() === segment.toLowerCase(),
    );
    if (!child) return null;
    current = child.path;
  }
  return current;
};

/** Pad a string to a column width, for `ls -l` style output. */
const pad = (text: string, width: number) => text.padEnd(width, ' ');

/** Format one node as an `ls -l` / `dir` row. */
const longRow = (node: FileNode): string =>
  `${node.kind === 'folder' ? 'd' : '-'}  ${pad(node.modified ?? '', 18)}${pad(
    node.kind === 'folder' ? '<DIR>' : (node.size ?? ''),
    12,
  )}${node.name}`;

/** The commands both shells accept. Platform-specific aliases are added below. */
const HELP_LINES = [
  'Available commands:',
  '',
  '  ls, dir            list the current directory',
  '  ls -l              list with size and date',
  '  cd <path>          change directory (~, .., absolute or relative)',
  '  cat, type <file>   print a file',
  '  tree               print the directory tree from here',
  '  find <query>       search the whole disk by name or contents',
  '  open, start <path> open a file or folder in a window',
  '  pwd                print the working directory',
  '  whoami             print the current user',
  '  neofetch           system summary',
  '  date               current date and time',
  '  echo <text>        print text',
  '  clear, cls         clear the screen',
  '  help               this list',
  '  exit               close the terminal',
];

/** Render a folder as an indented tree, depth-capped so it can't flood. */
const renderTree = (node: FileNode, prefix = '', depth = 0): string[] => {
  if (depth > 2) return [];
  const children = node.children ?? [];
  const lines: string[] = [];
  children.forEach((child, i) => {
    const last = i === children.length - 1;
    lines.push(`${prefix}${last ? '└── ' : '├── '}${child.name}`);
    if (child.kind === 'folder') {
      lines.push(...renderTree(child, `${prefix}${last ? '    ' : '│   '}`, depth + 1));
    }
  });
  return lines;
};

/**
 * Run one command line.
 *
 * Pure: takes state, returns output and any state change. That makes it
 * testable without a DOM, and lets both terminal components stay presentational.
 */
export function runCommand(state: ShellState, line: string): ShellResult {
  const { platform, cwd } = state;
  const disk = getDisk(platform);
  const trimmed = line.trim();
  if (!trimmed) return { output: [] };

  const [rawCmd, ...args] = trimmed.split(/\s+/);
  const cmd = rawCmd.toLowerCase();
  const arg = args.join(' ');

  switch (cmd) {
    /* ---------------------------------------------------------- listing */
    case 'ls':
    case 'dir': {
      const long = args.includes('-l') || args.includes('-la') || args.includes('/w');
      const target = args.filter((a) => !a.startsWith('-') && !a.startsWith('/')).join(' ');
      const path = target ? resolvePath(platform, cwd, target) : cwd;
      if (!path) return { output: [`${cmd}: ${target}: no such file or directory`] };

      const node = lookup(platform, path);
      if (!node) return { output: [`${cmd}: ${target}: no such file or directory`] };
      if (node.kind === 'file') return { output: [node.name] };

      const children = node.children ?? [];
      if (children.length === 0) return { output: [] };
      if (long) {
        return {
          output: [`total ${children.length}`, ...children.map(longRow)],
        };
      }
      /* Short form: folders get a trailing separator, like real `ls -F`. */
      return {
        output: [
          children
            .map((c) => (c.kind === 'folder' ? `${c.name}${disk.sep}` : c.name))
            .join('   '),
        ],
      };
    }

    /* ------------------------------------------------------- navigation */
    case 'cd': {
      if (!arg) return { output: [], cwd: disk.paths.home };
      const path = resolvePath(platform, cwd, arg);
      if (!path) return { output: [`cd: ${arg}: no such file or directory`] };
      const node = lookup(platform, path);
      if (node?.kind !== 'folder') return { output: [`cd: ${arg}: not a directory`] };
      return { output: [], cwd: path };
    }

    case 'pwd':
      return { output: [cwd] };

    /* ------------------------------------------------------------ files */
    case 'cat':
    case 'type': {
      if (!arg) return { output: [`${cmd}: missing operand`] };
      const path = resolvePath(platform, cwd, arg);
      if (!path) return { output: [`${cmd}: ${arg}: no such file or directory`] };
      const node = lookup(platform, path);
      if (!node) return { output: [`${cmd}: ${arg}: no such file or directory`] };
      if (node.kind === 'folder') return { output: [`${cmd}: ${arg}: is a directory`] };
      if (node.href) return { output: [`${node.name} → ${node.href}`] };
      if (!node.body) return { output: [`${cmd}: ${arg}: binary file, not printing`] };
      return { output: node.body.split('\n') };
    }

    case 'tree': {
      const path = arg ? resolvePath(platform, cwd, arg) : cwd;
      if (!path) return { output: [`tree: ${arg}: no such directory`] };
      const node = lookup(platform, path);
      if (node?.kind !== 'folder') return { output: [`tree: ${arg}: not a directory`] };
      return { output: [prettyPath(platform, node.path), ...renderTree(node)] };
    }

    case 'find':
    case 'grep': {
      if (!arg) return { output: [`${cmd}: missing search term`] };
      const hits = search(platform, arg, 20);
      if (hits.length === 0) return { output: [`No matches for "${arg}".`] };
      return {
        output: [
          `${hits.length} match${hits.length === 1 ? '' : 'es'}:`,
          ...hits.map((h) => `  ${prettyPath(platform, h.path)}`),
        ],
      };
    }

    /* Bridge to the GUI: `open README.md` pops the real window open. */
    case 'open':
    case 'start': {
      if (!arg) return { output: [`${cmd}: missing operand`] };
      const path = resolvePath(platform, cwd, arg);
      if (!path) return { output: [`${cmd}: ${arg}: no such file or directory`] };
      return { output: [`Opening ${arg}…`], openPath: path };
    }

    /* ----------------------------------------------------------- system */
    case 'whoami':
      return { output: [platform === 'windows' ? 'DESKTOP-AN33SH\\aneesh' : 'aneesh'] };

    case 'hostname':
      return { output: [platform === 'windows' ? 'DESKTOP-AN33SH' : 'aneeshs-macbook-pro'] };

    case 'date':
      return { output: [new Date().toString()] };

    case 'echo':
      return { output: [arg] };

    case 'neofetch':
    case 'fastfetch':
      return {
        output:
          platform === 'windows'
            ? [
                'aneesh@DESKTOP-AN33SH',
                '---------------------',
                'OS: Windows 11 Pro 23H2',
                'Shell: PowerShell 7.4',
                'Terminal: Windows Terminal',
                'CPU: Ryzen 7 (virtual)',
                'Memory: 5.2 GiB / 16 GiB',
                'Uptime: however long this tab has been open',
              ]
            : [
                'aneesh@aneeshs-macbook-pro',
                '--------------------------',
                'OS: macOS Sonoma 14.5',
                'Shell: zsh 5.9',
                'Terminal: Terminal.app',
                'CPU: Apple M3 (virtual)',
                'Memory: 6.1 GB / 16 GB',
                'Uptime: however long this tab has been open',
              ],
      };

    /* ------------------------------------------------------------ meta */
    case 'help':
    case 'man':
      return { output: HELP_LINES };

    case 'clear':
    case 'cls':
      return { output: [], clear: true };

    case 'exit':
    case 'quit':
      return { output: [], exit: true };

    /* A couple of gags, because a terminal with none feels sterile. */
    case 'sudo':
    case 'rm':
      return {
        output: [
          platform === 'windows'
            ? "'sudo' is not recognized. Try asking IT nicely."
            : 'aneesh is not in the sudoers file. This incident will be reported.',
        ],
      };

    case 'vim':
    case 'nano':
      return { output: ['Opened. Good luck getting out.'] };

    default:
      return {
        output: [
          platform === 'windows'
            ? `'${rawCmd}' is not recognized as a command. Type 'help' for a list.`
            : `zsh: command not found: ${rawCmd}`,
        ],
      };
  }
}

/** Command names offered to Tab-completion, shared by both shells. */
export const COMMANDS = [
  'ls', 'dir', 'cd', 'cat', 'type', 'tree', 'find', 'grep', 'open', 'start',
  'pwd', 'whoami', 'hostname', 'date', 'echo', 'neofetch', 'help', 'clear',
  'cls', 'exit',
];

/**
 * Tab-completion: complete a command name on the first word, otherwise complete
 * a child of whatever directory the partial path points at.
 */
export const complete = (state: ShellState, line: string): string | null => {
  const parts = line.split(/\s+/);
  const last = parts[parts.length - 1] ?? '';

  if (parts.length === 1) {
    const hit = COMMANDS.find((c) => c.startsWith(last.toLowerCase()));
    return hit ?? null;
  }

  const disk = getDisk(state.platform);
  const cut = Math.max(last.lastIndexOf('/'), last.lastIndexOf('\\'));
  const dirPart = cut >= 0 ? last.slice(0, cut) : '';
  const namePart = cut >= 0 ? last.slice(cut + 1) : last;

  const dir = resolvePath(state.platform, state.cwd, dirPart || '.');
  if (!dir) return null;
  const node = lookup(state.platform, dir);
  const hit = node?.children?.find((c) =>
    c.name.toLowerCase().startsWith(namePart.toLowerCase()),
  );
  if (!hit) return null;

  const completed = dirPart ? `${dirPart}${disk.sep}${hit.name}` : hit.name;
  return [...parts.slice(0, -1), completed].join(' ');
};

/* ---------------------------------------------------------------- self-check */

/**
 * Runnable check for the path resolver — the one genuinely tricky piece here
 * (`..` past the root, `~`, mixed separators, case-insensitive matching).
 * Called from the terminal components in dev only.
 */
export const __shellSelfCheck = () => {
  (['windows', 'mac'] as Platform[]).forEach((p) => {
    const disk = getDisk(p);
    const home = disk.paths.home;

    console.assert(resolvePath(p, home, '~') === home, `${p}: ~ resolves home`);
    console.assert(
      resolvePath(p, home, 'Desktop') === disk.paths.desktop,
      `${p}: relative child`,
    );
    console.assert(
      resolvePath(p, disk.paths.desktop, '..') === home,
      `${p}: .. goes up`,
    );
    // Walking past the root must clamp, not return null or a broken path.
    console.assert(
      resolvePath(p, disk.root.path, '../../..') === disk.root.path,
      `${p}: .. clamps at root`,
    );
    // Forward slashes must work even on the Windows disk.
    console.assert(
      resolvePath(p, home, 'Documents/Portfolio') === disk.paths.portfolio,
      `${p}: forward slashes accepted`,
    );
    // Case-insensitive, like both real shells.
    console.assert(
      resolvePath(p, home, 'documents') === disk.paths.documents,
      `${p}: case-insensitive`,
    );
    console.assert(resolvePath(p, home, 'nope') === null, `${p}: missing path is null`);

    // cd into a file must be refused, not silently accepted.
    const cdFile = runCommand({ platform: p, cwd: disk.paths.desktop }, 'cd about.md');
    console.assert(cdFile.cwd === undefined, `${p}: cd into a file refused`);

    // ls of the home directory must list something.
    const ls = runCommand({ platform: p, cwd: home }, 'ls');
    console.assert(ls.output.length > 0, `${p}: ls prints`);

    // cat of a real generated doc must print its body.
    const cat = runCommand({ platform: p, cwd: disk.paths.desktop }, 'cat about.md');
    console.assert(cat.output.length > 1, `${p}: cat prints a body`);

    // Tab completion must complete both a command and a path.
    console.assert(complete({ platform: p, cwd: home }, 'neo') === 'neofetch', `${p}: complete cmd`);
    console.assert(
      complete({ platform: p, cwd: home }, 'cd Desk')?.endsWith('Desktop'),
      `${p}: complete path`,
    );
  });
};
