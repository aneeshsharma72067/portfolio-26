/**
 * Icon registry for the virtual filesystem.
 *
 * `fs.ts` stores an icon NAME (a plain string), not a component, so the
 * filesystem module stays free of React/lucide imports and can be exercised in
 * bare node. This map is the single resolution point; an unknown name falls back
 * to a generic file glyph instead of throwing.
 *
 * It lives outside the components so both `Desktop` and `Files` can import it
 * without tripping react-refresh's "components only" rule.
 */
import {
  Briefcase,
  Contact,
  ExternalLink,
  FileCode2,
  FileDown,
  FileText,
  Folder,
  FolderCog,
  FolderGit2,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  Settings as SettingsIcon,
  User,
  type LucideIcon,
} from 'lucide-react';

export const ICONS: Record<string, LucideIcon> = {
  Briefcase,
  Contact,
  ExternalLink,
  FileCode2,
  FileDown,
  FileText,
  Folder,
  FolderCog,
  FolderGit2,
  FolderOpen,
  Image: ImageIcon,
  Layers,
  Link: LinkIcon,
  Settings: SettingsIcon,
  User,
};

export const resolveIcon = (name: string): LucideIcon => ICONS[name] ?? FileText;
