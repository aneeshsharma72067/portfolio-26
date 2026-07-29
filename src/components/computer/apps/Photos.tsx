import { useState } from 'react';
import {
  Image as ImageIcon,
  Smartphone,
  Folder,
  Share2,
  Pin,
  Heart,
  Grid,
  Sliders,
  Maximize2,
  CheckCircle2,
  Layers,
  Sparkles,
  Search,
  Filter
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
  aspect?: string;
  favorite?: boolean;
};

const PHOTOS: PhotoItem[] = [
  { id: '1', title: 'Mountain Vista', src: img1, date: 'Jul 28, 2026', location: 'Alps, Switzerland', favorite: true },
  { id: '2', title: 'Urban Spectrum', src: img2, date: 'Jul 20, 2026', location: 'Tokyo, Japan', favorite: false },
  { id: '3', title: 'Golden Horizon', src: img3, date: 'Jun 14, 2026', location: 'Reykjavik, Iceland', favorite: true },
  { id: '4', title: 'Nocturnal Neon', src: img4, date: 'May 02, 2026', location: 'Seoul, Korea', favorite: false },
  { id: '5', title: 'Solitary Peak', src: img5, date: 'Apr 19, 2026', location: 'Banff, Canada', favorite: true },
];

export default function Photos() {
  const [selectedCategory, setSelectedCategory] = useState<'library' | 'iphone' | 'favorites'>('library');
  const [zoomLevel, setZoomLevel] = useState(3); // 1 to 5 scale
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    '1': true,
    '3': true,
    '5': true
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectPhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const displayedPhotos = PHOTOS.filter(p => {
    if (selectedCategory === 'favorites') return favorites[p.id];
    return true;
  });

  // Calculate dynamic grid columns based on zoom slider
  const getGridColsClass = () => {
    switch (zoomLevel) {
      case 1: return 'grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5';
      case 2: return 'grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2';
      case 3: return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3';
      case 4: return 'grid-cols-2 sm:grid-cols-3 gap-4';
      case 5: return 'grid-cols-1 sm:grid-cols-2 gap-6';
      default: return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3';
    }
  };

  return (
    <div className="flex h-full text-xs select-none overflow-hidden bg-transparent" style={{ color: 'var(--os-chrome-text)', fontFamily: "'SF Pro', -apple-system, sans-serif" }}>
      {/* ══════════════════════════════════════════════ Sidebar (macOS Photos Navigation) */}
      <div className="w-48 border-r border-[var(--os-border)] bg-black/10 shrink-0 flex flex-col p-2.5 gap-4 overflow-y-auto">
        {/* Main Section */}
        <div className="space-y-0.5">
          <button
            onClick={() => setSelectedCategory('library')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-colors ${
              selectedCategory === 'library'
                ? 'bg-[#0058d0] text-white font-semibold'
                : 'hover:bg-white/5 text-white/80'
            }`}
          >
            <ImageIcon size={15} />
            <span>Library</span>
          </button>

          <button
            onClick={() => setSelectedCategory('favorites')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-colors ${
              selectedCategory === 'favorites'
                ? 'bg-[#0058d0] text-white font-semibold'
                : 'hover:bg-white/5 text-white/80'
            }`}
          >
            <Heart size={15} />
            <span>Favorites</span>
          </button>
        </div>

        {/* Devices Section */}
        <div>
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-2 mb-1">Devices</div>
          <button
            onClick={() => setSelectedCategory('iphone')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left transition-colors ${
              selectedCategory === 'iphone'
                ? 'bg-[#0058d0] text-white font-semibold'
                : 'hover:bg-white/5 text-white/80'
            }`}
          >
            <Smartphone size={15} />
            <span className="truncate">Aneesh's iPhone</span>
          </button>
        </div>

        {/* Pinned / Albums Section */}
        <div>
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-2 mb-1">Albums</div>
          <div className="space-y-0.5">
            {['Recents', 'Imports', 'Shared', 'Favorites'].map(name => (
              <button
                key={name}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left text-white/70 hover:bg-white/5 transition-colors"
              >
                <Folder size={14} className="text-sky-400 opacity-80" />
                <span>{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Media Types */}
        <div>
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-2 mb-1">Media Types</div>
          <div className="space-y-0.5 text-white/60">
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px]">
              <span>Videos</span>
              <span className="text-[10px] opacity-40">0</span>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px]">
              <span>Selfies</span>
              <span className="text-[10px] opacity-40">2</span>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px]">
              <span>Panoramas</span>
              <span className="text-[10px] opacity-40">5</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════ Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navigation / Control Toolbar */}
        <div className="h-10 border-b border-[var(--os-border)] flex items-center justify-between px-4 shrink-0 bg-black/5">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white text-xs">
              {selectedCategory === 'iphone' ? "Import from Aneesh's iPhone" : selectedCategory === 'favorites' ? 'Favorites' : 'Library'}
            </span>
            <span className="text-[11px] opacity-40">({displayedPhotos.length} Photos)</span>
          </div>

          {/* Right Toolbar Options (Zoom slider + Import controls) */}
          <div className="flex items-center gap-3">
            {/* macOS Zoom Slider */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/20 rounded-md border border-white/10">
              <span className="text-[10px] opacity-60">-</span>
              <input
                type="range"
                min="1"
                max="5"
                value={zoomLevel}
                onChange={e => setZoomLevel(Number(e.target.value))}
                className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#0058d0]"
              />
              <span className="text-[10px] opacity-60">+</span>
            </div>

            {selectedIds.length > 0 ? (
              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1 bg-[#0058d0] text-white font-medium rounded-md text-[11px] hover:bg-[#0048aa] transition-colors"
              >
                Import Selected ({selectedIds.length})
              </button>
            ) : (
              <button
                className="px-2.5 py-1 bg-white/10 text-white/80 font-medium rounded-md text-[11px] hover:bg-white/15 transition-colors"
              >
                Import All ({displayedPhotos.length})
              </button>
            )}
          </div>
        </div>

        {/* Photos Grid Container */}
        <div className="flex-1 p-4 overflow-y-auto min-h-0 bg-black/5">
          <div className={`grid ${getGridColsClass()}`}>
            {displayedPhotos.map((photo) => {
              const isSelected = selectedIds.includes(photo.id);
              const isFav = favorites[photo.id];
              return (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer border transition-all ${
                    isSelected ? 'border-[#0058d0] ring-2 ring-[#0058d0]' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Top-right overlay selection indicator */}
                  <button
                    onClick={(e) => toggleSelectPhoto(photo.id, e)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <CheckCircle2
                      size={14}
                      className={isSelected ? 'text-[#0058d0] fill-white' : 'text-white/70'}
                    />
                  </button>

                  {/* Favorite toggle overlay */}
                  <button
                    onClick={(e) => toggleFavorite(photo.id, e)}
                    className={`absolute bottom-1.5 left-1.5 p-1 rounded-full backdrop-blur-md transition-opacity ${
                      isFav ? 'opacity-100 bg-rose-500/80' : 'opacity-0 group-hover:opacity-100 bg-black/40'
                    }`}
                  >
                    <Heart
                      size={12}
                      className={isFav ? 'text-white fill-white' : 'text-white'}
                    />
                  </button>

                  {/* Photo Title Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-[11px] font-semibold text-white truncate">{photo.title}</div>
                    <div className="text-[9px] text-white/60 truncate">{photo.location}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="h-6 border-t border-[var(--os-border)] px-4 flex items-center justify-between text-[10px] opacity-60 shrink-0 bg-black/10">
          <span>{displayedPhotos.length} Photos, 0 Videos</span>
          <span>Updated Just Now</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════ Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-black/40"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.title}
              className="max-h-[75vh] w-auto object-contain mx-auto"
            />
            <div className="p-3 bg-neutral-900/90 flex items-center justify-between text-xs text-white border-t border-white/10">
              <div>
                <div className="font-semibold text-sm">{selectedPhoto.title}</div>
                <div className="text-[10px] opacity-60">{selectedPhoto.location} · {selectedPhoto.date}</div>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-3 py-1 bg-white/10 rounded-md hover:bg-white/20 transition-colors text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
