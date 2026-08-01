/**
 * Windows icon artwork, resolved in one place.
 *
 * Kept out of the components so the taskbar, the desktop grid, the Start menu
 * and File Explorer all show the same picture for the same thing, and so adding
 * an icon is a one-line change here rather than four edits in four files.
 *
 * WINDOWS-ONLY — macOS resolves its own art in `mac/macIcons.ts`.
 */
import type { AppId, FileNode } from '@/os/types';

import explorerIcon from '@/assets/image/icons/windows/explorer.png';
import folderIcon from '@/assets/image/icons/windows/folder.png';
import docsIcon from '@/assets/image/icons/windows/docs.png';
import homeIcon from '@/assets/image/icons/windows/home.png';
import picsIcon from '@/assets/image/icons/windows/pics-sm.png';
import binIcon from '@/assets/image/icons/windows/bin0.png';
import infoIcon from '@/assets/image/icons/windows/info.png';
import appsIcon from '@/assets/image/icons/windows/Apps.webp';
import thisPcIcon from '@/assets/image/icons/windows/thispc-sm.png';

export const WIN_ICONS = {
  explorer: explorerIcon,
  folder: folderIcon,
  docs: docsIcon,
  home: homeIcon,
  pics: picsIcon,
  bin: binIcon,
  info: infoIcon,
  apps: appsIcon,
  thisPc: thisPcIcon,
};

/**
 * Icon for a running/pinned app, used by the taskbar and Start menu.
 *
 * The apps without bespoke Windows artwork (Terminal, Task Manager, Calculator)
 * reuse the closest stock glyph rather than shipping a wrong-looking PNG; the
 * taskbar draws those with a coloured tile instead — see `WinTaskbar`.
 */
export const winAppIcon = (app: AppId): string => {
  switch (app) {
    case 'files':
      return explorerIcon;
    case 'settings':
      return appsIcon;
    case 'photos':
    case 'image':
      return picsIcon;
    case 'notes':
      return docsIcon;
    case 'trash':
      return binIcon;
    case 'taskmgr':
      return thisPcIcon;
    case 'terminal':
    case 'calc':
      return appsIcon;
    default:
      return docsIcon;
  }
};

/**
 * Icon for a filesystem node, used by the desktop grid and File Explorer.
 *
 * Order matters: an app launcher (`.exe`/`.lnk`) must win over its generic
 * extension, and an image file must win over the plain document glyph.
 */
export const winNodeIcon = (node: FileNode): string => {
  if (node.kind === 'folder') return folderIcon;
  // App launchers show the app's own icon, so Program Files reads correctly.
  if (node.ext === 'exe') return winAppIcon(node.app);
  if (node.ext === 'image') return picsIcon;
  if (node.ext === 'link') return infoIcon;
  if (node.ext === 'dll') return thisPcIcon;
  if (node.ext === 'pdf') return docsIcon;
  return docsIcon;
};

/** Human label for the Explorer "Type" column. */
export const winTypeLabel = (node: FileNode): string => {
  if (node.kind === 'folder') return 'File folder';
  switch (node.ext) {
    case 'exe':
      return 'Application';
    case 'dll':
      return 'Application extension';
    case 'image':
      return 'Image file';
    case 'link':
      return 'Internet shortcut';
    case 'pdf':
      return 'PDF document';
    case 'md':
      return 'Markdown file';
    case 'vcf':
      return 'Contact file';
    case 'log':
      return 'Log file';
    default:
      return 'Text document';
  }
};
