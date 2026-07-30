/**
 * macOS icon artwork, resolved in one place.
 *
 * Kept out of the components so the dock, the desktop and Finder all show the
 * same picture for the same thing.
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

/** Icon for a running/pinned app, used by the dock. */
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

/** Icon for a filesystem node, used by the desktop and Finder. */
export const macNodeIcon = (node: FileNode): string => {
  if (node.app === 'settings') return settingsFolderIcon;
  if (node.kind === 'folder') return folderIcon;
  return fileIcon;
};
