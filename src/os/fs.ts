/**
 * The virtual filesystem behind /computer.
 *
 * Two complete disks are built from ONE builder function: a Windows `C:\` and a
 * macOS `/`. They differ in the way the real ones do — separator, drive letter,
 * `Program Files` vs `Applications`, `AppData` vs `Library` — but the portfolio
 * content inside them comes from the same `src/data/content.ts` the homepage and
 * the /cli terminal read. Editing a project description in one place updates the
 * homepage, the terminal and both desktops together.
 *
 * The important shift from the previous version: the portfolio is no longer the
 * whole disk. It lives in `Documents\Portfolio` and `Pictures\Gallery` the way
 * real files would, surrounded by the ordinary furniture of a computer — system
 * folders, installed apps, downloads, logs, a half-finished shopping list. The
 * desktop only holds shortcuts, like a desktop actually does.
 *
 * Both trees are built once at module scope (they depend only on static
 * imports), so opening a folder is a plain object lookup with no work per render.
 */
import {
  personal,
  socials,
  projects,
  experiences,
  skillGroups,
  nowPlaying,
} from '@/data/content';
import img1 from '@/assets/image/gallery/1.webp';
import img2 from '@/assets/image/gallery/2.webp';
import img3 from '@/assets/image/gallery/3.webp';
import img4 from '@/assets/image/gallery/4.webp';
import img5 from '@/assets/image/gallery/5.webp';
import type { FileNode, Platform } from './types';

const GALLERY = [
  { src: img1, name: 'alps-vista' },
  { src: img2, name: 'tokyo-spectrum' },
  { src: img3, name: 'reykjavik-horizon' },
  { src: img4, name: 'seoul-neon' },
  { src: img5, name: 'banff-peak' },
];

/* ------------------------------------------------------------------ helpers */

/** Format a byte count the way a file manager does. */
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/**
 * A builder bound to one platform's path syntax.
 *
 * Every node factory below takes a *parent path* and a name rather than a full
 * path, so the same tree definition produces `C:\Users\aneesh\Desktop` and
 * `/Users/aneesh/Desktop` without a single string being written twice.
 */
function makeBuilder(platform: Platform) {
  const sep = platform === 'windows' ? '\\' : '/';

  /** Join a parent path and a child name using the platform separator. */
  const join = (parent: string, name: string) =>
    parent.endsWith(sep) ? `${parent}${name}` : `${parent}${sep}${name}`;

  /** A text/markdown file that opens in the reader. */
  const doc = (
    parent: string,
    name: string,
    body: string,
    modified = '2026-07-29 14:02',
  ): FileNode => {
    const text = body.trim();
    const bytes = new Blob([text]).size;
    return {
      path: join(parent, name),
      name,
      kind: 'file',
      app: 'reader',
      ext: name.split('.').pop() ?? 'txt',
      body: text,
      bytes,
      size: formatSize(bytes),
      modified,
    };
  };

  /** An image file that opens in the image viewer. */
  const image = (
    parent: string,
    name: string,
    src: string,
    modified = '2026-06-11 09:31',
  ): FileNode => ({
    path: join(parent, name),
    name,
    kind: 'file',
    app: 'image',
    ext: 'image',
    src,
    // Real byte counts aren't knowable for a bundled asset; these are plausible
    // and stable, which is all the detail column needs.
    bytes: 1_800_000,
    size: '1.8 MB',
    modified,
  });

  /** A shortcut that opens an external URL in a new tab instead of a window. */
  const link = (parent: string, name: string, href: string): FileNode => ({
    path: join(parent, name),
    name,
    kind: 'file',
    app: 'reader',
    ext: 'link',
    href,
    bytes: 1024,
    size: '1 KB',
    modified: '2026-07-29 14:02',
  });

  /** A launcher for an installed app — double-clicking opens that app's window. */
  const exe = (
    parent: string,
    name: string,
    app: FileNode['app'],
    bytes = 24_000_000,
  ): FileNode => ({
    path: join(parent, name),
    name,
    kind: 'file',
    app,
    ext: 'exe',
    bytes,
    size: formatSize(bytes),
    modified: '2026-01-14 08:00',
  });

  /**
   * A system binary. Opens nothing useful (the reader shows a "protected"
   * note), exists purely so `System32` / `/System` look inhabited.
   */
  const sys = (parent: string, name: string, bytes: number): FileNode => ({
    path: join(parent, name),
    name,
    kind: 'file',
    app: 'reader',
    ext: name.endsWith('.dll') || name.endsWith('.dylib') ? 'dll' : 'exe',
    body: `${name} is a protected operating system file.\n\nAccess is denied.`,
    system: true,
    bytes,
    size: formatSize(bytes),
    modified: '2025-11-02 03:14',
  });

  /** A folder. `app` is always `files`; children are ordered as given. */
  const folder = (
    parent: string,
    name: string,
    children: FileNode[],
    opts: { system?: boolean; modified?: string } = {},
  ): FileNode => ({
    path: join(parent, name),
    name,
    kind: 'folder',
    app: 'files',
    children,
    system: opts.system,
    size: `${children.length} items`,
    modified: opts.modified ?? '2026-07-29 14:02',
  });

  return { sep, join, doc, image, link, exe, sys, folder };
}

/* ------------------------------------------------------- generated documents */

const ABOUT_MD = `
# ${personal.name}
${personal.role} · ${personal.location}

${personal.bio.join('\n\n')}

---
Email: ${personal.email}
Phone: ${personal.phone}
Web:   ${personal.domain}
`;

/** One README per project, generated from the same object the Work grid uses. */
const projectReadme = (p: (typeof projects)[number]) => `
# ${p.title}
${p.year} · ${p.tags.join(' · ')}

${p.description}

---
Live:   ${p.live}
Source: ${p.github}
`;

const EXPERIENCE_MD = `
# Experience

${experiences
  .map(
    (e) => `## ${e.role} — ${e.company}
${e.period}${e.current ? ' (current)' : ''}

${e.description}`,
  )
  .join('\n\n')}
`;

const SKILLS_MD = `
# Skills

${skillGroups.map((g) => `## ${g.title}\n${g.items.map((i) => `- ${i}`).join('\n')}`).join('\n\n')}
`;

/** A real vCard — this one is genuinely importable if you save the text. */
const CONTACT_VCF = `
BEGIN:VCARD
VERSION:3.0
FN:${personal.name}
TITLE:${personal.role}
EMAIL;type=INTERNET:${personal.email}
TEL;type=CELL:${personal.phone}
ADR;type=HOME:;;;${personal.location};;;
URL:${personal.domain}
${socials.map((s) => `X-SOCIALPROFILE;type=${s.label.toLowerCase()}:${s.href}`).join('\n')}
END:VCARD
`;

/* Ordinary clutter. A real home directory is mostly this, not a CV. */

const SHOPPING_LIST = `
milk
coffee beans (the good ones)
usb-c cable — the third one this year
birthday card for mum
NOT another mechanical keyboard
`;

const IDEAS_TXT = `
# ideas.txt

- portfolio that boots into a fake OS  <- doing this one
- cli that tells you your git blame in the voice of a disappointed parent
- browser extension that replaces "synergy" with "nonsense" on every page
- app that plays a rimshot when a test suite goes green
- (crossed out) blockchain for laundry
`;

const PASSWORDS_TXT = `
# passwords.txt

Nice try.

If you were hoping for credentials in a plaintext file on a fake desktop,
you'd have found them on a real one about 40% of the time. Use a password
manager, and turn on 2FA while you're here.
`;

const CHANGELOG_MD = `
# Changelog — portfolio

## v2.0 — 2026
- Rebuilt /computer as two separate desktops instead of one skinned shell
- Added Terminal, Task Manager, Calculator, Recycle Bin
- Real filesystem: system folders, installed apps, downloads

## v1.0 — 2025
- First version. One page, one scroll, far too many gradients.
`;

const SETUP_LOG = `
[2026-01-14 08:00:12] Setup started
[2026-01-14 08:00:12] Detected: 16 GB RAM, 1 TB NVMe
[2026-01-14 08:02:48] Copying files (1 of 4,812)
[2026-01-14 08:19:03] Installing devices
[2026-01-14 08:31:55] Getting ready
[2026-01-14 08:31:56] This will only take a moment
[2026-01-14 08:47:02] This is taking longer than a moment
[2026-01-14 09:04:31] Setup complete
`;

const README_FIRST = `
# read-me-first.txt

You found the desktop.

Everything under Documents\\Portfolio is real data — the same source that feeds
the homepage and the /cli terminal. Everything else is set dressing, put here
so this feels like a computer rather than a CV wearing a taskbar.

Things worth trying:
  · Double-click a folder, or an app in Program Files
  · Drag windows by their titlebar, drag their edges to resize
  · Open the Terminal and type: ls, cd, cat, tree, help
  · Delete a desktop file — it lands in the Recycle Bin, and restores from it
  · Search from the Start menu (Windows) or Spotlight, ⌘-Space (macOS)
  · Switch OS from the Start menu / Apple menu — a real reboot, not a repaint

Now playing: ${nowPlaying.track} — ${nowPlaying.artist}
`;

const ZSHRC = `
# ~/.zshrc — sourced for interactive shells

export EDITOR=nvim
export VISUAL=nvim

alias ll='ls -lah'
alias gs='git status -sb'
alias please='sudo'
alias fixit='rm -rf node_modules && npm i'

# The one that actually matters
alias deploy='git push && echo "praying" && sleep 3'

# TODO: learn to exit vim without :q!
`;

const GITCONFIG = `
[user]
	name = ${personal.name}
	email = ${personal.email}
[init]
	defaultBranch = main
[alias]
	oops = commit --amend --no-edit
	undo = reset --soft HEAD~1
	yikes = reset --hard HEAD
[pull]
	rebase = true
`;

/* -------------------------------------------------------------- tree builder */

/**
 * Build one platform's complete disk.
 *
 * The shape is deliberately the same on both sides so the file managers can be
 * written against it without branching; only the names and the top-level
 * layout differ, which is exactly where the two real systems differ too.
 */
function buildTree(platform: Platform) {
  const b = makeBuilder(platform);
  const win = platform === 'windows';

  /* The paths that everything else hangs off. Written once, here. */
  const root = win ? 'C:' : '';
  const usersDir = win ? 'C:\\Users' : '/Users';
  const home = win ? 'C:\\Users\\aneesh' : '/Users/aneesh';

  const desktop = b.join(home, 'Desktop');
  const documents = b.join(home, 'Documents');
  const downloads = b.join(home, 'Downloads');
  const pictures = b.join(home, 'Pictures');
  const music = b.join(home, 'Music');
  const videos = win ? b.join(home, 'Videos') : b.join(home, 'Movies');
  const portfolio = b.join(documents, 'Portfolio');
  const gallery = b.join(pictures, 'Gallery');
  const projectsDir = b.join(portfolio, 'Projects');
  const screenshots = b.join(pictures, 'Screenshots');

  /* --------------------------------------------------------- Documents */

  /** One folder per project, each with its README, preview and links. */
  const projectFolders = projects.map((p) => {
    const dir = b.join(projectsDir, p.title);
    return b.folder(projectsDir, p.title, [
      b.doc(dir, 'README.md', projectReadme(p)),
      b.image(dir, 'preview.png', p.image),
      b.link(dir, win ? 'live.url' : 'live.webloc', p.live),
      b.link(dir, win ? 'source.url' : 'source.webloc', p.github),
    ]);
  });

  const portfolioFolder = b.folder(documents, 'Portfolio', [
    b.folder(portfolio, 'Projects', projectFolders),
    b.doc(portfolio, 'about.md', ABOUT_MD),
    b.doc(portfolio, 'experience.md', EXPERIENCE_MD),
    b.doc(portfolio, 'skills.md', SKILLS_MD),
    b.doc(portfolio, 'contact.vcf', CONTACT_VCF),
    b.doc(portfolio, 'changelog.md', CHANGELOG_MD),
    {
      /* The resume is a real PDF in /public — open it in a new tab rather than
         pretending to render a PDF viewer we don't have. */
      path: b.join(portfolio, 'resume.pdf'),
      name: 'resume.pdf',
      kind: 'file' as const,
      app: 'reader' as const,
      ext: 'pdf',
      href: personal.resume,
      bytes: 186_368,
      size: '182 KB',
      modified: '2026-07-12 18:44',
    },
  ]);

  const linksFolder = b.folder(
    documents,
    'Links',
    socials.map((s) =>
      b.link(b.join(documents, 'Links'), `${s.label}${win ? '.url' : '.webloc'}`, s.href),
    ),
  );

  const documentsFolder = b.folder(home, 'Documents', [
    portfolioFolder,
    linksFolder,
    b.doc(documents, 'ideas.txt', IDEAS_TXT, '2026-07-30 23:11'),
    b.doc(documents, 'shopping-list.txt', SHOPPING_LIST, '2026-07-31 09:20'),
    b.doc(documents, 'passwords.txt', PASSWORDS_TXT, '2026-03-02 01:44'),
  ]);

  /* ---------------------------------------------------------- Pictures */

  const picturesFolder = b.folder(home, 'Pictures', [
    b.folder(
      pictures,
      'Gallery',
      GALLERY.map((g) => b.image(gallery, `${g.name}.webp`, g.src)),
    ),
    b.folder(pictures, 'Screenshots', [
      b.image(screenshots, 'Screenshot 2026-07-14 at 02.11.38.png', img2),
      b.image(screenshots, 'Screenshot 2026-07-14 at 02.11.52.png', img4),
    ]),
  ]);

  /* --------------------------------------------------------- Downloads */

  const downloadsFolder = b.folder(home, 'Downloads', [
    b.doc(
      downloads,
      'invoice-final-FINAL-v3.txt',
      'Amount due: 0.00\nStatus: paid\nNote: renamed four times, still not final.',
      '2026-07-22 16:05',
    ),
    b.image(downloads, 'wallpaper-4k.webp', img3, '2026-06-30 21:47'),
    b.doc(
      downloads,
      'totally-not-a-virus.txt',
      'It is not a virus.\n\nIt is a text file. You are on a portfolio site.',
      '2026-05-18 02:33',
    ),
  ]);

  /* ------------------------------------------------- Music and Videos */

  const musicFolder = b.folder(home, win ? 'Music' : 'Music', [
    b.doc(
      music,
      'now-playing.txt',
      `${nowPlaying.track}\n${nowPlaying.artist}\n\n${nowPlaying.href}`,
      '2026-08-01 08:12',
    ),
  ]);

  const videosFolder = b.folder(home, win ? 'Videos' : 'Movies', [
    b.doc(
      videos,
      'demo-reel.txt',
      'Placeholder. The video codec on this machine is imaginary.',
      '2026-04-04 12:00',
    ),
  ]);

  /* ----------------------------------------------------------- Desktop */

  /* A real desktop holds shortcuts and a couple of stray files, not an entire
     document library. */
  const desktopFolder = b.folder(home, 'Desktop', [
    b.exe(desktop, win ? 'Terminal.lnk' : 'Terminal.app', 'terminal', 8_400_000),
    b.exe(desktop, win ? 'Portfolio.lnk' : 'Portfolio.app', 'files', 2_100_000),
    b.doc(desktop, 'read-me-first.txt', README_FIRST, '2026-08-01 07:55'),
    b.doc(desktop, 'about.md', ABOUT_MD),
    b.image(desktop, 'banff-peak.webp', img5),
    b.link(desktop, win ? 'GitHub.url' : 'GitHub.webloc', socials[0]?.href ?? personal.domain),
  ]);

  /* ------------------------------------------------------- hidden config */

  const configFiles = win
    ? [
        b.folder('C:\\Users\\aneesh\\AppData', 'Roaming', [
          b.doc('C:\\Users\\aneesh\\AppData\\Roaming', '.gitconfig', GITCONFIG),
        ]),
        b.folder('C:\\Users\\aneesh\\AppData', 'Local', [
          b.doc('C:\\Users\\aneesh\\AppData\\Local', 'setup.log', SETUP_LOG),
        ]),
      ]
    : [
        b.doc('/Users/aneesh/Library', '.zshrc', ZSHRC),
        b.doc('/Users/aneesh/Library', '.gitconfig', GITCONFIG),
        b.doc('/Users/aneesh/Library', 'setup.log', SETUP_LOG),
      ];

  const homeChildren: FileNode[] = [
    desktopFolder,
    documentsFolder,
    downloadsFolder,
    picturesFolder,
    musicFolder,
    videosFolder,
    win
      ? b.folder(home, 'AppData', configFiles, { system: true })
      : b.folder(home, 'Library', configFiles, { system: true }),
  ];

  /* macOS keeps its dotfiles in the home directory itself. */
  if (!win) {
    homeChildren.push(b.doc(home, '.zshrc', ZSHRC), b.doc(home, '.gitconfig', GITCONFIG));
  }

  const homeFolder = b.folder(usersDir, 'aneesh', homeChildren);

  /* ------------------------------------------------------ installed apps */

  /* The app launchers, so double-clicking one in Program Files / Applications
     opens the same window the dock does. */
  const appsDir = win ? 'C:\\Program Files' : '/Applications';
  const installedApps = [
    b.exe(appsDir, win ? 'Terminal.exe' : 'Terminal.app', 'terminal', 8_400_000),
    b.exe(appsDir, win ? 'Calculator.exe' : 'Calculator.app', 'calc', 3_200_000),
    b.exe(appsDir, win ? 'Photos.exe' : 'Photos.app', 'photos', 41_000_000),
    b.exe(appsDir, win ? 'Notepad.exe' : 'Notes.app', 'notes', 1_900_000),
    b.exe(
      appsDir,
      win ? 'Task Manager.exe' : 'Activity Monitor.app',
      'taskmgr',
      6_700_000,
    ),
    b.exe(appsDir, win ? 'Settings.exe' : 'System Settings.app', 'settings', 12_000_000),
  ];

  /* ------------------------------------------------------- system folder */

  const systemDir = win ? 'C:\\Windows' : '/System';
  const system32 = win ? 'C:\\Windows\\System32' : '/System/Library';

  const systemFolder = b.folder(
    root,
    win ? 'Windows' : 'System',
    [
      b.folder(
        systemDir,
        win ? 'System32' : 'Library',
        [
          b.sys(system32, win ? 'kernel32.dll' : 'libSystem.dylib', 1_140_000),
          b.sys(system32, win ? 'user32.dll' : 'CoreGraphics.dylib', 1_620_000),
          b.sys(system32, win ? 'cmd.exe' : 'zsh', 289_000),
          b.sys(system32, win ? 'notepad.exe' : 'TextEdit', 201_000),
        ],
        { system: true },
      ),
      b.folder(systemDir, win ? 'Temp' : 'Caches', [], { system: true }),
    ],
    { system: true },
  );

  /* ----------------------------------------------------------- the root */

  const rootChildren: FileNode[] = win
    ? [
        b.folder(root, 'Program Files', installedApps, { system: true }),
        b.folder(root, 'Users', [homeFolder]),
        systemFolder,
      ]
    : [
        b.folder(root, 'Applications', installedApps, { system: true }),
        b.folder(root, 'Users', [homeFolder]),
        systemFolder,
        b.folder(root, 'Library', [], { system: true }),
      ];

  const rootNode: FileNode = {
    path: win ? 'C:' : '/',
    name: win ? 'Local Disk (C:)' : 'Macintosh HD',
    kind: 'folder',
    app: 'files',
    children: rootChildren,
    system: true,
    size: `${rootChildren.length} items`,
    modified: '2026-01-14 08:00',
  };

  /* ------------------------------------------------------- flat index */

  /**
   * path → node, for O(1) lookup by the window manager (a window persists only
   * a path, so it must be able to resolve one on rehydrate).
   *
   * ponytail: ~120 nodes, so `search` below is a linear scan over this map's
   * values. Move to a prebuilt index only if the tree grows past a few thousand
   * nodes — at this size a smarter structure costs more than the scan.
   */
  const index = new Map<string, FileNode>();
  const indexNode = (n: FileNode) => {
    index.set(n.path, n);
    n.children?.forEach(indexNode);
  };
  indexNode(rootNode);

  return {
    platform,
    sep: b.sep,
    root: rootNode,
    index,
    /** Well-known locations, so the shells never hard-code a path string. */
    paths: {
      root: rootNode.path,
      home,
      desktop,
      documents,
      downloads,
      pictures,
      music,
      videos,
      portfolio,
      apps: appsDir,
    },
  };
}

/* ------------------------------------------------------------ the two disks */

export type Disk = ReturnType<typeof buildTree>;

const DISKS: Record<Platform, Disk> = {
  windows: buildTree('windows'),
  mac: buildTree('mac'),
};

/** The complete filesystem for one platform. Each shell calls this once. */
export const getDisk = (platform: Platform): Disk => DISKS[platform];

/* --------------------------------------------------------------- operations */

/** Resolve a path to its node on the given disk, or undefined. */
export const lookup = (platform: Platform, path: string): FileNode | undefined =>
  DISKS[platform].index.get(path);

/** The parent directory of a path, or null at the root. */
export const parentPath = (platform: Platform, path: string): string | null => {
  const disk = DISKS[platform];
  if (path === disk.root.path) return null;
  const cut = path.lastIndexOf(disk.sep);
  if (cut <= 0) return disk.root.path;
  const parent = path.slice(0, cut);
  // "C:\Users" → cutting to "C:" must keep the drive's colon.
  return disk.index.has(parent) ? parent : disk.root.path;
};

/**
 * Case-insensitive substring match over names and text bodies.
 * Returns at most `limit` hits so a broad query can't flood the UI.
 */
export const search = (platform: Platform, query: string, limit = 40): FileNode[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: FileNode[] = [];
  /* Name matches first: someone typing "resume" wants the file, not every
     document that happens to mention the word. */
  const byBody: FileNode[] = [];
  for (const node of DISKS[platform].index.values()) {
    if (node.name.toLowerCase().includes(q)) hits.push(node);
    else if (node.body?.toLowerCase().includes(q)) byBody.push(node);
    if (hits.length >= limit) break;
  }
  return [...hits, ...byBody].slice(0, limit);
};

/** Breadcrumb segments for a path, root first. */
export const breadcrumbs = (platform: Platform, path: string): FileNode[] => {
  const disk = DISKS[platform];
  const trail: FileNode[] = [];
  let current: string | null = path;
  while (current) {
    const node: FileNode | undefined = disk.index.get(current);
    if (node) trail.unshift(node);
    current = parentPath(platform, current);
  }
  return trail;
};

/** Total bytes in a folder, recursively — the status bar's "size on disk". */
export const folderBytes = (node: FileNode): number =>
  node.kind === 'file'
    ? (node.bytes ?? 0)
    : (node.children ?? []).reduce((sum, c) => sum + folderBytes(c), 0);

/* ------------------------------------------------------------- self-check */

/**
 * Runnable check for the tree builder — the one piece here with real logic
 * (path joining, parent resolution, per-platform branching). Called from the
 * shells in dev only; a broken tree fails loudly at boot instead of silently
 * showing an empty Desktop.
 */
export const __selfCheck = () => {
  (['windows', 'mac'] as Platform[]).forEach((p) => {
    const disk = getDisk(p);
    console.assert(lookup(p, disk.paths.desktop) !== undefined, `${p}: Desktop missing`);
    console.assert(lookup(p, disk.paths.home) !== undefined, `${p}: home missing`);
    console.assert(
      lookup(p, disk.paths.portfolio) !== undefined,
      `${p}: Portfolio missing`,
    );
    projects.forEach((proj) =>
      console.assert(
        lookup(p, `${disk.paths.portfolio}${disk.sep}Projects${disk.sep}${proj.title}`) !==
          undefined,
        `${p}: project folder missing for ${proj.title}`,
      ),
    );
    // Parent of the home directory must resolve, and the root's parent must not.
    console.assert(parentPath(p, disk.paths.desktop) === disk.paths.home, `${p}: parent`);
    console.assert(parentPath(p, disk.root.path) === null, `${p}: root has no parent`);
    // Breadcrumbs must run root → leaf with no gaps.
    const crumbs = breadcrumbs(p, disk.paths.desktop);
    console.assert(crumbs[0].path === disk.root.path, `${p}: breadcrumb root`);
    console.assert(
      crumbs[crumbs.length - 1].path === disk.paths.desktop,
      `${p}: breadcrumb leaf`,
    );
    console.assert(search(p, 'resume').length > 0, `${p}: search found no resume`);
  });
};
