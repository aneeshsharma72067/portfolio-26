import { useState } from 'react';
import {
  Image as ImageIcon,
  Folder,
  Heart,
  Grid,
  Maximize2,
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Trash2,
  Share2,
  Info,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

import img1 from '@/assets/image/gallery/1.webp';
import img2 from '@/assets/image/gallery/2.webp';
import img3 from '@/assets/image/gallery/3.webp';
import img4 from '@/assets/image/gallery/4.webp';
import img5 from '@/assets/image/gallery/5.webp';

type PhotoItem = {
  id: string;
  title: string;
  src: string;
  date: string;
  location: string;
  favorite?: boolean;
};

const PHOTOS: PhotoItem[] = [
  { id: '1', title: 'Mountain Vista.png', src: img1, date: '7/28/2026', location: 'Alps, Switzerland', favorite: true },
  { id: '2', title: 'Urban Spectrum.png', src: img2, date: '7/20/2026', location: 'Tokyo, Japan', favorite: false },
  { id: '3', title: 'Golden Horizon.png', src: img3, date: '6/14/2026', location: 'Reykjavik, Iceland', favorite: true },
  { id: '4', title: 'Nocturnal Neon.png', src: img4, date: '5/2/2026', location: 'Seoul, Korea', favorite: false },
  { id: '5', title: 'Solitary Peak.png', src: img5, date: '4/19/2026', location: 'Banff, Canada', favorite: true },
];

export default function WinPhotos() {
  const [selectedNav, setSelectedNav] = useState<'all' | 'favorites' | 'folders'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    '1': true,
    '3': true,
    '5': true,
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const displayedPhotos = PHOTOS.filter((p) => {
    if (selectedNav === 'favorites') return favorites[p.id];
    return true;
  });

  return (
    <div
      className="flex h-full flex-col select-none overflow-hidden bg-[#202020] text-white"
      style={{ fontFamily: "'Segoe UI Variable', 'Segoe UI', sans-serif" }}
    >
      {/* ══════════════════════════════════════════════ Windows 11 Photos Top Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#1f1f1f] px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-[#60cdff]" />
            <span className="text-sm font-semibold text-white">Photos</span>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1 border border-white/10 text-xs">
            <button
              onClick={() => setSelectedNav('all')}
              className={`rounded px-3 py-1 transition-colors ${
                selectedNav === 'all' ? 'bg-[#0078d4] text-white font-medium' : 'text-white/70 hover:bg-white/5'
              }`}
            >
              All photos
            </button>
            <button
              onClick={() => setSelectedNav('favorites')}
              className={`rounded px-3 py-1 transition-colors ${
                selectedNav === 'favorites' ? 'bg-[#0078d4] text-white font-medium' : 'text-white/70 hover:bg-white/5'
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => setSelectedNav('folders')}
              className={`rounded px-3 py-1 transition-colors ${
                selectedNav === 'folders' ? 'bg-[#0078d4] text-white font-medium' : 'text-white/70 hover:bg-white/5'
              }`}
            >
              Folders
            </button>
          </div>
        </div>

        {/* Command Controls */}
        <div className="flex items-center gap-2 text-xs text-white/70">
          <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-white/10 transition-colors">
            <Filter size={14} />
            <span>Filter</span>
          </button>
          <span className="text-white/20">|</span>
          <span className="text-xs text-white/50">{displayedPhotos.length} items</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════ Photos Gallery View */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#181818]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayedPhotos.map((photo) => {
            const isFav = favorites[photo.id];
            return (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border border-white/10 bg-black/40 hover:border-[#60cdff] transition-all hover:shadow-lg"
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Favorite Heart Button Overlay */}
                <button
                  onClick={(e) => toggleFavorite(photo.id, e)}
                  className={`absolute top-2 right-2 p-1.5 rounded-md backdrop-blur-md transition-opacity ${
                    isFav ? 'bg-rose-600/90 text-white opacity-100' : 'bg-black/40 text-white/70 opacity-0 group-hover:opacity-100 hover:text-white'
                  }`}
                  title="Favorite"
                >
                  <Heart size={13} className={isFav ? 'fill-white' : ''} />
                </button>

                {/* Windows 11 Bottom Info Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-[12px] font-medium text-white truncate">{photo.title}</div>
                  <div className="text-[10px] text-white/60">{photo.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════ Windows Photos Lightbox View */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex flex-col justify-between p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Lightbox Toolbar */}
          <div
            className="flex h-12 items-center justify-between px-4 bg-[#202020]/90 border border-white/10 rounded-xl max-w-4xl mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">{selectedPhoto.title}</span>
              <span className="text-xs text-white/50">{selectedPhoto.date}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => toggleFavorite(selectedPhoto.id, e)}
                className={`p-2 rounded-md hover:bg-white/10 transition-colors ${
                  favorites[selectedPhoto.id] ? 'text-rose-500' : 'text-white/70'
                }`}
              >
                <Heart size={16} className={favorites[selectedPhoto.id] ? 'fill-rose-500' : ''} />
              </button>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="ml-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md text-xs font-medium text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* Main Image View */}
          <div
            className="flex-1 flex items-center justify-center p-4 my-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.title}
              className="max-h-[75vh] max-w-full rounded-lg shadow-2xl object-contain border border-white/10"
            />
          </div>

          {/* Lightbox Bottom Info */}
          <div
            className="flex h-10 items-center justify-center px-4 bg-[#202020]/90 border border-white/10 rounded-xl max-w-xl mx-auto w-full text-xs text-white/60"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{selectedPhoto.location}</span>
          </div>
        </div>
      )}
    </div>
  );
}
