/**
 * Windows icon artwork, resolved in one place.
 *
 * Kept out of the components so the taskbar, the desktop grid and File Explorer
 * all show the same picture for the same thing, and so adding an icon is a
 * one-line change here rather than three edits in three files.
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

export const WIN_ICONS = {
  explorer: explorerIcon,
  folder: folderIcon,
  docs: docsIcon,
  home: homeIcon,
  pics: picsIcon,
  bin: binIcon,
  info: infoIcon,
  apps: appsIcon,
};

/** Icon for a running/pinned app, used by the taskbar and Start menu. */
export const winAppIcon = (app: AppId): string => {
  switch (app) {
    case 'files':
      return explorerIcon;
    case 'settings':
      return appsIcon;
    case 'photos':
      return picsIcon;
    case 'image':
      return picsIcon;
    case 'notes':
      return docsIcon;
    default:
      return docsIcon;
  }
};

/** Icon for a filesystem node, used by the desktop grid and File Explorer. */
export const winNodeIcon = (node: FileNode): string => {
  if (node.app === 'settings') return appsIcon;
  if (node.kind === 'folder') return folderIcon;
  if (node.app === 'image') return picsIcon;
  if (node.name.endsWith('.url')) return infoIcon;
  return docsIcon;
};
