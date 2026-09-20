import { useEffect, useState, useCallback } from 'react';
import { Loader2, Search } from 'lucide-react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ArticleCard from '@/components/ArticleCard';
import ArticleDetail from '@/components/ArticleDetail';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import AdminPanel from '@/components/AdminPanel';
import { supabase, type Article } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/categories';

type View =
  | { type: 'home' }
  | { type: 'category'; category: string }
  | { type: 'article'; article: Article }
  | { type: 'search'; query: string }
  | { type: 'admin' };

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>({ type: 'home' });

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      setError('No pudimos cargar las noticias. Inténtalo de nuevo en un momento.');
    } else {
      setArticles(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const handleNavigateHome = () => setView({ type: 'home' });
  const handleNavigateCategory = (category: string) => setView({ type: 'category', category });
  const handleArticleClick = (article: Article) => setView({ type: 'article', article });
  const handleSearch = (query: string) => setView({ type: 'search', query });
  const handleNavigateAdmin = () => setView({ type: 'admin' });

  const featured = articles.filter((a) => a.featured);
  const nonFeatured = articles.filter((a) => !a.featured);

  const getFilteredArticles = () => {
    if (view.type === 'category') {
      return articles.filter((a) => a.category === view.category);
    }
    if (view.type === 'search') {
      const q = view.query.toLowerCase();
      return articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }
    return nonFeatured;
  };

  const getRelated = (article: Article) =>
    articles
      .filter((a) => a.category === article.category && a.id !== article.id)
      .slice(0, 3);

  const getTrending = () => [...articles].sort(() => 0.5 - Math.random()).slice(0, 5);

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <p className="text-stone-600 text-lg mb-4">{error}</p>
          <button
            onClick={fetchArticles}
            className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (view.type === 'article') {
      return (
        <ArticleDetail
          article={view.article}
          related={getRelated(view.article)}
          onBack={handleNavigateHome}
          onArticleClick={handleArticleClick}
        />
      );
    }

    const filtered = getFilteredArticles();
    const isHome = view.type === 'home';
    const title =
      view.type === 'category'
        ? view.category
        : view.type === 'search'
        ? `Resultados para "${view.query}"`
        : 'Últimas noticias';

    return (
      <>
        {isHome && featured.length > 0 && (
          <HeroSection featured={featured} onArticleClick={handleArticleClick} />
        )}

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-7 bg-emerald-600 rounded-full" />
                <h2 className="font-serif text-2xl font-bold text-stone-900">{title}</h2>
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search size={40} className="text-stone-300 mb-4" />
                  <p className="text-stone-500 text-lg">No se encontraron noticias.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filtered.map((article) => (
                    <ArticleCard key={article.id} article={article} onClick={handleArticleClick} />
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-32">
                <Sidebar trending={getTrending()} onArticleClick={handleArticleClick} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  if (view.type === 'admin') {
    return <AdminPanel onBack={handleNavigateHome} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        onNavigateHome={handleNavigateHome}
        onNavigateCategory={handleNavigateCategory}
        onSearch={handleSearch}
        onLogoClick={handleNavigateHome}
      />

      {/* Breaking news ticker */}
      {!loading && articles.length > 0 && view.type !== 'article' && (
        <div className="bg-emerald-600 text-white py-2 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider bg-white text-emerald-700 px-2 py-0.5 rounded flex-shrink-0">
              Última Hora
            </span>
            <div className="overflow-hidden flex-1">
              <div className="animate-marquee whitespace-nowrap text-sm">
                {articles.slice(0, 5).map((a, i) => (
                  <span key={a.id} className="inline-flex items-center">
                    {i > 0 && <span className="mx-3 text-emerald-300">•</span>}
                    {a.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">{renderMainContent()}</main>

      {/* Category quick links */}
      {view.type !== 'article' && !loading && !error && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleNavigateCategory(cat)}
                className="px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-full transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <Footer onNavigateHome={handleNavigateHome} onNavigateCategory={handleNavigateCategory} onNavigateAdmin={handleNavigateAdmin} />
    </div>
  );
}
