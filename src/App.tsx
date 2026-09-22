import { useEffect, useState, useCallback } from 'react';
import { ArrowDown, Loader2, Search } from 'lucide-react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ArticleCard from '@/components/ArticleCard';
import ArticleDetail from '@/components/ArticleDetail';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import AdminPanel from '@/components/AdminPanel';
import AuthorProfile from '@/components/AuthorProfile';
import { isSupabaseConfigured, supabase, type Article, type Author } from '@/lib/supabase';
import { CATEGORIES, CATEGORY_SLUGS, SLUG_TO_CATEGORY } from '@/lib/categories';
import { mapAuthorProfile, type AuthorProfile as AuthorProfileData } from '@/lib/authors';

type View =
  | { type: 'home' }
  | { type: 'category'; category: string }
  | { type: 'article'; article: Article }
  | { type: 'author'; authorName: string }
  | { type: 'search'; query: string }
  | { type: 'admin' };

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<Record<string, AuthorProfileData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>({ type: 'home' });

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setError('Falta configurar Supabase. Añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en un archivo .env.local.');
      setLoading(false);
      return;
    }

    let result = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (result.error?.code === '42703') {
      result = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });
    }

    if (result.error) {
      setError('No pudimos cargar las noticias. Inténtalo de nuevo en un momento.');
    } else {
      setArticles((result.data ?? []).map((article) => ({ ...article, status: article.status ?? 'published' })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArticles();
    supabase
      .from('authors')
      .select('*')
      .order('name')
      .then(({ data }) => {
        const authorMap = (data as Author[] | null ?? []).reduce<Record<string, AuthorProfileData>>((map, author) => {
          map[author.name] = mapAuthorProfile(author);
          return map;
        }, {});
        setAuthors(authorMap);
      });
  }, [fetchArticles]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pathname = window.location.pathname;

    const authorMatch = pathname.match(/^\/autor\/([^/]+)$/);
    if (authorMatch) {
      const slug = decodeURIComponent(authorMatch[1]);
      const authorName = Object.keys(authors).find((name) => {
        const candidate = name.toLowerCase().trim();
        return candidate.replace(/\s+/g, '-') === slug;
      }) ?? decodeURIComponent(slug).replace(/-/g, ' ');

      if (authorName) {
        setView((current) => {
          if (current.type === 'author' && current.authorName === authorName) {
            return current;
          }
          return { type: 'author', authorName };
        });
      }
      return;
    }

    const categoryMatch = pathname.match(/^\/categoria\/([^/]+)$/);
    if (categoryMatch) {
      const slug = decodeURIComponent(categoryMatch[1]);
      const category = SLUG_TO_CATEGORY[slug];
      if (category) {
        setView((current) => {
          if (current.type === 'category' && current.category === category) {
            return current;
          }
          return { type: 'category', category };
        });
      }
      return;
    }

    const articleMatch = pathname.match(/^\/noticia\/([^/]+)$/);
    if (articleMatch) {
      const slug = decodeURIComponent(articleMatch[1]);
      const articleFromUrl = articles.find((item) => item.slug === slug);
      if (articleFromUrl) {
        setView((current) => {
          if (current.type === 'article' && current.article.id === articleFromUrl.id) {
            return current;
          }
          return { type: 'article', article: articleFromUrl };
        });
      }
    }
  }, [articles, authors]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentPath = window.location.pathname;

    if (view.type === 'article') {
      const nextPath = `/noticia/${encodeURIComponent(view.article.slug)}`;
      if (currentPath !== nextPath) {
        window.history.pushState({}, '', nextPath);
      }
      return;
    }

    if (view.type === 'category') {
      const nextPath = `/categoria/${CATEGORY_SLUGS[view.category] ?? view.category}`;
      if (currentPath !== nextPath) {
        window.history.pushState({}, '', nextPath);
      }
      return;
    }

    if (view.type === 'author') {
      const nextPath = `/autor/${encodeURIComponent(view.authorName.toLowerCase().replace(/\s+/g, '-'))}`;
      if (currentPath !== nextPath) {
        window.history.pushState({}, '', nextPath);
      }
      return;
    }

    if (currentPath.startsWith('/noticia/') || currentPath.startsWith('/categoria/') || currentPath.startsWith('/autor/')) {
      window.history.pushState({}, '', '/');
    }
  }, [view]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const description = view.type === 'article'
      ? view.article.excerpt || view.article.title
      : 'Viento Sur ofrece noticias, análisis y reportajes del sur del continente con rigor editorial.';

    const title = view.type === 'article'
      ? `${view.article.title} | Viento Sur`
      : 'Viento Sur | Noticias del sur del continente';

    document.title = title;

    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, selector.includes('name') ? 'description' : 'og:description');
        if (selector.includes('property')) {
          element.setAttribute('property', selector.replace('meta[property="', '').replace('"]', ''));
        }
        document.head.appendChild(element);
      }
      element.setAttribute(
        selector.includes('name') ? 'content' : 'content',
        value
      );
    };

    const metaDescription = document.head.querySelector('meta[name="description"]') ?? document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute('content', description);
    if (!document.head.contains(metaDescription)) {
      document.head.appendChild(metaDescription);
    }

    const ogTitle = document.head.querySelector('meta[property="og:title"]') ?? document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', title);
    if (!document.head.contains(ogTitle)) {
      document.head.appendChild(ogTitle);
    }

    const ogDescription = document.head.querySelector('meta[property="og:description"]') ?? document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', description);
    if (!document.head.contains(ogDescription)) {
      document.head.appendChild(ogDescription);
    }

    const ogImage = document.head.querySelector('meta[property="og:image"]') ?? document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    ogImage.setAttribute('content', view.type === 'article' ? view.article.image_url : 'https://images.unsplash.com/...');
    if (!document.head.contains(ogImage)) {
      document.head.appendChild(ogImage);
    }

    const twitterTitle = document.head.querySelector('meta[name="twitter:title"]') ?? document.createElement('meta');
    twitterTitle.setAttribute('name', 'twitter:title');
    twitterTitle.setAttribute('content', title);
    if (!document.head.contains(twitterTitle)) {
      document.head.appendChild(twitterTitle);
    }

    const twitterDescription = document.head.querySelector('meta[name="twitter:description"]') ?? document.createElement('meta');
    twitterDescription.setAttribute('name', 'twitter:description');
    twitterDescription.setAttribute('content', description);
    if (!document.head.contains(twitterDescription)) {
      document.head.appendChild(twitterDescription);
    }

    const twitterImage = document.head.querySelector('meta[name="twitter:image"]') ?? document.createElement('meta');
    twitterImage.setAttribute('name', 'twitter:image');
    twitterImage.setAttribute('content', view.type === 'article' ? view.article.image_url : 'https://images.unsplash.com/...');
    if (!document.head.contains(twitterImage)) {
      document.head.appendChild(twitterImage);
    }
  }, [view]);

  const handleNavigateHome = () => setView({ type: 'home' });
  const handleNavigateCategory = (category: string) => setView({ type: 'category', category });
  const handleArticleClick = (article: Article) => {
    const nextArticle = { ...article, views: (article.views ?? 0) + 1 };
    setView({ type: 'article', article: nextArticle });
    supabase.rpc('increment_article_views', { article_id: article.id }).then(() => undefined);
  };
  const handleAuthorClick = (authorName: string) => setView({ type: 'author', authorName });
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
          onAuthorClick={handleAuthorClick}
          authorProfile={authors[view.article.author]}
        />
      );
    }

    if (view.type === 'author') {
      const authorArticles = articles.filter((article) => article.author === view.authorName);
      return (
        <AuthorProfile
          authorName={view.authorName}
          articles={authorArticles}
          onBack={handleNavigateHome}
          onArticleClick={handleArticleClick}
          profile={authors[view.authorName]}
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
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onClick={handleArticleClick}
                      onAuthorClick={handleAuthorClick}
                    />
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
      {!loading && articles.length > 0 && view.type !== 'article' && view.type !== 'author' && (
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
      {view.type !== 'article' && view.type !== 'author' && !loading && !error && (
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

      <button
        type="button"
        onClick={() => document.getElementById('site-footer')?.scrollIntoView({ behavior: 'smooth' })}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-500 active:scale-95 md:hidden"
        aria-label="Bajar al pie de página"
        title="Bajar al pie de página"
      >
        <ArrowDown size={22} />
      </button>

      <Footer onNavigateHome={handleNavigateHome} onNavigateCategory={handleNavigateCategory} onNavigateAdmin={handleNavigateAdmin} />
    </div>
  );
}
