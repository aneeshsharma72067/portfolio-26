/**
 * macOS icon artwork, resolved in one place.
 *
 * Kept out of the components so the dock, the desktop, Spotlight and Finder all
 * show the same picture for the same thing.
 *
 * macOS-ONLY — Windows resolves its own art in `windows/winIcons.ts`.
 */
import type { AppId, FileNode } from '@/os/types';

import finderIcon from '@/assets/image/icons/macos/finder.png';
import settingsIcon from '@/assets/image/icons/macos/settings.png';
import settingsFolderIcon from '@/assets/image/icons/macos/settings-folder.png';
import photosIcon from '@/assets/image/icons/macos/photos.png';
import notesIcon from '@/assets/image/icons/macos/notes.png';
import folderIcon from '@/assets/image/icons/macos/folder.png';
import fileIcon from '@/assets/image/icons/macos/file.png';
import githubIcon from '@/assets/image/icons/macos/github.png';

export const MAC_ICONS = {
  finder: finderIcon,
  settings: settingsIcon,
  photos: photosIcon,
  notes: notesIcon,
  folder: folderIcon,
  file: fileIcon,
  github: githubIcon,
};

/**
 * Icon for a running/pinned app, used by the dock.
 *
 * Terminal, Activity Monitor, Calculator and Trash have no stock PNG here, so
 * the dock draws them as CSS tiles instead of forcing a wrong-looking image —
 * see `MacDock`. This resolver returns the generic file icon for those, which
 * is only ever used as a fallback.
 */
export const macAppIcon = (app: AppId): string => {
  switch (app) {
    case 'files':
      return finderIcon;
    case 'settings':
      return settingsIcon;
    case 'photos':
    case 'image':
      return photosIcon;
    case 'notes':
      return notesIcon;
    default:
      return fileIcon;
  }
};

/** True when the dock/desktop should draw a CSS tile rather than a PNG. */
export const macHasArtwork = (app: AppId): boolean =>
  ['files', 'settings', 'photos', 'image', 'notes'].includes(app);

/** Icon for a filesystem node, used by the desktop and Finder. */
export const macNodeIcon = (node: FileNode): string => {
  if (node.kind === 'folder') return folderIcon;
  if (node.ext === 'exe') return node.app === 'settings' ? settingsFolderIcon : macAppIcon(node.app);
  if (node.ext === 'image') return photosIcon;
  return fileIcon;
};

/** Human label for Finder's "Kind" column. */
export const macKindLabel = (node: FileNode): string => {
  if (node.kind === 'folder') return 'Folder';
  switch (node.ext) {
    case 'exe':
      return 'Application';
    case 'dll':
      return 'Dynamic library';
    case 'image':
      return 'WebP image';
    case 'link':
      return 'Web internet location';
    case 'pdf':
      return 'PDF document';
    case 'md':
      return 'Markdown text';
    case 'vcf':
      return 'vCard';
    default:
      return 'Plain text document';
  }
};
