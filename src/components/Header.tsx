import { useEffect, useState } from 'react';
import { Search, Menu, X, Wind } from 'lucide-react';
import { CATEGORIES, CATEGORY_SLUGS } from '@/lib/categories';

type HeaderProps = {
  onNavigateHome: () => void;
  onNavigateCategory: (category: string) => void;
  onSearch: (query: string) => void;
  onLogoClick: () => void;
};

export default function Header({ onNavigateHome, onNavigateCategory, onSearch, onLogoClick }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-stone-900 text-stone-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-8">
          <span className="hidden sm:inline">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span className="sm:hidden">Noticias Viento Sur</span>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline">Edición Digital</span>
            <span className="text-emerald-400 font-semibold">EN VIVO</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div
        className={`transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-stone-700 hover:text-emerald-600 transition-colors"
              aria-label="Menú"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <button
              onClick={onLogoClick}
              className="flex items-center gap-2 group"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Wind size={22} className="text-white" />
                </div>
              </div>
              <div className="text-left leading-none">
                <div className="font-serif text-xl font-bold text-stone-900 tracking-tight">
                  Viento Sur
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 font-semibold mt-0.5">
                  Noticias
                </div>
              </div>
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={onNavigateHome}
                className="px-3 py-2 text-sm font-medium text-stone-700 hover:text-emerald-600 transition-colors rounded-md hover:bg-emerald-50"
              >
                Portada
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onNavigateCategory(cat)}
                  className="px-3 py-2 text-sm font-medium text-stone-700 hover:text-emerald-600 transition-colors rounded-md hover:bg-emerald-50"
                >
                  {cat}
                </button>
              ))}
            </nav>

            {/* Search */}
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center">
                <div
                  className={`flex items-center transition-all duration-300 overflow-hidden ${
                    searchOpen ? 'w-48' : 'w-0'
                  }`}
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar noticias..."
                    className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-l-md focus:outline-none focus:border-emerald-500"
                    autoFocus={searchOpen}
                  />
                </div>
                <button
                  type="submit"
                  className="p-2 text-stone-600 hover:text-emerald-600 transition-colors border-y border-r border-stone-300 rounded-r-md"
                  style={{ borderLeft: searchOpen ? 'none' : '1px solid #d6d3d1' }}
                >
                  <Search size={18} />
                </button>
              </form>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 text-stone-600 hover:text-emerald-600 transition-colors"
                aria-label="Buscar"
              >
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white">
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              <button
                onClick={() => {
                  onNavigateHome();
                  setMobileOpen(false);
                }}
                className="px-3 py-2.5 text-left text-sm font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-md transition-colors"
              >
                Portada
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onNavigateCategory(cat);
                    setMobileOpen(false);
                  }}
                  className="px-3 py-2.5 text-left text-sm font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-md transition-colors"
                >
                  {cat}
                </button>
              ))}
              <form onSubmit={handleSearchSubmit} className="mt-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar noticias..."
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:border-emerald-500"
                />
              </form>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
