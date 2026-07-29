/**
 * The virtual filesystem behind /computer.
 *
 * Every node here is DERIVED from `src/data/content.ts` — the same source the
 * main site and the /cli terminal read. Nothing is copy-pasted, so editing a
 * project description in one place updates the homepage, the terminal and this
 * desktop's files together. That is the whole point of this module.
 *
 * The tree is built once at module scope (it depends only on static imports),
 * so opening a folder is a plain object lookup with no work per render.
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
import type { FileNode } from './types';

const GALLERY = [img1, img2, img3, img4, img5];

/* ------------------------------------------------------------------ helpers */

/** A text/markdown file that opens in the Reader. */
const doc = (
  path: string,
  name: string,
  body: string,
  icon = 'FileText',
): FileNode => ({
  path,
  name,
  kind: 'file',
  app: 'reader',
  icon,
  body: body.trim(),
  // Byte length of the payload, rendered as KB — a real number, not a fake one.
  size: `${(new Blob([body]).size / 1024).toFixed(1)} KB`,
  modified: '2026-07-29 14:02',
});

/** An image file that opens in the Image Viewer. */
const image = (path: string, name: string, src: string): FileNode => ({
  path,
  name,
  kind: 'file',
  app: 'image',
  icon: 'Image',
  src,
  size: '—',
  modified: '2026-06-11 09:31',
});

/** A shortcut that opens an external URL in a new tab instead of a window. */
const link = (path: string, name: string, href: string): FileNode => ({
  path,
  name,
  kind: 'file',
  app: 'reader',
  icon: 'ExternalLink',
  href,
  size: '1 KB',
  modified: '2026-07-29 14:02',
});

/** A folder. `app` is always `files`; children are ordered as given. */
const folder = (
  path: string,
  name: string,
  children: FileNode[],
  icon = 'Folder',
): FileNode => ({
  path,
  name,
  kind: 'folder',
  app: 'files',
  icon,
  children,
  size: `${children.length} items`,
  modified: '2026-07-29 14:02',
});

/* -------------------------------------------------------------- generated docs */

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

/* Joke config files — every desktop needs a ~/.config nobody asked for. */
const BASHRC = `
# ~/.bashrc — sourced for interactive shells

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

const NEOFETCH_CONF = `
# ~/.config/neofetch/config.conf

print_info() {
    info title
    info underline
    info "OS" distro
    info "Shell" shell
    info "Terminal" term
    info "CPU" cpu
    info "Memory" memory
    info "Coffee" coffee     # custom module, see below
    info "Motivation" mood   # reads 0 most Mondays
}

# ponytail: these modules are decorative; a real neofetch would shell out.
`;

const README_TXT = `
# README.txt

You found the desktop. Everything here is real data from the portfolio —
the same source that feeds the homepage and the /cli terminal.

Try:
  · Double-click a folder to open it
  · Drag windows by their titlebar
  · Switch OS from the panel (Windows / macOS / Fedora / Kali / Arch)
  · Open Settings to change the accent theme

Now playing: ${nowPlaying.track} — ${nowPlaying.artist}
`;

/* -------------------------------------------------------------------- the tree */

/** `~/Desktop` — the icons laid out on the wallpaper. */
export const DESKTOP: FileNode[] = [
  folder(
    '/home/aneesh/Desktop/Projects',
    'Projects',
    projects.map((p) =>
      folder(
        `/home/aneesh/Desktop/Projects/${p.title}`,
        p.title,
        [
          doc(
            `/home/aneesh/Desktop/Projects/${p.title}/README.md`,
            'README.md',
            projectReadme(p),
          ),
          image(
            `/home/aneesh/Desktop/Projects/${p.title}/preview.png`,
            'preview.png',
            p.image,
          ),
          link(`/home/aneesh/Desktop/Projects/${p.title}/live.url`, 'live.url', p.live),
          link(
            `/home/aneesh/Desktop/Projects/${p.title}/source.url`,
            'source.url',
            p.github,
          ),
        ],
        'FolderGit2',
      ),
    ),
    'FolderGit2',
  ),

  folder(
    '/home/aneesh/Desktop/Gallery',
    'Gallery',
    GALLERY.map((src, i) =>
      image(`/home/aneesh/Desktop/Gallery/${i + 1}.webp`, `${i + 1}.webp`, src),
    ),
    'FolderOpen',
  ),

  doc('/home/aneesh/Desktop/about.md', 'about.md', ABOUT_MD, 'User'),
  doc('/home/aneesh/Desktop/experience.md', 'experience.md', EXPERIENCE_MD, 'Briefcase'),
  doc('/home/aneesh/Desktop/skills.md', 'skills.md', SKILLS_MD, 'Layers'),
  doc('/home/aneesh/Desktop/contact.vcf', 'contact.vcf', CONTACT_VCF, 'Contact'),
  doc('/home/aneesh/Desktop/README.txt', 'README.txt', README_TXT, 'FileText'),

  /* The resume is a real PDF in /public — open it in a new tab rather than
     pretending to render a PDF viewer we don't have. */
  {
    path: '/home/aneesh/Desktop/resume.pdf',
    name: 'resume.pdf',
    kind: 'file',
    app: 'reader',
    icon: 'FileDown',
    href: personal.resume,
    size: '182 KB',
    modified: '2026-07-12 18:44',
  },

  /* Settings is an app, not a document — the desktop shortcut for it. */
  {
    path: '/home/aneesh/Desktop/settings',
    name: 'Settings',
    kind: 'file',
    app: 'settings',
    icon: 'Settings',
    size: '—',
    modified: '2026-07-29 14:02',
  },
];

/** The full home directory. The Files sidebar navigates this. */
export const ROOT: FileNode = folder('/home/aneesh', 'aneesh', [
  folder('/home/aneesh/Desktop', 'Desktop', DESKTOP),
  folder('/home/aneesh/Documents', 'Documents', [
    doc('/home/aneesh/Documents/about.md', 'about.md', ABOUT_MD, 'User'),
    doc(
      '/home/aneesh/Documents/experience.md',
      'experience.md',
      EXPERIENCE_MD,
      'Briefcase',
    ),
    doc('/home/aneesh/Documents/skills.md', 'skills.md', SKILLS_MD, 'Layers'),
  ]),
  folder(
    '/home/aneesh/Links',
    'Links',
    socials.map((s) => link(`/home/aneesh/Links/${s.label}.url`, `${s.label}.url`, s.href)),
    'Link',
  ),
  folder(
    '/home/aneesh/.config',
    '.config',
    [
      doc('/home/aneesh/.config/bashrc', '.bashrc', BASHRC, 'FileCode2'),
      doc('/home/aneesh/.config/neofetch.conf', 'neofetch.conf', NEOFETCH_CONF, 'FileCode2'),
    ],
    'FolderCog',
  ),
]);

/* --------------------------------------------------------------- flat index */

/**
 * path → node, for O(1) lookup by the window manager (a window persists only a
 * path, so it must be able to resolve one on rehydrate).
 *
 * ponytail: ~60 nodes, so search below is a linear scan over this map's values.
 * Move to a prebuilt trigram index in a Web Worker only if the tree ever grows
 * past a few thousand nodes — at this size the postMessage round-trip costs
 * strictly more than the scan.
 */
export const INDEX = new Map<string, FileNode>();

const indexNode = (n: FileNode) => {
  INDEX.set(n.path, n);
  n.children?.forEach(indexNode);
};
indexNode(ROOT);

/** Resolve a path to its node, or undefined if it does not exist. */
export const lookup = (path: string): FileNode | undefined => INDEX.get(path);

/**
 * Case-insensitive substring match over names and text bodies.
 * Returns at most `limit` hits so a broad query can't flood the UI.
 */
export const search = (query: string, limit = 40): FileNode[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: FileNode[] = [];
  for (const node of INDEX.values()) {
    if (
      node.name.toLowerCase().includes(q) ||
      node.body?.toLowerCase().includes(q)
    ) {
      hits.push(node);
      if (hits.length >= limit) break;
    }
  }
  return hits;
};

/** Breadcrumb segments for a path, e.g. "/home/aneesh/Desktop" → the 3 nodes. */
export const breadcrumbs = (path: string): FileNode[] => {
  const parts = path.split('/').filter(Boolean);
  const trail: FileNode[] = [];
  let acc = '';
  for (const part of parts) {
    acc += `/${part}`;
    const node = INDEX.get(acc);
    if (node) trail.push(node);
  }
  return trail;
};

/** Self-check: the derived tree must actually contain every source project. */
export const __selfCheck = () => {
  console.assert(lookup('/home/aneesh/Desktop') !== undefined, 'Desktop missing');
  projects.forEach((p) =>
    console.assert(
      lookup(`/home/aneesh/Desktop/Projects/${p.title}/README.md`) !== undefined,
      `README missing for ${p.title}`,
    ),
  );
  console.assert(search('reposage').length > 0, 'search found no RepoSage');
  console.assert(breadcrumbs('/home/aneesh/Desktop').length === 2, 'breadcrumb depth');
};
